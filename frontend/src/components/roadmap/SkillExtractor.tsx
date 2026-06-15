'use client';

import React, { useEffect, useState, useRef } from 'react';
import { RoadmapData, roadmapsAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { Loader } from 'lucide-react';
import { logAIUsage } from '@/lib/usageTracker';

export default function SkillExtractor({ roadmap, onComplete }: { roadmap: RoadmapData, onComplete?: () => void }) {
    const [status, setStatus] = useState<string>('Preparing learning path...');
    const extracting = useRef(false);

    useEffect(() => {
        console.log(`[SkillExtractor] Mounted. roadmap.skills_extracted: ${roadmap.skills_extracted}, extracting.current: ${extracting.current}`);
        if (roadmap.skills_extracted || extracting.current) return;
        
        const extract = async () => {
            console.log("[SkillExtractor] Starting extraction flow...");
            extracting.current = true;
            try {
                // 1. Get user inventory
                console.log("[SkillExtractor] Fetching user session...");
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    console.log("[SkillExtractor] No session found.");
                    return;
                }
                
                console.log("[SkillExtractor] Fetching user skills inventory...");
                const { data: skillsData } = await supabase
                    .from('user_skills')
                    .select('canonical_skills(name, category)')
                    .eq('user_id', session.user.id);
                    
                const inventory = skillsData?.map(s => {
                    const cs = s.canonical_skills as any;
                    return cs ? `${cs.name} (${cs.category})` : null;
                }).filter(Boolean) || [];
                
                const inventoryText = inventory.length > 0 ? inventory.join(', ') : "None (New User)";
                console.log("[SkillExtractor] Inventory prepared.");

                // 2. Prepare flat topics
                const flatTopics: any[] = [];
                roadmap.roadmap_plan?.modules?.forEach((m: any, mIdx: number) => {
                    m.topics?.forEach((t: any, tIdx: number) => {
                        flatTopics.push({ id: `${mIdx + 1}-${tIdx}`, title: t.title || t });
                    });
                });

                // 3. Prompt
                const systemPrompt = `You are a senior technical architect. Your task is to map roadmap topics to technical skills.

USER'S EXISTING TECHNICAL INVENTORY:
[${inventoryText}]

MISSIONS:
1. Map each topic below to exactly ONE canonical skill name (e.g., 'Game Physics', 'Python', 'React').
2. **IMPORTANT:** If a topic genuinely belongs to a skill already in the user's inventory, use that EXACT name and category.
3. **CRITICAL:** DO NOT force a topic into an existing skill if the domain is fundamentally different. Create a NEW, highly accurate skill name instead.
4. Assign a 'depth' score (1.0 to 5.0) for each skill based on the topics in THIS roadmap.

DEPTH SCORING RULES:
- 1.0 to 1.5: Fundamentals, syntax, basic concepts.
- 2.0 to 3.0: Standard professional usage and patterns.
- 4.0 to 5.0: Expert level, architecture, and complex optimization.

Return ONLY valid JSON:
{
  "mappings": [
    { "topic_id": "1-0", "canonical_skill": "Skill Name", "category": "Category" }
  ],
  "skill_depths": {
    "Skill Name": 2.5
  }
}

Topics:
${JSON.stringify(flatTopics)}`;

                // 4. Generate
                const openRouterKey = localStorage.getItem('openRouterKey');
                const localAIModelId = localStorage.getItem('localAIModelId');
                
                let extractedJson: any = null;

                if (openRouterKey) {
                    setStatus('AI is analyzing topics...');
                    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${openRouterKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "EulerFold AI"
                        },
                        body: JSON.stringify({
                            model: localStorage.getItem('openRouterModel') || 'openai/gpt-4o',
                            messages: [{ role: "system", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const orData = await orResponse.json();
                    let content = orData.choices[0].message.content;
                    extractedJson = JSON.parse(content);
                    
                    // Log usage
                    try {
                        await logAIUsage({
                            subject: 'Skill Extraction',
                            model: localStorage.getItem('openRouterModel') || 'openai/gpt-4o',
                            prompt_tokens: orData.usage?.prompt_tokens || 0,
                            completion_tokens: orData.usage?.completion_tokens || 0,
                            total_tokens: orData.usage?.total_tokens || 0,
                            source: 'OpenRouter'
                        });
                    } catch (e) {
                        console.error('Failed to log AI usage', e);
                    }
                } else if (localAIModelId) {
                    setStatus('Local AI is analyzing topics...');
                    const engine = await CreateMLCEngine(localAIModelId);
                    const response = await engine.chat.completions.create({
                        messages: [{ role: "user", content: systemPrompt }]
                    });
                    let content = response.choices[0].message.content || '';
                    let cleanedText = content.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const startIdx = cleanedText.indexOf('{');
                    const endIdx = cleanedText.lastIndexOf('}');
                    if (startIdx !== -1 && endIdx !== -1) {
                        cleanedText = cleanedText.substring(startIdx, endIdx + 1);
                    }
                    extractedJson = JSON.parse(cleanedText);
                    
                    // Log usage for local AI
                    try {
                        await logAIUsage({
                            subject: 'Skill Extraction',
                            model: localAIModelId,
                            prompt_tokens: response.usage?.prompt_tokens || 0,
                            completion_tokens: response.usage?.completion_tokens || 0,
                            total_tokens: response.usage?.total_tokens || 0,
                            source: 'LocalAI'
                        });
                    } catch (e) {
                        console.error('Failed to log AI usage', e);
                    }
                } else {
                    setStatus('No AI engine configured.');
                    return;
                }

                // 5. Sync to Backend
                if (extractedJson && extractedJson.mappings) {
                    setStatus('Saving progress...');
                    await roadmapsAPI.syncRoadmapSkills(roadmap.id, extractedJson);
                    setStatus('Ready to learn!');
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 2000);
                }

            } catch (err) {
                console.error("Skill extraction failed:", err);
                setStatus('Failed to extract skills');
            }
        };

        extract();
    }, [roadmap, onComplete]);

    if (roadmap.skills_extracted || status === 'Ready to learn!') return null;

    return (
        <div className="fixed bottom-4 right-4 bg-sidebar border border-border p-3 rounded-lg shadow-xl flex items-center gap-3 text-[11px] appropriate-sans text-text-muted z-50">
            {status !== 'Failed to extract skills' && status !== 'No AI engine configured.' && (
                <Loader className="w-4 h-4 animate-spin text-accent" />
            )}
            <span>{status}</span>
        </div>
    );
}
