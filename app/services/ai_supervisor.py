# ai_supervisor.py
"""
AI Supervisor Service - Production Grade
"""
import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd
from loguru import logger
import httpx

class AISupervisorAgent:
    def __init__(self, openrouter_api_key: str):
        self.api_key = openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "anthropic/claude-3-sonnet"
        self.monitoring_active = False

    async def analyze_data_upload(self, df: pd.DataFrame, filename: str) -> Dict[str, Any]:
        # Stats
        stats = {
            'shape': df.shape,
            'columns': list(df.columns),
            'dtypes': df.dtypes.astype(str).to_dict(),
            'missing_values': df.isnull().sum().to_dict(),
            'duplicates': int(df.duplicated().sum())
        }
        quality_score = 100.0 - df.isnull().sum().sum() * 100.0 / (df.shape[0] * df.shape[1])
        ai_insights = await self._get_ai_recommendations(stats, quality_score)
        return {
            'status': 'success',
            'filename': filename,
            'statistics': stats,
            'quality_score': quality_score,
            'ai_insights': ai_insights,
            'timestamp': datetime.utcnow().isoformat()
        }

    async def _get_ai_recommendations(self, stats: Dict, quality_score: float) -> Dict[str, Any]:
        prompt = f"Dataset stats for ML analysis: {json.dumps(stats)}. Quality Score: {quality_score:.2f}\n1. Assessment\n2. Recommendations\n3. ML strategies\n4. Issues"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are an expert ML data scientist providing concise ML insights."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.4,
                        "max_tokens": 400
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    return {"insights": response.json()['choices'][0]['message']['content']}
                else:
                    return {"insights": f"LLM error {response.status_code}"}
        except Exception as e:
            logger.error(f"AI rec error: {str(e)}")
            return {"insights": "Failed to generate AI insights, check API key/network."}

# Singleton pattern
ai_supervisor: Optional[AISupervisorAgent] = None

def get_ai_supervisor() -> AISupervisorAgent:
    global ai_supervisor
    if ai_supervisor is None:
        import os
        api_key = os.getenv("OPENROUTER_API_KEY")
        ai_supervisor = AISupervisorAgent(api_key)
    return ai_supervisor
