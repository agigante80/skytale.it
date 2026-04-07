#!/usr/bin/env python3
"""
Capture three specific screenshots:
1. Full-page screenshot of /privacy
2. Footer area of homepage (scrolled to bottom)
3. Cookie consent banner on homepage (fresh context, no localStorage)
"""

import os
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = "/home/alien/dev-github-personal/skytale.it/screenshots"
BASE_URL = "http://localhost:4321"

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── 1. Full-page screenshot of /privacy ──────────────────────────────
        print("Capturing /privacy full page...")
        ctx1 = browser.new_context(viewport={"width": 1920, "height": 1080})
        page1 = ctx1.new_page()
        try:
            page1.goto(f"{BASE_URL}/privacy", wait_until="networkidle", timeout=15000)
        except Exception:
            page1.goto(f"{BASE_URL}/privacy", timeout=15000)
        page1.wait_for_timeout(1500)

        path_privacy = f"{SCREENSHOTS_DIR}/privacy-full.png"
        page1.screenshot(path=path_privacy, full_page=True)
        print(f"Saved: {path_privacy}")

        # Inspect content
        title = page1.title()
        h1_el = page1.query_selector("h1")
        h1_text = h1_el.inner_text() if h1_el else "No H1"
        headings = page1.query_selector_all("h2")
        h2_texts = [h.inner_text() for h in headings]
        print(f"  Page title: {title}")
        print(f"  H1: {h1_text}")
        print(f"  H2 sections: {h2_texts}")
        ctx1.close()

        # ── 2. Footer area of homepage ────────────────────────────────────────
        print("\nCapturing homepage footer area...")
        ctx2 = browser.new_context(viewport={"width": 1920, "height": 1080})
        page2 = ctx2.new_page()
        try:
            page2.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
        except Exception:
            page2.goto(f"{BASE_URL}/", timeout=15000)
        page2.wait_for_timeout(1500)

        # Scroll to the very bottom
        page2.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page2.wait_for_timeout(800)

        path_footer = f"{SCREENSHOTS_DIR}/footer.png"
        page2.screenshot(path=path_footer, full_page=False)
        print(f"Saved: {path_footer}")

        # Check for privacy link in footer
        footer_el = page2.query_selector("footer")
        if footer_el:
            footer_html = footer_el.inner_html()
            footer_text = footer_el.inner_text()
            print(f"  Footer text (truncated): {footer_text[:400]}")
            privacy_link = page2.query_selector("footer a[href*='privacy']")
            if privacy_link:
                print(f"  Privacy link FOUND in footer: href={privacy_link.get_attribute('href')}, text='{privacy_link.inner_text()}'")
            else:
                print("  Privacy link NOT FOUND in footer")
        else:
            print("  No <footer> element found on page")
        ctx2.close()

        # ── 3. Cookie consent banner (fresh context, no localStorage) ─────────
        print("\nCapturing cookie consent banner (fresh context)...")
        ctx3 = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            # Fresh context = no stored localStorage
        )
        page3 = ctx3.new_page()

        # Navigate to homepage — fresh context means no consent stored
        try:
            page3.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
        except Exception:
            page3.goto(f"{BASE_URL}/", timeout=15000)
        page3.wait_for_timeout(2000)

        path_banner = f"{SCREENSHOTS_DIR}/cookie-banner.png"
        page3.screenshot(path=path_banner, full_page=False)
        print(f"Saved: {path_banner}")

        # Inspect cookie banner
        # Common selectors
        banner_selectors = [
            "[id*='cookie']",
            "[class*='cookie']",
            "[id*='consent']",
            "[class*='consent']",
            "[id*='banner']",
            "[class*='banner']",
            "[role='dialog']",
            "[aria-label*='cookie']",
            "[aria-label*='Cookie']",
        ]
        banner_found = False
        for sel in banner_selectors:
            el = page3.query_selector(sel)
            if el and el.is_visible():
                print(f"  Cookie banner found with selector '{sel}'")
                print(f"  Banner text: {el.inner_text()[:300]}")
                # Check for privacy link inside banner
                priv = el.query_selector("a[href*='privacy']")
                if priv:
                    print(f"  Privacy link FOUND in banner: href={priv.get_attribute('href')}, text='{priv.inner_text()}'")
                else:
                    print("  Privacy link NOT FOUND in banner")
                banner_found = True
                break

        if not banner_found:
            print("  No cookie consent banner found with known selectors.")
            # Dump all visible text on page for debugging
            body_text = page3.evaluate("() => document.body.innerText")
            print(f"  Page body text (first 500 chars): {body_text[:500]}")

            # Check localStorage state
            ls_consent = page3.evaluate("() => localStorage.getItem('cookie-consent')")
            ls_all = page3.evaluate("() => JSON.stringify(Object.fromEntries(Object.entries(localStorage)))")
            print(f"  localStorage cookie-consent: {ls_consent}")
            print(f"  localStorage all keys: {ls_all}")

        ctx3.close()
        browser.close()
        print("\nDone.")


if __name__ == "__main__":
    main()
