import re

filepath = '/home/sankalp/Documents/projects/eulerfold/frontend/src/components/landing/KnowledgeGapQuiz.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add imports
if 'AiEngineSelector' not in content:
    content = content.replace("import PaymentModal from '../PaymentModal';", 
                              "import PaymentModal from '../PaymentModal';\nimport AiEngineSelector from '@/components/settings/AiEngineSelector';\nimport { CreateMLCEngine } from '@mlc-ai/web-llm';\nimport { jsonrepair } from 'jsonrepair';\nimport api from '@/lib/api';")

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
    content = content.replace('const [quizAnswers, setQuizAnswers] = useState<number[]>([]);', 
                              'const [quizAnswers, setQuizAnswers] = useState<number[]>([]);\n' + state_vars)

# Fix handleStartQuiz
start_quiz_logic = """
    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const systemPrompt = "You are a technical subject matter expert. Output JSON ONLY.";
    const userPrompt = `The user is aspiring to be a "${formData.target_role}".
They already know: "${formData.known_skills}".

Your goal is to generate 5 Multiple Choice Questions (MCQs) that test their knowledge on ADVANCED or MISSING concepts required for ${formData.target_role} that they might NOT know yet. 
Do not test them on what they already know.

CRITICAL QUALITY STANDARDS:
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall.
- Focus on application of principles.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice`;

    try {
      let quizData = [];
      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\\n\\n${userPrompt}`;
        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 4096
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
        if (!orResponse.ok) throw new Error(orData.error?.message || "OpenRouter generation failed.");
        let generatedText = orData.choices[0].message?.content || "";
        let cleanedText = generatedText.replace(/<think>[\\s\\S]*?<\\/think>/gi, "").trim();
        const jsonBlockMatch = cleanedText.match(/```(?:json)?\\s*([\\s\\S]*?)```/i);
        if (jsonBlockMatch && jsonBlockMatch[1]) cleanedText = jsonBlockMatch[1].trim();
        const parsed = JSON.parse(jsonrepair(cleanedText));
        quizData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback: (r) => console.log(r.text) });
          const response = await engine.chat.completions.create({
            messages: [
              { role: "system", content: "You are a strict JSON data generator. Reply ONLY with valid JSON." },
              { role: "user", content: userPrompt + "\\nCRITICAL: Output ONLY a raw JSON array of objects." }
            ],
            max_tokens: 4096,
          });
          let generatedText = response.choices[0].message.content || '';
          let cleanedText = generatedText.trim();
          if (cleanedText.startsWith("```json")) cleanedText = cleanedText.replace(/^```json\\n?/, "").replace(/```$/, "");
          else if (cleanedText.startsWith("```")) cleanedText = cleanedText.replace(/^```\\n?/, "").replace(/```$/, "");
          const parsed = JSON.parse(jsonrepair(cleanedText));
          quizData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        quizData = await roadmapsAPI.generateDiagnosticQuiz({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          question_count: 5
        });
      }
      setQuizQuestions(quizData);
      setQuizAnswers(new Array(quizData.length).fill(null));
      setQuizActive(true);
      setCurrentQuizIdx(0);
    } catch (err: any) {
"""

if 'if (!((openRouterKey && useOpenRouter)' not in content:
    content = re.sub(r'setIsGenerating\(true\);\s*setError\(null\);\s*try \{\s*const quiz = await roadmapsAPI\.generateDiagnosticQuiz\(\{.*?\}\);\s*setQuizQuestions\(quiz\);\s*setQuizAnswers\(new Array\(quiz\.length\)\.fill\(null\)\);\s*setQuizActive\(true\);\s*setCurrentQuizIdx\(0\);\s*\} catch \(err: any\) \{', start_quiz_logic, content, flags=re.DOTALL)


submit_quiz_logic = """
    setIsGenerating(true);
    setQuizActive(false);
    setError(null);

    const failedQuestions = quizQuestions.filter((q, i) => quizAnswers[i] !== q.correct_answer_index);
    let weak_skills = "User passed all diagnostic questions.";
    if (failedQuestions.length > 0) {
      weak_skills = "Failed to understand: " + failedQuestions.map(q => q.question).join(" | ");
    }

    const systemPrompt = `You are a technical mentor. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;
    const userPrompt = `The user wants to become a "${formData.target_role}".
They are already proficient in: "${formData.known_skills}"
However, they struggle with or failed diagnostics on: "${weak_skills}"

Generate a ${formData.time_value} week learning roadmap that COMPLETELY SKIPS the known skills.
Strictly focus the entire roadmap on bridging the gap in their weak areas.

**RULES:**
1. **Logical Progression:** Structure modules to bridge the gap.
2. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard technical terms.
3. **Practical Outcomes:** The proof_of_work_instructions must describe a realistic technical task that demonstrates competency.
4. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
5. **Output JSON ONLY** matching this schema:
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
          subject: roadmapPlan.title || 'Skill Gap Roadmap',
          goal: `Fill gaps: ${weak_skills}`,
          time_value: formData.time_value,
          time_unit: 'weeks',
          roadmap_plan: roadmapPlan,
          model: openRouterModel || 'openai/gpt-4o',
          is_job_decoded: false
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
            subject: parsedJSON.title || 'Skill Gap Roadmap',
            goal: `Fill gaps: ${weak_skills}`,
            time_value: formData.time_value,
            time_unit: 'weeks',
            roadmap_plan: parsedJSON,
            model: localAIModelId,
            is_job_decoded: false
          };

          const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
          onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        const res = await roadmapsAPI.generateFromGaps({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          weak_skills: weak_skills,
          time_value: formData.time_value,
          time_unit: 'weeks'
        });
        onRoadmapGenerated(res as any, formData);
      }
    } catch (err: any) {
"""

if 'const systemPrompt = `You are a technical mentor.' not in content:
    content = re.sub(r'setIsGenerating\(true\);\s*setQuizActive\(false\);\s*setError\(null\);\s*try \{\s*const failedQuestions.*?onRoadmapGenerated\(res as any, formData\);\s*\} catch \(err: any\) \{', submit_quiz_logic, content, flags=re.DOTALL)


# Add UI
if '<AiEngineSelector />' not in content:
    content = content.replace('</form>\n    </div>', '</form>\n      <AiEngineSelector />\n    </div>')

with open(filepath, 'w') as f:
    f.write(content)

print("Patched KnowledgeGapQuiz.tsx")
