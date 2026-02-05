"""
Quick test to trigger a real vulnerability analysis and log to Supabase.
This simulates a security analysis that will populate your tables.
"""
import asyncio
import sys
import os

# Add the parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.api.endpoints import _run_full_analysis

async def test_real_analysis():
    """Run a real security analysis that will log to Supabase."""
    
    # Sample code with a SQL injection vulnerability
    vulnerable_code = """
    def login(username, password):
        # VULNERABLE: SQL Injection Risk
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
        cursor.execute(query)
        return cursor.fetchone()
    
    # This allows SQL injection attacks like: ' OR '1'='1
    """
    
    print("🔍 Running security analysis on vulnerable code...")
    print("=" * 60)
    
    try:
        result = await _run_full_analysis(
            content=vulnerable_code,
            artifact_id="test-vulnerable-code-001",
            artifact_origin="Test Code Analysis",
            ml_output=None
        )
        
        print(f"\n✅ Analysis Complete!")
        print(f"📊 Overall Score: {result.overall_score}/100")
        print(f"🚨 Status: {result.status}")
        print(f"📝 Summary: {result.summary}")
        print(f"🔍 Findings: {len(result.findings)} issues detected")
        
        print("\n" + "=" * 60)
        print("✅ Data has been logged to Supabase!")
        print("👉 Check your Supabase dashboard:")
        print("   - Go to Table Editor → vulnerabilities")
        print("   - You should see a new record with:")
        print(f"     • artifact: 'Test Code Analysis'")
        print(f"     • risk: (calculated based on findings)")
        print(f"     • agent_votes: (votes from each agent)")
        
        # Show the findings
        print(f"\n📋 Detected Issues:")
        for i, finding in enumerate(result.findings[:3], 1):  # Show first 3
            print(f"   {i}. [{finding.severity}] {finding.title}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_real_analysis())
