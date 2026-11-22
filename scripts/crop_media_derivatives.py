"""FAZ_2 Step 2.6 — master → türev crop + WebP dönüşümü (image-agent).

Kural (AGENTS.md §5): 1 master → çok türev, her boyut için yeniden üretim YASAK.
Türevler: hero 1920x1080 (upscale) + OG 1200x630 (16:9 crop) — infografik 1080x1350.

Kullanım: py -3.13 scripts/crop_media_derivatives.py
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "public", "media", "en")

MASTERS = [
    # (master rel path, tip, hedef keyword, alt text)
    ("heroes/trade-services-hero.png", "hero", "trade-services-hero",
     "Bdimexport sourcing and manufacturing services — global trade consultancy illustration"),
    ("heroes/turkish-industries-hero.png", "hero", "turkish-industries-hero",
     "Turkish industry sectors — textile, food, machinery, home living and construction export illustration"),
    ("heroes/turkish-products-catalog-hero.png", "hero", "turkish-products-catalog-hero",
     "Turkish export products catalog — textiles, olive oil, ceramics and machinery illustration"),
    ("infographics/textile-production-process.png", "infographic", "textile-production-process",
     "Turkish textile production process — 5 steps from fabric to export container"),
    ("infographics/food-export-process.png", "infographic", "food-export-process",
     "Turkish food export process — 5 steps from production to certified shipment"),
    ("infographics/machinery-export-process.png", "infographic", "machinery-export-process",
     "Turkish machinery export process — 5 steps from blueprint to crane loading"),
    ("infographics/home-living-production-process.png", "infographic", "home-living-production-process",
     "Turkish home and living production process — 5 steps from pottery to export box"),
    ("infographics/construction-materials-process.png", "infographic", "construction-materials-process",
     "Turkish construction materials export process — 5 steps from quarry to flatbed truck"),
]

MANIFEST = os.path.join(ROOT, "public", "media", "media-manifest.json")


def save_webp(img, out_path, size=None):
    if size:
        img = img.resize(size, Image.LANCZOS)
    img.save(out_path, "WEBP", quality=85, method=6)


def main():
    manifest = {"_meta": {
        "description": "master→türev zinciri + alt text (AGENTS.md §5 Kural 3)",
        "generated": "FAZ_2 Step 2.6",
    }, "masters": []}
    for rel, tip, keyword, alt in MASTERS:
        src = os.path.join(MEDIA, rel)
        if not os.path.exists(src):
            print(f"MISSING master: {src}", file=sys.stderr)
            sys.exit(1)
        img = Image.open(src).convert("RGB")
        stem = os.path.splitext(rel)[0]
        out_dir = os.path.dirname(os.path.join(MEDIA, rel))
        entry = {"master": f"media/en/{rel}", "type": tip, "alt": alt, "derivatives": []}

        master_webp = os.path.join(out_dir, f"{keyword}-master.webp")
        save_webp(img, master_webp)
        entry["derivatives"].append({"file": master_webp.replace(ROOT + os.sep, "").replace("\\", "/"),
                                     "size": list(img.size), "kind": "master"})

        if tip == "hero":
            # OG 1200x630: 16:9 zaten → direkt resize; hero 1920x1080 upscale
            og = os.path.join(out_dir, f"{keyword}-og.webp")
            save_webp(img, og, (1200, 630))
            entry["derivatives"].append({"file": og.replace(ROOT + os.sep, "").replace("\\", "/"),
                                         "size": [1200, 630], "kind": "og-crop"})
            hero = os.path.join(out_dir, f"{keyword}-1920.webp")
            save_webp(img, hero, (1920, 1080))
            entry["derivatives"].append({"file": hero.replace(ROOT + os.sep, "").replace("\\", "/"),
                                         "size": [1920, 1080], "kind": "hero"})
        else:  # infographic 1080x1350 hedef (576x1024 → upscale)
            ig = os.path.join(out_dir, f"{keyword}-1080.webp")
            save_webp(img, ig, (1080, 1920) if img.size[0] < img.size[1] else (1080, 1350))
            w, h = img.size
            target = (1080, 1920) if h > w else (1080, 1350)
            entry["derivatives"][-1]["size"] = list(target)
        manifest["masters"].append(entry)
        print(f"OK {rel} → {len(entry['derivatives'])} türev")

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
