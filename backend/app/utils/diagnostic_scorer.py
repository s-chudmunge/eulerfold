import json

def build_knowledge_profile(session_id, mapped_domains, responses) -> dict:
    profile = {}
    
    # Group responses by domain
    domain_responses = {}
    for resp in responses:
        domain = resp.get("domain_slug")
        if domain not in domain_responses:
            domain_responses[domain] = []
        domain_responses[domain].append(resp)
        
    for domain_mapping in mapped_domains:
        domain = domain_mapping.get("domain_slug")
        if domain not in profile:
            profile[domain] = {
                "level": "beginner",
                "known_concepts": [],
                "misconceptions": [],
                "gaps": []
            }
            
    for domain, resps in domain_responses.items():
        if domain not in profile:
            profile[domain] = {
                "level": "beginner",
                "known_concepts": [],
                "misconceptions": [],
                "gaps": []
            }
            
        tiers_passed = set()
        tiers_failed = set()
        
        for r in resps:
            tier = r.get("tier")
            is_correct = r.get("is_correct")
            concepts = r.get("concepts_tested", [])
            
            if is_correct:
                tiers_passed.add(tier)
                profile[domain]["known_concepts"].extend(concepts)
            else:
                tiers_failed.add(tier)
                profile[domain]["gaps"].extend(concepts)
                misc_detected = r.get("misconception_detected")
                if misc_detected:
                    profile[domain]["misconceptions"].append({
                        "id": misc_detected,
                        "question_id": r.get("question_id")
                    })
                    
        # Level logic
        if 1 in tiers_failed or (1 not in tiers_passed and 1 not in tiers_failed):
            profile[domain]["level"] = "beginner"
        elif 1 in tiers_passed and 2 not in tiers_passed and 2 not in tiers_failed:
            profile[domain]["level"] = "foundational"
        elif 1 in tiers_passed and 2 in tiers_failed:
            profile[domain]["level"] = "foundational"
        elif 1 in tiers_passed and 2 in tiers_passed and 3 not in tiers_passed and 3 not in tiers_failed:
            profile[domain]["level"] = "intermediate"
        elif 1 in tiers_passed and 2 in tiers_passed and 3 in tiers_failed:
            profile[domain]["level"] = "intermediate"
        elif 1 in tiers_passed and 2 in tiers_passed and 3 in tiers_passed:
            profile[domain]["level"] = "advanced"
            
        # Deduplicate
        profile[domain]["known_concepts"] = list(set(profile[domain]["known_concepts"]))
        profile[domain]["gaps"] = list(set(profile[domain]["gaps"]))

    # Generate prompt context
    prompt_lines = ["The learner has the following knowledge profile:"]
    for domain, data in profile.items():
        level = data["level"].capitalize()
        known = ", ".join(data["known_concepts"]) if data["known_concepts"] else "No prior knowledge"
        gaps = ", ".join(data["gaps"]) if data["gaps"] else "None identified"
        misc = ", ".join([m["id"] for m in data["misconceptions"]]) if data["misconceptions"] else "None"
        
        line = f"- {domain.capitalize()}: {level}. "
        if known != "No prior knowledge":
            line += f"Knows {known}. "
        else:
            line += "No prior knowledge. "
            
        if misc != "None":
            line += f"Has a misconception about {misc}. "
            
        if gaps != "None identified":
            line += f"Gaps: {gaps}."
        prompt_lines.append(line.strip())
        
    prompt_lines.append("Generate a course that skips concepts they know, addresses misconceptions early, and builds from their level.")
    
    return {
        "profile": profile,
        "prompt_context": "\n".join(prompt_lines)
    }
