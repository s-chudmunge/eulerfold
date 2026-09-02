import asyncio, json
from dotenv import dotenv_values
from supabase import create_client
from app.utils.youtube_client import search_youtube_videos

config = dotenv_values('backend/.env')
sb = create_client(config.get('SUPABASE_URL'), config.get('SUPABASE_SERVICE_KEY'))

# Fetch roadmap 1571
res = sb.table('roadmaps').select('*').eq('id', 1571).execute()
if not res.data:
    print('Roadmap 1571 not found!')
    exit(1)

roadmap = res.data[0]
plan = roadmap.get('roadmap_plan')
if isinstance(plan, str):
    plan = json.loads(plan)

subject_context = roadmap.get('title', 'Feynman Path Integrals')

print(f"Re-enriching Roadmap: {roadmap.get('title')}")

MODULE_RESOURCES = {
    0: [
        {
            'title': 'MIT 8.04: Quantum Physics I Lecture Notes (Wave Mechanics & Duality)',
            'url': 'https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/pages/lecture-notes/',
            'type': 'article'
        },
        {
            'title': 'Stanford Physics: Double Slit & Quantum Foundations Notes',
            'url': 'https://quantum-history.library.stanford.edu/feynman-path-integrals',
            'type': 'article'
        }
    ],
    1: [
        {
            'title': 'David Tong: Cambridge Lectures on Classical Dynamics (Lagrangian Mechanics PDF)',
            'url': 'http://www.damtp.cam.ac.uk/user/tong/dynamics.html',
            'type': 'article'
        },
        {
            'title': 'Feynman Lectures on Physics, Vol. II: The Principle of Least Action',
            'url': 'https://www.feynmanlectures.caltech.edu/II_19.html',
            'type': 'article'
        }
    ],
    2: [
        {
            'title': 'David Tong: Cambridge Lectures on Quantum Field Theory (Path Integrals Chapter PDF)',
            'url': 'http://www.damtp.cam.ac.uk/user/tong/qft.html',
            'type': 'article'
        },
        {
            'title': 'Feynman & Hibbs: Quantum Mechanics and Path Integrals (Foundational Excerpt)',
            'url': 'https://www.damtp.cam.ac.uk/user/tong/qft/two.pdf',
            'type': 'article'
        }
    ],
    3: [
        {
            'title': 'MIT 8.06: Quantum Physics III (Path Integrals in Statistical Mechanics & QFT)',
            'url': 'https://ocw.mit.edu/courses/8-06-quantum-physics-iii-spring-2018/pages/lecture-notes/',
            'type': 'article'
        },
        {
            'title': 'Perimeter Institute: Advanced Quantum Path Integrals & Instantons',
            'url': 'https://perimeterinstitute.ca/research/quantum-fields-and-strings',
            'type': 'article'
        }
    ]
}

CLEAN_QUERIES = {
    'Wave-Particle Duality': 'wave particle duality de broglie matter waves derivation',
    'Schrödinger Equation': 'schrodinger wave equation derivation quantum mechanics',
    'Uncertainty Principle': 'heisenberg uncertainty principle quantum mechanics operator derivation',
    'Double-Slit Experiment': 'double slit experiment quantum interference electrons derivation',
    'Lagrangian Function': 'lagrangian mechanics kinetic potential energy derivation',
    'Euler-Lagrange Equations': 'euler lagrange equations calculus of variations derivation',
    'Action Principle': 'principle of least action stationary action classical mechanics',
    "Hamilton's Principle": 'hamiltons principle of least action classical mechanics',
    'Path Integral Formulation': 'feynman path integral formulation quantum mechanics derivation',
    'Propagator Function': 'quantum propagator feynman path integral calculation derivation',
    'Free Particle Path Integral': 'free particle path integral propagator Gaussian integration',
    'Path Integral for Harmonic Oscillator': 'quantum harmonic oscillator path integral derivation',
    'Quantum Tunneling': 'quantum tunneling path integral instanton calculation',
    'Quantum Field Theory': 'path integral formulation quantum field theory functional integral',
    'Path Integrals in Statistical Mechanics': 'path integral formulation statistical mechanics imaginary time Wick rotation',
    'Advanced Path Integral Techniques': 'path integral semiclassical approximation stationary phase method'
}

async def re_enrich():
    used_video_ids = set()
    modules = plan.get('modules', [])
    
    for m_idx, module in enumerate(modules):
        mod_title = module.get('title', '')
        print(f"\n=== Module {m_idx+1}: {mod_title} ===")
        
        # Attach high-caliber reading resources
        if m_idx in MODULE_RESOURCES:
            module['resources'] = MODULE_RESOURCES[m_idx]
            module['recommended_resources'] = [
                {'title': r['title'], 'search_query': r['title']}
                for r in MODULE_RESOURCES[m_idx]
            ]
        
        for t_idx, topic in enumerate(module.get('topics', [])):
            title = topic.get('title')
            clean_q = CLEAN_QUERIES.get(title, f"{title} quantum mechanics lecture")
            topic['youtube_search_query'] = clean_q
            
            results = await search_youtube_videos(
                clean_q,
                max_results=3,
                topic_title=title,
                strict_official_sources=False,
                subject_context=subject_context,
                exclude_video_ids=used_video_ids
            )
            
            if results:
                best = results[0]
                topic['youtube_video_id'] = best['video_id']
                topic['youtube_video_title'] = best['video_title']
                topic['duration'] = best.get('duration_minutes', 15)
                used_video_ids.add(best['video_id'])
                print(f"  ✓ Topic {t_idx+1}: {title:32} -> '{best['video_title']}' [{best['video_id']}]")
            else:
                print(f"  ✗ Topic {t_idx+1}: {title:32} -> No video")
    
    # Save back to Supabase
    sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', 1571).execute()
    print('\nSuccessfully updated Roadmap 1571 in Supabase!')

asyncio.run(re_enrich())
