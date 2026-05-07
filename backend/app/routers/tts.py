import logging
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import edge_tts
import io

router = APIRouter(prefix="/tts", tags=["tts"])
logger = logging.getLogger(__name__)

@router.get("/stream")
async def stream_tts(
    text: str = Query(..., min_length=1),
    voice: str = Query("en-US-AndrewNeural"),
    rate: str = Query("+0%")
):
    """
    Streams TTS audio for the given text using edge-tts.
    Rate should be in format +N% or -N%.
    """
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        
        async def audio_generator():
            async for chunk in communicate.stream():
                if chunk.get("type") == "audio" and chunk.get("data"):
                    yield chunk["data"]

        return StreamingResponse(audio_generator(), media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    """
    Returns a list of available voices.
    """
    try:
        voices = await edge_tts.VoicesManager.create()
        # Filter for English voices or just return all
        return voices.find(Language="en")
    except Exception as e:
        logger.error(f"Error fetching voices: {e}")
        raise HTTPException(status_code=500, detail=str(e))
