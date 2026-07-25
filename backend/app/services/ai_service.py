"""
Mbamager AI Communication Service
This module encapsulates all interactions with the configured Google Gemini AI provider.
"""

import json
import logging
from decimal import Decimal
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from app.core.config import settings
from app.ai.prompts import (
    CATEGORIZATION_PROMPT,
    NARRATIVE_PROMPT,
    ANOMALY_PROMPT,
    SPENDING_INSIGHT_PROMPT,
    EXPLANATION_PROMPT,
)

logger = logging.getLogger(__name__)

class AIService:
    """
    Service encapsulating interactions with Google Gemini API to analyze, categorize,
    clean, and extract insights from financial transactions.
    """

    def __init__(self) -> None:
        self._client: Optional[genai.Client] = None

    @property
    def client(self) -> genai.Client:
        """
        Lazily initializes the Google GenAI client to prevent crashes on startup if the API key is missing.
        """
        if self._client is None:
            api_key = settings.GEMINI_API_KEY
            if not api_key:
                logger.warning("GEMINI_API_KEY environment variable is not set. Falling back to rule-based mock logic.")
                raise ValueError("GEMINI_API_KEY is not set.")
            self._client = genai.Client(api_key=api_key)
        return self._client

    def _call_gemini_json(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Helper method to call Gemini with a prompt and expect a JSON response.
        """
        try:
            client = self.client
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=settings.GEMINI_TEMPERATURE,
                    max_output_tokens=settings.GEMINI_MAX_TOKENS,
                    response_mime_type="application/json",
                ),
            )
            if response and response.text:
                return json.loads(response.text.strip())
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
        return None

    def categorize_transaction(
        self,
        amount: Decimal,
        direction: str,
        fee: Decimal,
        narrative: str,
        tx_id_external: Optional[str] = None,
        timestamp: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Predict the best TransactionCategory for a given transaction.
        """
        prompt = CATEGORIZATION_PROMPT.format(
            amount=str(amount),
            direction=direction,
            fee=str(fee),
            narrative=narrative or "No description",
            tx_id_external=tx_id_external or "None",
            timestamp=timestamp or "None",
        )

        result = self._call_gemini_json(prompt)
        if result and "category" in result:
            confidence = float(result.get("confidence", 0.50))
            return {
                "category": result["category"],
                "confidence": confidence,
            }

        # Safe mock / deterministic fallback if API is unavailable or fails
        fallback_category = "EXPENSE_FOOD"
        if direction == "CREDIT":
            fallback_category = "INCOME_SALARY"
            if "commission" in (narrative or "").lower():
                fallback_category = "INCOME_BUSINESS"
        else:
            if "commission" in (narrative or "").lower() or "fee" in (narrative or "").lower():
                fallback_category = "EXPENSE_COMMISSION"
            elif "taxi" in (narrative or "").lower() or "transport" in (narrative or "").lower():
                fallback_category = "EXPENSE_TRANSPORT"
            elif "school" in (narrative or "").lower() or "tuition" in (narrative or "").lower():
                fallback_category = "EXPENSE_EDUCATION"
            elif "hospital" in (narrative or "").lower() or "medical" in (narrative or "").lower() or "pharmacy" in (narrative or "").lower():
                fallback_category = "EXPENSE_HEALTH"

        return {
            "category": fallback_category,
            "confidence": 0.50,
            "fallback": True,
        }

    def generate_clean_narrative(
        self,
        narrative: str,
        amount: Decimal,
        direction: str,
        tx_id_external: Optional[str] = None,
    ) -> str:
        """
        Generate a concise, human-friendly summary of the raw transaction description.
        """
        if not narrative:
            return f"{direction.title()} transaction of {amount}"

        prompt = NARRATIVE_PROMPT.format(
            narrative=narrative,
            amount=str(amount),
            direction=direction,
            tx_id_external=tx_id_external or "None",
        )

        result = self._call_gemini_json(prompt)
        if result and "clean_narrative" in result:
            return result["clean_narrative"][:50]  # Enforce max 50 characters

        # Fallback
        clean = narrative
        for term in ["momo", "transfer", "external", "txn"]:
            clean = clean.replace(term, "").strip()
        if tx_id_external:
            clean = clean.replace(tx_id_external, "").strip()
        return clean[:50] or f"{direction.title()} transaction"

    def detect_anomaly(
        self,
        amount: Decimal,
        direction: str,
        category: str,
        fee: Decimal,
        narrative: str,
        tx_id_external: Optional[str] = None,
        timestamp: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze transaction parameters to flag potential security anomalies, unusual fees, or extreme amounts.
        """
        prompt = ANOMALY_PROMPT.format(
            amount=str(amount),
            direction=direction,
            category=category,
            fee=str(fee),
            narrative=narrative or "No description",
            tx_id_external=tx_id_external or "None",
            timestamp=timestamp or "None",
        )

        result = self._call_gemini_json(prompt)
        if result and "is_anomaly" in result:
            return {
                "is_anomaly": bool(result["is_anomaly"]),
                "explanation": result.get("explanation", "No explanation provided"),
                "anomaly_score": float(result.get("anomaly_score", 0.0)),
            }

        # Fallback
        is_anomaly = False
        explanation = "Transaction fits typical patterns."
        if amount > Decimal("500000"):
            is_anomaly = True
            explanation = "Transaction amount is unusually high."
        elif fee > (amount * Decimal("0.10")):
            is_anomaly = True
            explanation = "Transaction fee is disproportionately high (exceeds 10% of amount)."

        return {
            "is_anomaly": is_anomaly,
            "explanation": explanation,
            "anomaly_score": 0.80 if is_anomaly else 0.10,
            "fallback": True,
        }

    def generate_spending_insight(
        self,
        transactions: List[Dict[str, Any]],
        budgets: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Analyze transaction and budget history to provide holistic dashboard insights and savings recommendations.
        """
        prompt = SPENDING_INSIGHT_PROMPT.format(
            transactions_json=json.dumps(transactions, default=str),
            budgets_json=json.dumps(budgets, default=str),
        )

        result = self._call_gemini_json(prompt)
        if result:
            return result

        # Fallback
        # Calculate a basic deterministic top category and budget warning
        top_cats = {}
        largest_exp = {"narrative": "None", "amount": 0.0}
        budget_warnings = []
        budget_recommendations = []

        for tx in transactions:
            if tx.get("direction") == "DEBIT":
                amt = float(tx.get("amount", 0.0))
                cat = tx.get("category", "EXPENSE_FOOD")
                top_cats[cat] = top_cats.get(cat, 0.0) + amt
                if amt > largest_exp["amount"]:
                    largest_exp = {"narrative": tx.get("narrative", "Expense"), "amount": amt}

        for b in budgets:
            limit = float(b.get("amount_limit", 0.0))
            spent = float(b.get("amount_spent", 0.0))
            if limit > 0 and spent > limit:
                budget_warnings.append(f"Budget for {b.get('category')} has been exceeded!")
                budget_recommendations.append(f"Increase {b.get('category').replace('EXPENSE_', '').title()} budget based on overspending.")
            elif limit > 0 and spent > (limit * 0.8):
                budget_warnings.append(f"Budget for {b.get('category')} is near 80% limit.")
                budget_recommendations.append(f"Reduce {b.get('category').replace('EXPENSE_', '').title()} spending to stay within limits.")

        if not budget_recommendations:
            budget_recommendations.append("Savings target is realistic.")

        sorted_cats = [{"category": k, "amount": v} for k, v in sorted(top_cats.items(), key=lambda x: x[1], reverse=True)]

        return {
            "top_spending_categories": sorted_cats[:3],
            "largest_expense": largest_exp,
            "income_trend": "No significant historical data to determine clear trend.",
            "budget_warnings": budget_warnings or ["All budgets are currently within safe thresholds."],
            "unusual_spending_alerts": ["No immediate security alerts detected."],
            "savings_suggestions": ["Set aside 10% of monthly income to start an emergency savings cushion."],
            "budget_recommendations": budget_recommendations,
            "fallback": True,
        }

    def explain_transaction(
        self,
        amount: Decimal,
        direction: str,
        narrative: str,
        selected_category: str,
        confidence: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Explain why a specific category was selected for a transaction.
        """
        prompt = EXPLANATION_PROMPT.format(
            amount=str(amount),
            direction=direction,
            narrative=narrative or "No description",
            selected_category=selected_category,
            confidence=str(confidence) if confidence is not None else "0.50",
        )

        result = self._call_gemini_json(prompt)
        if result:
            return result

        # Fallback
        return {
            "assigned_category": selected_category,
            "confidence": confidence or 0.50,
            "explanation": f"The category {selected_category} was chosen because it aligns with typical transaction patterns for matching narratives.",
            "alternatives": [
                {
                    "category": "EXPENSE_COMMISSION" if direction == "DEBIT" else "INCOME_BUSINESS",
                    "confidence": 0.20,
                    "reason": "Alternative classification if transaction context is specialized."
                }
            ],
            "fallback": True,
        }
