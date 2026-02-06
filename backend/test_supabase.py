"""
Test script to verify Supabase connection and perform a test insert.
"""
from app.db.supabase_client import supabase

def test_supabase_connection():
    """Test Supabase connection with a sample vulnerability insert."""
    print("Testing Supabase connection...")
    
    # Sample vulnerability data
    data = {
        "artifact": "PDF_DOCUMENT",
        "risk": "HIGH",
        "confidence": 0.78,
        "agent_votes": {
            "threat_model": "HIGH",
            "security_review": "MEDIUM",
            "soc_agent": "LOW"
        }
    }
    
    try:
        # Insert into vulnerabilities table
        response = supabase.table("vulnerabilities").insert(data).execute()
        print("✅ Successfully connected to Supabase!")
        print(f"📝 Inserted record: {response.data}")
        return True
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        print("\n⚠️  Make sure you have created the 'vulnerabilities' table in Supabase Dashboard:")
        print("   Table Editor → New Table → 'vulnerabilities'")
        print("   Columns: id (uuid, pk), artifact (text), risk (text), confidence (float), agent_votes (jsonb), created_at (timestamp)")
        return False

if __name__ == "__main__":
    test_supabase_connection()
