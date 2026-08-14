import os
import asyncio
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv("backend/.env")

import sys
sys.path.append("backend")

from app.utils.emails.base import send_email
from app.utils.emails.newsletter import build_newsletter_email
from app.core.config import settings

async def main():
    content = """
    <p>Meta’s timing lines up with a friendlier Trump administration stance, too. Open-weight models are reportedly being excused from the voluntary pre-release <a href="https://www.wsj.com/tech/ai/white-house-to-roll-out-ai-safety-rules-for-federal-agencies-d5f0b5d5">safety testing framework the White House</a> has been cooking up, according to <i>The Wall Street Journal</i>.</p>
    
    <p>Closed models from OpenAI, Google, and Anthropic don’t get the same pass if they cross certain capability thresholds.</p>
    
    <p><a href="https://about.meta.com/newsroom/">Zuckerberg</a> used his blog post to hammer this point home, arguing that any policy slowing American releases, even by a month, hands the advantage to foreign labs. US Secretary of the Treasury, Scott Bessent, chimed in on X too, <b>calling Muse Glimmer a win for American innovation.</b></p>
    
    <h3>But does Meta actually need this to win?</h3>
    
    <p>Not exactly. <a href="https://ai.meta.com/blog/">Meta doesn't need every developer picking Muse over GPT-5.6 or Claude.</a> It just needs to stay in the conversation when people decide what to fine-tune and deploy.</p>
    
    <p>When Meta first introduced the Llama series, it was a watershed moment for the AI industry. It proved that open-weights could compete with proprietary models, kicking off an ecosystem of fine-tunes, local inference tools, and sprawling open-source innovation. But as the frontier advanced, competitors aggressively scaled, and the gap widened. The Llama moment faded as developers flocked back to the convenience of closed APIs offering superior performance.</p>

    <p>Now, with their latest strategic shifts and model architectures, Meta is attempting a course correction. They are signaling that the era of closed dominance is not absolute. By doubling down on aggressive weight releases, massive hardware investments, and vocal policy advocacy, Meta is trying to claw back that developer goodwill.</p>

    <p>The developer ecosystem is notoriously fickle. If Meta can provide models that are "good enough" for production workloads without the subscription tax of API-first companies, they might just achieve their goal. It’s less about winning every benchmark and more about becoming the default starting point for enterprise AI experimentation.</p>

    <p>That's a lower bar, and it's the right one.</p>
    """

    html = await build_newsletter_email(
        title="Meta Wants Its Llama Moment Back",
        subtitle="Zuckerberg has a type. And it's called 'open weights, please love us again'.",
        author="Sankalp",
        hero_image_url="https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
        content_html=content,
        unsubscribe_link="https://www.eulerfold.com/unsubscribe"
    )

    result = await send_email(
        to="jukeask@gmail.com",
        subject="Meta Wants Its Llama Moment Back",
        html=html,
        sender=f"Sankalp from EulerFold <{settings.RESEND_SENDER}>",
        reply_to="eulerfold@gmail.com"
    )
    print("Email sent!", result)

if __name__ == "__main__":
    asyncio.run(main())
