"""
Güvenli Gıda Scraper
====================
T.C. Tarım ve Orman Bakanlığı gıda güvenliği ifşa listelerini scrape eder.
Playwright kullanarak 3 ayrı kaynaktan veri çeker.

Kullanım:
    python scripts/scraper.py
    python scripts/scraper.py --dry-run  # DB'ye yazmadan test
"""

import asyncio
import os
import sys
from datetime import datetime
from typing import Optional
import hashlib
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from playwright.async_api import async_playwright, Page
    from supabase import create_client, Client
    import requests
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Run: pip install playwright supabase requests")
    print("Then: playwright install chromium")
    sys.exit(1)

# Load environment variables from .env.local
from dotenv import load_dotenv
from pathlib import Path

# Get the project root directory (parent of scripts/)
project_root = Path(__file__).parent.parent
env_file = project_root / ".env.local"
load_dotenv(env_file)

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# URLs to scrape
URLS = {
    "saglik": "https://guvenilirgida.tarimorman.gov.tr/GuvenilirGida/gkd/SagligiTehlikeyeDusurecek?siteYayinDurumu=True",
    "taklit1": "https://guvenilirgida.tarimorman.gov.tr/GuvenilirGida/gkd/TaklitVeyaTagsisListe1?siteYayinDurumu=True",
    "taklit2": "https://guvenilirgida.tarimorman.gov.tr/GuvenilirGida/gkd/TaklitVeyaTagsisListe2?siteYayinDurumu=True",
}


