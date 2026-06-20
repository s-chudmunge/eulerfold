import re

filepath = '/home/sankalp/Documents/projects/eulerfold/frontend/src/components/landing/GenerateFromSyllabus.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add imports
if 'AiEngineSelector' not in content:
    content = content.replace("import PaymentModal from '../PaymentModal';", 
                              "import PaymentModal from '../PaymentModal';\nimport AiEngineSelector from '@/components/settings/AiEngineSelector';\nimport { CreateMLCEngine } from '@mlc-ai/web-llm';\nimport { jsonrepair } from 'jsonrepair';\nimport { logAIUsage } from '@/components/job-decoded/JobDecodedGenerator';")

# Add state variables
state_vars = """
  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState(false);

  useEffect(() => {
    setOpenRouterKey(localStorage.getItem('openrouter_key'));
    setUseOpenRouter(localStorage.getItem('use_openrouter') === 'true');
    setOpenRouterModel(localStorage.getItem('openrouter_model') || 'openai/gpt-4o');

    setLocalAIModelId(localStorage.getItem('local_ai_model'));
    setUseLocalAI(localStorage.getItem('use_local_ai') === 'true');
    
    const handleStorageChange = () => {
        setOpenRouterKey(localStorage.getItem('openrouter_key'));
        setUseOpenRouter(localStorage.getItem('use_openrouter') === 'true');
        setOpenRouterModel(localStorage.getItem('openrouter_model') || 'openai/gpt-4o');
        setLocalAIModelId(localStorage.getItem('local_ai_model'));
        setUseLocalAI(localStorage.getItem('use_local_ai') === 'true');
    };
    window.addEventListener('ai_settings_changed', handleStorageChange);
    return () => window.removeEventListener('ai_settings_changed', handleStorageChange);
  }, []);
"""

if 'openRouterKey' not in content:
    content = content.replace('const [isParsingPdf, setIsParsingPdf] = useState(false);', 
                              'const [isParsingPdf, setIsParsingPdf] = useState(false);\n' + state_vars)

# Fix API logic
submit_logic = """
    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are an instructional designer. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;
    const userPrompt = `Your task is to convert a static course syllabus into a rigorous learning roadmap.

**SYLLABUS:**
${formData.syllabus_text}

**CONSTRAINTS:**
Duration: ${formData.time_value} weeks.

**RULES:**
1. **Logical Progression:** Structure modules from foundational technical gaps to advanced implementation.
2. **Technical Rigor:** Prioritize hard skills, tools, and theoretical knowledge required for the role.
3. **Specific Topics:** Each module must have 3-5 specific topics. Avoid generic titles like "Introduction to X". Use industry-standard technical terms.
4. **Practical Outcomes:** The \`proof_of_work_instructions\` must describe a realistic technical task or project that demonstrates competency in that module's specific skills.
5. **Applied Knowledge:** Ensure the user learns not just what a tool is, but how to apply it.
6. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
7. **Output JSON ONLY** matching this schema:
   {
     "title": "string", 
     "description": "Concise description (max 2 sentences).",
     "modules": [
       {
         "title": "string",
         "outcome": "One punchy sentence on the specific technical competency achieved.",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         },
         "topics": [
           { "title": "string", "subtopics": [ { "title": "string" } ] }
         ],
         "optimal_search_query": "string"
       }
     ]
   }`;

    try {
      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\\n\\n${userPrompt}`;

        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 8192
        };

        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "EulerFold AI"
          },
          body: JSON.stringify(requestBody)
        });

        const orData = await orResponse.json();

        if (!orResponse.ok) {
           throw new Error(orData.error?.message || "OpenRouter generation failed.");
        }

        let generatedText = orData.choices[0].message?.content || "";
        let cleanedText = generatedText.replace(/<think>[\\s\\S]*?<\\/think>/gi, "").trim();

        const jsonBlockMatch = cleanedText.match(/```(?:json)?\\s*([\\s\\S]*?)```/i);
        if (jsonBlockMatch && jsonBlockMatch[1]) cleanedText = jsonBlockMatch[1].trim();
        
        const roadmapPlan = JSON.parse(jsonrepair(cleanedText));

        const backendPayload = {
          subject: roadmapPlan.title || 'Syllabus Roadmap',
          goal: formData.syllabus_text.substring(0, 200),
          time_value: formData.time_value,
          time_unit: 'weeks',
          roadmap_plan: roadmapPlan,
          model: openRouterModel || 'openai/gpt-4o',
          is_syllabus: true
        };

        const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
        onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });

      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback: (r) => console.log(r.text) });
          
          const response = await engine.chat.completions.create({
            messages: [
              { role: "system", content: "You are a strict JSON data generator. Reply ONLY with valid JSON." },
              { role: "user", content: userPrompt + "\\nCRITICAL: Output ONLY a raw JSON object." }
            ],
            max_tokens: 8192,
          });
          
          let generatedText = response.choices[0].message.content || '';
          let cleanedText = generatedText.trim();
          if (cleanedText.startsWith("```json")) cleanedText = cleanedText.replace(/^```json\\n?/, "").replace(/```$/, "");
          else if (cleanedText.startsWith("```")) cleanedText = cleanedText.replace(/^```\\n?/, "").replace(/```$/, "");

          const parsedJSON = JSON.parse(jsonrepair(cleanedText));

          const backendPayload = {
            subject: parsedJSON.title || 'Syllabus Roadmap',
            goal: formData.syllabus_text.substring(0, 200),
            time_value: formData.time_value,
            time_unit: 'weeks',
            roadmap_plan: parsedJSON,
            model: localAIModelId,
            is_syllabus: true
          };

          const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
          onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        const res = await roadmapsAPI.generateFromSyllabus({
          syllabus_text: formData.syllabus_text,
          time_value: formData.time_value,
          time_unit: 'weeks'
        });
        onRoadmapGenerated(res as any, formData);
      }
    } catch (err: any) {
"""

if 'if (!((openRouterKey && useOpenRouter)' not in content:
    # replace the entire handleSubmit try-catch logic
    # Find the start of `if (credits !== null && credits < 1)`
    content = re.sub(r'if \(credits !== null && credits < 1\).*?catch \(err: any\) \{', submit_logic + '      if (err.response?.status === 402) {', content, flags=re.DOTALL)


# Add UI
if '<AiEngineSelector />' not in content:
    content = content.replace('</form>\n    </div>', '</form>\n      <AiEngineSelector />\n    </div>')


# Add the export for logAIUsage in JobDecodedGenerator
with open('/home/sankalp/Documents/projects/eulerfold/frontend/src/components/job-decoded/JobDecodedGenerator.tsx', 'r') as f:
    jd_content = f.read()

jd_content = jd_content.replace('const logAIUsage = async', 'export const logAIUsage = async')
with open('/home/sankalp/Documents/projects/eulerfold/frontend/src/components/job-decoded/JobDecodedGenerator.tsx', 'w') as f:
    f.write(jd_content)

with open('/home/sankalp/Documents/projects/eulerfold/frontend/src/lib/api.ts', 'r') as f:
    api_ts = f.read()
if 'import api ' not in content:
    content = content.replace("import { supabase } from '@/lib/supabase/client';", "import { supabase } from '@/lib/supabase/client';\nimport api from '@/lib/api';")

with open(filepath, 'w') as f:
    f.write(content)

print("Patched GenerateFromSyllabus")
