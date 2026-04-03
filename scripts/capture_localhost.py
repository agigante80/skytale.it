#!/usr/bin/env python3
"""
Capture screenshots of localhost pages and test theme toggle interaction.
"""

import os
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = "/home/alien/dev-github-personal/skytale.it/screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def capture(page, path):
    page.screenshot(path=path, full_page=False)
    print(f"Saved: {path}")


def main():
    url = "http://localhost:4321/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop viewport
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print(f"Navigating to {url} ...")
        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
        except Exception:
            page.goto(url, timeout=15000)

        page.wait_for_timeout(1500)

        # Screenshot 1: initial state
        capture(page, f"{SCREENSHOTS_DIR}/localhost_desktop_before_toggle.png")
        print("Initial screenshot captured.")

        # Try to find a theme toggle button
        # Common selectors for sun/moon toggle
        toggle_selectors = [
            "button[aria-label*='theme']",
            "button[aria-label*='Theme']",
            "button[aria-label*='dark']",
            "button[aria-label*='Dark']",
            "button[aria-label*='light']",
            "button[aria-label*='Light']",
            "button[aria-label*='mode']",
            "button[aria-label*='Mode']",
            "#theme-toggle",
            ".theme-toggle",
            "[data-theme-toggle]",
            "button.theme-toggle",
            "nav button",
        ]

        toggle_found = False
        toggle_info = "No toggle found"

        for selector in toggle_selectors:
            try:
                elements = page.query_selector_all(selector)
                if elements:
                    el = elements[0]
                    box = el.bounding_box()
                    text = el.inner_text()
                    aria = el.get_attribute("aria-label") or ""
                    toggle_info = f"Found with selector '{selector}': text='{text}', aria-label='{aria}', box={box}"
                    print(toggle_info)
                    toggle_found = True

                    # Click it
                    el.click()
                    page.wait_for_timeout(1000)
                    capture(page, f"{SCREENSHOTS_DIR}/localhost_desktop_after_toggle.png")
                    print("Post-toggle screenshot captured.")

                    # Also check html/body background color after toggle
                    bg_after = page.evaluate("() => getComputedStyle(document.documentElement).backgroundColor")
                    body_bg_after = page.evaluate("() => getComputedStyle(document.body).backgroundColor")
                    html_class_after = page.evaluate("() => document.documentElement.className")
                    body_class_after = page.evaluate("() => document.body.className")
                    print(f"After toggle — html bg: {bg_after}, body bg: {body_bg_after}")
                    print(f"After toggle — html class: {html_class_after}, body class: {body_class_after}")

                    # Toggle back and note original
                    el.click()
                    page.wait_for_timeout(800)
                    bg_original = page.evaluate("() => getComputedStyle(document.documentElement).backgroundColor")
                    html_class_original = page.evaluate("() => document.documentElement.className")
                    print(f"After toggle back — html bg: {bg_original}, html class: {html_class_original}")

                    break
            except Exception as e:
                continue

        if not toggle_found:
            print("No theme toggle button found with known selectors.")
            # Dump all buttons for inspection
            buttons = page.query_selector_all("button")
            print(f"Total buttons on page: {len(buttons)}")
            for b in buttons:
                try:
                    aria = b.get_attribute("aria-label") or ""
                    text = b.inner_text()
                    cls = b.get_attribute("class") or ""
                    bid = b.get_attribute("id") or ""
                    print(f"  button: id='{bid}', class='{cls}', aria-label='{aria}', text='{text[:40]}'")
                except Exception:
                    pass

        # Inspect page title and h1
        title = page.title()
        h1 = page.query_selector("h1")
        h1_text = h1.inner_text() if h1 else "No H1 found"
        print(f"\nPage title: {title}")
        print(f"H1: {h1_text}")

        # Check initial html class and body bg color
        html_class = page.evaluate("() => document.documentElement.className")
        body_bg = page.evaluate("() => getComputedStyle(document.body).backgroundColor")
        print(f"Initial html class: '{html_class}'")
        print(f"Initial body background: {body_bg}")

        context.close()

        # Mobile screenshot
        context_m = browser.new_context(viewport={"width": 375, "height": 812}, device_scale_factor=2)
        page_m = context_m.new_page()
        try:
            page_m.goto(url, wait_until="networkidle", timeout=15000)
        except Exception:
            page_m.goto(url, timeout=15000)
        page_m.wait_for_timeout(1500)
        capture(page_m, f"{SCREENSHOTS_DIR}/localhost_mobile_before_toggle.png")
        context_m.close()

        browser.close()
        print("\nDone.")


if __name__ == "__main__":
    main()
