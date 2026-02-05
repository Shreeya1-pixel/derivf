# How to See Supabase Data in Action

## ✅ You Have Data Already!

The test script has already inserted **2 test records** into your Supabase `vulnerabilities` table:

1. First test at: `2026-02-05T15:15:54` 
2. Second test at: `2026-02-05T15:16:42`

## 📊 View Your Data in Supabase Dashboard

### Step 1: Open Supabase Table Editor
1. Go to: https://egjahogjugairhwswvsx.supabase.co
2. Click **"Table Editor"** in the left sidebar
3. Click on **"vulnerabilities"** table

### Step 2: You Should See
You'll see 2 rows with this data:

| id | artifact | risk | confidence | agent_votes | created_at |
|---|---|---|---|---|---|
| a0225dd9-... | PDF_DOCUMENT | HIGH | 0.78 | {"soc_agent": "LOW", "threat_model": "HIGH", "security_review": "MEDIUM"} | 2026-02-05 15:15:54 |
| 2c9b2cfb-... | PDF_DOCUMENT | HIGH | 0.78 | {"soc_agent": "LOW", "threat_model": "HIGH", "security_review": "MEDIUM"} | 2026-02-05 15:16:42 |

## 🚀 See Real Analysis in Action

### Option 1: Use the API (Recommended)

1. **Start the backend server:**
```bash
cd /Users/sunil/Desktop/Hacker/deriv-hack/backend
python main.py
```

2. **In another terminal, make a test request:**
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "artifact_type": "CODE",
    "content": "def login(user, pwd):\n    query = \"SELECT * FROM users WHERE username='\'' \" + user + \"'\'' AND password='\''\" + pwd + \"'\''\"\n    cursor.execute(query)\n    return cursor.fetchone()",
    "metadata": {"artifact_id": "test-sql-injection"}
  }'
```

3. **Check Supabase Dashboard:**
   - Refresh the vulnerabilities table
   - You'll see a NEW record with real AI analysis!

### Option 2: Use the Frontend

1. **Start the frontend:**
```bash
cd /Users/sunil/Desktop/Hacker/deriv-hack/frontend
npm run dev
```

2. **Upload a file or paste code** in the UI
3. **After analysis completes**, check Supabase dashboard

## 🔍 What Gets Logged

Every time you run an analysis, Supabase automatically logs:

- ✅ **artifact**: What was analyzed (PDF, CODE, GITHUB, etc.)
- ✅ **risk**: Risk level (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ **confidence**: AI confidence score (0.0-1.0)
- ✅ **agent_votes**: Each agent's severity assessment
- ✅ **overall_score**: Security score (0-100)
- ✅ **summary**: Analysis summary
- ✅ **status**: GO or NO-GO
- ✅ **created_at**: Timestamp

## 📈 View Analytics

Query your data with SQL in Supabase:

```sql
-- View all HIGH and CRITICAL risks
SELECT * FROM vulnerabilities 
WHERE risk IN ('HIGH', 'CRITICAL') 
ORDER BY created_at DESC;

-- Count risks by level
SELECT risk, COUNT(*) as count 
FROM vulnerabilities 
GROUP BY risk;

-- Recent alerts
SELECT v.*, a.channel, a.sent_at
FROM vulnerabilities v
LEFT JOIN alerts a ON v.id = a.vulnerability_id
WHERE v.created_at > NOW() - INTERVAL '24 hours'
ORDER BY v.created_at DESC;
```

## 🎯 Quick Verification

Run this to see your current data count:
```bash
cd /Users/sunil/Desktop/Hacker/deriv-hack/backend
python -c "from app.services.supabase_logger import get_vulnerabilities; print(f'Total records: {len(get_vulnerabilities())}')"
```

Your Supabase integration is **working perfectly**! 🎉
