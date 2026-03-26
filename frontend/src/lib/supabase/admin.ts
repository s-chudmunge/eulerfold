import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cache the client instance to avoid re-creation on every call
let cachedSupabaseAdmin: SupabaseClient | null = null;

const getSupabaseAdminClient = (): SupabaseClient => {
  if (cachedSupabaseAdmin) {
    return cachedSupabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    cachedSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return cachedSupabaseAdmin;
  } else {
    console.warn(
      "Supabase admin configuration is missing. Admin operations will be disabled."
    );

    const disabledOperation = (methodName: string) => {
      throw new Error(
        `Supabase admin operation "${methodName}" is disabled due to missing configuration.`
      );
    };

    // Create a proxy that intercepts all property access and method calls
    cachedSupabaseAdmin = new Proxy({} as SupabaseClient, {
      get: (target, prop, receiver) => {
        console.error(
          `Attempted to access property or method '${String(
            prop
          )}' via disabled Supabase admin client. Admin operations are unavailable.`
        );
        if (prop === 'from') {
          return (tableName: string) => {
            console.error(`Attempted to access table '${tableName}' via disabled Supabase admin client.`);
            return new Proxy({}, { get: () => () => disabledOperation(`from(${tableName})`) });
          };
        } else if (prop === 'auth') {
          return new Proxy({}, { get: (authTarget, authProp) => {
            console.error(`Attempted to access auth method '${String(authProp)}' via disabled Supabase admin client.`);
            return () => disabledOperation(`auth.${String(authProp)}`);
          }});
        }
        return () => disabledOperation(String(prop));
      },
      apply: (target, thisArg, argumentsList) => {
        disabledOperation("direct function call on SupabaseAdmin mock");
      },
    });
    return cachedSupabaseAdmin;
  }
};

export { getSupabaseAdminClient };