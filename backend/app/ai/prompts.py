"""
Mbamager Gemini Prompt Templates

Plain-string templates consumed by app/services/ai_service.py via `.format(...)`.
Every template instructs Gemini to respond with a single JSON object only (the
service calls Gemini with response_mime_type="application/json"), and every
call site in ai_service.py has a deterministic fallback if Gemini is
unavailable or returns something unusable — per Engineering Law 1, the AI
layer only ever produces suggestions; it never writes to the ledger directly.

Valid TransactionCategory / BudgetCategory enum values (see
app/models/transaction.py and app/constants/categories.py):
    INCOME_SALARY, INCOME_BUSINESS, INCOME_REMITTANCE,
    EXPENSE_FOOD, EXPENSE_UTILITIES, EXPENSE_HEALTH, EXPENSE_EDUCATION,
    EXPENSE_TRANSPORT, EXPENSE_COMMISSION, SAVINGS, INVESTMENT
"""

CATEGORIZATION_PROMPT: str = """You are a financial transaction classifier for Mbamager, \
an app used by Cameroonian Mobile Money (MTN MoMo, Orange Money) users.

Classify the following transaction into exactly ONE of these categories:
INCOME_SALARY, INCOME_BUSINESS, INCOME_REMITTANCE, EXPENSE_FOOD, EXPENSE_UTILITIES,
EXPENSE_HEALTH, EXPENSE_EDUCATION, EXPENSE_TRANSPORT, EXPENSE_COMMISSION, SAVINGS, INVESTMENT

Transaction details:
- Amount: {amount} XAF
- Direction: {direction}
- Fee: {fee} XAF
- Narrative/description: {narrative}
- External reference: {tx_id_external}
- Timestamp: {timestamp}

Respond with ONLY a JSON object in this exact shape, no other text:
{{"category": "<ONE_OF_THE_CATEGORIES_ABOVE>", "confidence": <float between 0 and 1>}}
"""

NARRATIVE_PROMPT: str = """You are cleaning up raw Mobile Money SMS transaction descriptions \
for display inside a Cameroonian personal finance app.

Rewrite the following raw narrative into a short, human-friendly summary of at most 50 \
characters. Remove operator jargon (e.g. "MOMO", "TRANSFER", "EXTERNAL", "TXN") and \
reference codes. Keep it factual — do not invent details that aren't present.

Raw narrative: {narrative}
Amount: {amount} XAF
Direction: {direction}
External reference: {tx_id_external}

Respond with ONLY a JSON object in this exact shape, no other text:
{{"clean_narrative": "<cleaned up description, max 50 characters>"}}
"""

ANOMALY_PROMPT: str = """You are a fraud and anomaly detector for Mbamager, a Cameroonian \
Mobile Money finance app. Users are frequently targeted by fake MoMo alerts, fake loan \
apps, and investment scams.

Analyze the following transaction and decide whether it looks anomalous — unusually large, \
an unusually high fee relative to the amount, or a pattern consistent with a known Mobile \
Money scam.

Transaction details:
- Amount: {amount} XAF
- Direction: {direction}
- Category: {category}
- Fee: {fee} XAF
- Narrative/description: {narrative}
- External reference: {tx_id_external}
- Timestamp: {timestamp}

Respond with ONLY a JSON object in this exact shape, no other text:
{{"is_anomaly": <true or false>, "explanation": "<short plain-language reason>", \
"anomaly_score": <float between 0 and 1>}}
"""

SPENDING_INSIGHT_PROMPT: str = """You are a friendly, practical financial coach for a \
Cameroonian Mobile Money user of Mbamager. You never invent numbers — only reason about \
the transactions and budgets provided below.

Recent transactions (JSON array):
{transactions_json}

Current budgets (JSON array):
{budgets_json}

Based only on this data, produce a spending insight summary.

Respond with ONLY a JSON object in this exact shape, no other text:
{{
  "top_spending_categories": [{{"category": "<CATEGORY>", "amount": <float>}}, ...up to 3],
  "largest_expense": {{"narrative": "<string>", "amount": <float>}},
  "income_trend": "<one short sentence>",
  "budget_warnings": ["<short sentence>", ...],
  "unusual_spending_alerts": ["<short sentence>", ...],
  "savings_suggestions": ["<short sentence>", ...],
  "budget_recommendations": ["<short sentence>", ...]
}}
"""

EXPLANATION_PROMPT: str = """You are explaining an automatic transaction categorization \
decision to a Mbamager user in plain, friendly language.

Transaction details:
- Amount: {amount} XAF
- Direction: {direction}
- Narrative/description: {narrative}
- Assigned category: {selected_category}
- Confidence: {confidence}

Explain briefly why this category fits, and suggest one plausible alternative category \
with a lower confidence score, in case the automatic classification is wrong.

Respond with ONLY a JSON object in this exact shape, no other text:
{{
  "assigned_category": "{selected_category}",
  "confidence": {confidence},
  "explanation": "<1-2 short sentences>",
  "alternatives": [{{"category": "<CATEGORY>", "confidence": <float>, "reason": "<short reason>"}}]
}}
"""
