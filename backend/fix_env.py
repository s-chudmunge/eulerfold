import re

with open('.env', 'r') as f:
    content = f.read()

# Extract everything from VERTEX_CREDENTIALS_JSON={ to the closing }
match = re.search(r'VERTEX_CREDENTIALS_JSON=(\{.*?\})', content, re.DOTALL)
if match:
    json_str = match.group(1)
    # Remove newlines and spaces, or just json.dumps(json.loads(json_str))
    import json
    try:
        parsed = json.loads(json_str)
        compact_json = json.dumps(parsed)
        # Replace the multi-line with single quote wrapped single-line
        new_env = content[:match.start()] + f"VERTEX_CREDENTIALS_JSON='{compact_json}'\n" + content[match.end():]
        with open('.env', 'w') as f:
            f.write(new_env)
        print("Fixed .env file")
    except Exception as e:
        print("Error parsing JSON:", e)
else:
    print("VERTEX_CREDENTIALS_JSON not found in expected format")