def get_supabase() -> Client:
    """Create Supabase client with service role key (bypasses RLS)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def generate_unique_key(row: dict) -> str:
    """Generate unique key for deduplication."""
    key_string = f"{row.get('company_name', '')}-{row.get('product_name', '')}-{row.get('batch_number', '')}-{row.get('category', '')}"
    return hashlib.md5(key_string.encode()).hexdigest()


async def select_all_records(page: Page) -> None:
    """Select 'Hepsi' (All) from the dropdown to show all records at once."""
    try:
        # Wait for the dropdown to be available
        await page.wait_for_selector("select[name*='length'], .dataTables_length select", timeout=10000)
        
        # Find and click the dropdown
        dropdown = await page.query_selector("select[name*='length'], .dataTables_length select")
        if dropdown:
            # Select the "Hepsi" (All) option - typically value is -1 or a very large number
            await dropdown.select_option(label="Hepsi")
            
            # Wait for table to reload with all data
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)  # Additional wait for dynamic content
            
            print("✓ Selected 'Hepsi' - showing all records")
    except Exception as e:
        print(f"⚠ Could not select 'Hepsi': {e}")
        # Continue anyway, we'll scrape what's visible


async def parse_table(page: Page, category: str) -> list[dict]:
    """Parse the data table and extract all records."""
    records = []
    
    try:
        # Wait for table to be visible
        await page.wait_for_selector("table tbody tr", timeout=15000)
        
        # Get all rows
        rows = await page.query_selector_all("table tbody tr")
        
        for row in rows:
            cells = await row.query_selector_all("td")
            if len(cells) < 5:  # Skip rows with insufficient data
                continue
            
            # Extract cell values
            cell_values = []
            for cell in cells:
                text = await cell.inner_text()
                cell_values.append(text.strip())
            
            # Map to our schema (adjust indices based on actual table structure)
            # Typical order: Date, Company, Brand, Product, Violation, Batch, District, City, ProductGroup
            record = {
                "announcement_date": parse_date(cell_values[0]) if len(cell_values) > 0 else None,
                "company_name": cell_values[1] if len(cell_values) > 1 else "",
                "brand": cell_values[2] if len(cell_values) > 2 else "",
                "product_name": cell_values[3] if len(cell_values) > 3 else "",
                "violation": cell_values[4] if len(cell_values) > 4 else "",
                "batch_number": cell_values[5] if len(cell_values) > 5 else "",
                "district": cell_values[6] if len(cell_values) > 6 else "",
                "city": cell_values[7] if len(cell_values) > 7 else "",
                "product_group": cell_values[8] if len(cell_values) > 8 else "",
                "category": category,
                "is_active": True,
            }
            
            records.append(record)
        
        print(f"✓ Parsed {len(records)} records from {category}")
        
    except Exception as e:
        print(f"✗ Error parsing table for {category}: {e}")
    
    return records


def parse_date(date_str: str) -> Optional[str]:
    """Parse Turkish date format to ISO format."""
    if not date_str:
        return None
    
    try:
        # Try common Turkish date formats
        for fmt in ["%d.%m.%Y", "%d/%m/%Y", "%Y-%m-%d"]:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
    except Exception:
        pass
    
    return None


async def scrape_all_sources(dry_run: bool = False) -> tuple[list[dict], int]:
    """Scrape all 3 data sources and return combined records."""
    all_records = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="tr-TR",
            viewport={"width": 1920, "height": 1080}
        )
        
        for category, url in URLS.items():
            print(f"\n📡 Scraping {category}: {url}")
            
            page = await context.new_page()
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=60000)
                await select_all_records(page)
                records = await parse_table(page, category)
                all_records.extend(records)
            except Exception as e:
                print(f"✗ Failed to scrape {category}: {e}")
            finally:
                await page.close()
        
        await browser.close()
    
    print(f"\n📊 Total records scraped: {len(all_records)}")
    return all_records, len(all_records)


def sync_to_database(records: list[dict], dry_run: bool = False) -> dict:
    """
    Sync scraped records to Supabase.
    Implements 'Never Delete' strategy - marks missing records as inactive.
    """
    if dry_run:
        print("\n🔍 DRY RUN - No changes will be made to database")
        return {"inserted": 0, "updated": 0, "deactivated": 0}
    
    supabase = get_supabase()
    stats = {"inserted": 0, "updated": 0, "deactivated": 0}
    
    # Get current active records from DB
    existing = supabase.table("foods").select("*").eq("is_active", True).execute()
    existing_keys = {
        generate_unique_key(r): r for r in existing.data
    }
    
    # Track which records we've seen in the new scrape
    scraped_keys = set()
    
    for record in records:
        key = generate_unique_key(record)
        scraped_keys.add(key)
        
        if key in existing_keys:
            # Record exists - update if needed
            stats["updated"] += 1
        else:
            # New record - insert
            try:
                supabase.table("foods").insert(record).execute()
                stats["inserted"] += 1
            except Exception as e:
                print(f"⚠ Failed to insert record: {e}")
    
    # NEVER DELETE: Mark records not in current scrape as inactive
    for key, existing_record in existing_keys.items():
        if key not in scraped_keys:
            try:
                supabase.table("foods").update({
                    "is_active": False,
                    "removed_at": datetime.utcnow().isoformat()
                }).eq("id", existing_record["id"]).execute()
                stats["deactivated"] += 1
                print(f"📦 Archived: {existing_record['company_name']} - {existing_record['product_name']}")
            except Exception as e:
                print(f"⚠ Failed to deactivate record: {e}")
    
    print(f"\n📈 Database sync complete:")
    print(f"   ➕ Inserted: {stats['inserted']}")
    print(f"   🔄 Updated: {stats['updated']}")
    print(f"   📦 Archived: {stats['deactivated']}")
    
    return stats


def send_notification_email(new_count: int) -> bool:
    """Send email notification to all subscribers when new records are found."""
    if new_count == 0:
        print("📧 No new records - skipping email notification")
        return False
    
    if not RESEND_API_KEY:
        print("⚠ RESEND_API_KEY not set - skipping email")
        return False
    
    supabase = get_supabase()
    
    # Get all subscribers
    subscribers = supabase.table("subscribers").select("email").execute()
    
    if not subscribers.data:
        print("📧 No subscribers to notify")
        return False
    
    emails = [s["email"] for s in subscribers.data]
    
    # Send email via Resend
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "Güvenli Gıda <bilgi@guvenligida.org>",
                "to": emails,
                "subject": f"🚨 {new_count} Yeni Gıda İfşası Tespit Edildi",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc2626;">🚨 Yeni Gıda İfşaları</h1>
                    <p>Bugün <strong>{new_count}</strong> yeni gıda güvenliği ihlali tespit edildi.</p>
                    <p>Detayları görmek için sitemizi ziyaret edin:</p>
                    <a href="https://guvenligida.org" 
                       style="display: inline-block; background: #dc2626; color: white; 
                              padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        İfşaları Görüntüle
                    </a>
                    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        Bu e-postayı almak istemiyorsanız, sitemizdeki abonelik ayarlarından çıkabilirsiniz.
                    </p>
                </div>
                """
            }
        )
        
        if response.status_code == 200:
            print(f"📧 Email sent to {len(emails)} subscribers")
            return True
        else:
            print(f"⚠ Email failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"⚠ Email error: {e}")
        return False


async def main():
    """Main entry point."""
    dry_run = "--dry-run" in sys.argv
    
    print("=" * 60)
    print("🍽️  Güvenli Gıda Scraper")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    if dry_run:
        print("🔍 Running in DRY RUN mode")
    
    # Scrape all sources
    records, total = await scrape_all_sources(dry_run)
    
    # Sync to database
    stats = sync_to_database(records, dry_run)
    
    # Send notification if new records found
    if stats["inserted"] > 0 and not dry_run:
        send_notification_email(stats["inserted"])
    
    print("\n✅ Scraping complete!")
    return stats


if __name__ == "__main__":
    asyncio.run(main())
