"""V2 验证:截图各 section + 移动端"""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "https://ssj198807-maker.github.io/sange-portfolio/"
OUT = Path("/Users/apple/Desktop/三哥-LLMWiki/三哥个人网站")

errors = []
failed = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.on("console", lambda m: errors.append((m.type, m.text)) if m.type == "error" else None)
    page.on("requestfailed", lambda r: failed.append((r.url, r.failure)))
    page.on("response", lambda r: failed.append((r.url, f"HTTP {r.status}")) if r.status >= 400 else None)

    # 注:这是本地文件,不是 live URL
    import os
    local_url = "file://" + str(OUT / "index.html")
    page.goto(local_url, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1500)
    page.evaluate("""() => {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    }""")
    page.wait_for_timeout(500)

    for sid, name in [("top", "v2-1-hero"), ("about", "v2-2-about"), ("pillars", "v2-3-pillars"),
                      ("method", "v2-4-method"), ("featured", "v2-5-featured"),
                      ("gallery", "v2-6-gallery"), ("software", "v2-7-software"),
                      ("writing", "v2-8-writing"), ("contact", "v2-9-contact")]:
        page.evaluate(f"document.getElementById('{sid}').scrollIntoView()")
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / f"{name}.png"), clip={"x": 0, "y": 0, "width": 1440, "height": 900})

    browser.close()

print(f"=== console errors: {len(errors)}")
for t, m in errors[:3]: print(f"  [{t}] {m}")
print(f"=== failed resources: {len(failed)}")
for u, e in failed[:3]: print(f"  {e} : {u}")
print(f"=== screenshots:")
for f in sorted(OUT.glob("v2-*.png")):
    print(f"  {f.name} ({f.stat().st_size//1024}KB)")
