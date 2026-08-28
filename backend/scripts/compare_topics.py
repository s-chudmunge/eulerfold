import csv
import os

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

# Load existing topics from CSV
existing_topics = set()
try:
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            existing_topics.add(row['topic'].lower().strip())
except FileNotFoundError:
    pass

# Roadmap.sh Frontend Topics
roadmap_topics = [
    "How does the Internet work",
    "What is HTTP",
    "How Browsers Work",
    "DNS (Domain Name System)",
    "Semantic HTML",
    "Web Accessibility (a11y)",
    "SEO Basics",
    "CSS Box Model",
    "CSS Flexbox",
    "CSS Grid",
    "Responsive Web Design",
    "DOM Manipulation",
    "Fetch API and AJAX",
    "JavaScript ES6+",
    "Event Bubbling and Capturing",
    "JavaScript Closures and Scope",
    "JavaScript Prototypes",
    "Git and GitHub Basics",
    "Package Managers (npm/yarn/pnpm)",
    "Vite",
    "Webpack",
    "ESLint and Prettier",
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "Tailwind CSS",
    "Styled Components",
    "CSS Modules",
    "Sass / SCSS",
    "TypeScript",
    "Jest",
    "Cypress",
    "Playwright",
    "Next.js",
    "Nuxt.js",
    "Astro",
    "GraphQL",
    "WebSockets",
    "Progressive Web Apps (PWAs)",
    "Service Workers",
    "Web Storage API"
]

missing_topics = []
for topic in roadmap_topics:
    # Partial match check (e.g. if 'react' is in 'react basics')
    topic_lower = topic.lower()
    found = False
    for ext in existing_topics:
        if topic_lower in ext or ext in topic_lower or "react" in topic_lower and "react" in ext and "basics" in ext:
            # We have some advanced heuristic or just simple substring
            found = True
            break
    if not found:
        missing_topics.append(topic)

print("MISSING TOPICS:")
for m in missing_topics:
    print("-", m)
