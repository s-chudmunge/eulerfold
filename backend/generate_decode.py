import asyncio
from app.core.supabase_client import get_supabase_client
from app.routers.research_lab import run_research_analysis

async def main():
    sb = get_supabase_client()
    uid = 'dbc27bc9-f0be-4233-964e-67fb51747a00'
    email = 'reachsankalp21@gmail.com'
    paper_url = "https://arxiv.org/pdf/1706.03762"
    
    # 1. Ensure user has pro or credits (give 10 credits)
    sb.table("profiles").update({"roadmap_credits": 10, "is_pro": True}).eq("supabase_uid", uid).execute()
    
    # 2. Insert into decodes
    new_decode = {
        "user_id": uid,
        "email": email,
        "paper_url": paper_url,
        "status": "pending"
    }
    
    ins_res = sb.table("research_lab_decodes").insert(new_decode).execute()
    decode_id = ins_res.data[0]["id"]
    print(f"Created Decode ID: {decode_id}")
    
    # 3. Run analysis synchronously
    print("Starting analysis...")
    await run_research_analysis(decode_id, paper_url, uid, email)
    
    # 4. Print final status
    final_res = sb.table("research_lab_decodes").select("status").eq("id", decode_id).execute()
    print(f"Final Status: {final_res.data[0]['status']}")
    print(f"URL: http://localhost:3000/research-lab/{decode_id}")

if __name__ == "__main__":
    asyncio.run(main())
