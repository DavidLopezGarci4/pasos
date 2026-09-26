"""
Generate Normal and Verticons icons for Pasos (SVG + high-res PNG + Android mipmaps + switchable sets).
Fixes Android Adaptive Icon rendering so foreground is perfectly centered and sized in the 66dp safe zone.
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
ANDROID_RES = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res")
ANDROID_RES_VERT = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res-verticons")
ANDROID_RES_NORM = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res-normal")

# 1. NORMAL ICON MASTER (512x512 Squircle with depth, glow, diamond star & organic leaf)
NORMAL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="normBg" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#4a7359"/>
      <stop offset="45%" stop-color="#335641"/>
      <stop offset="100%" stop-color="#1b3024"/>
    </linearGradient>

    <!-- Top Ambient Glow -->
    <radialGradient id="normGlow" cx="28%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#73ab87" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#73ab87" stop-opacity="0"/>
    </radialGradient>

    <!-- Card Gradient -->
    <linearGradient id="cardGrad" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fafcf5"/>
      <stop offset="55%" stop-color="#ebf2e2"/>
      <stop offset="100%" stop-color="#d5e3c8"/>
    </linearGradient>

    <!-- Drop Shadows for Floating Card -->
    <filter id="cardShadow" x="-20%" y="-15%" width="145%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#091810" flood-opacity="0.42"/>
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#091810" flood-opacity="0.25"/>
    </filter>

    <!-- Subtle Vein Glow -->
    <filter id="veinGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#c87a58" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Base Squircle -->
  <rect width="512" height="512" rx="124" fill="url(#normBg)"/>
  <rect width="512" height="512" rx="124" fill="url(#normGlow)"/>

  <!-- Inset Border Stroke -->
  <rect x="18" y="18" width="476" height="476" rx="108" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="3.5"/>

  <!-- Top-Right Diamond Sparkle -->
  <g transform="translate(416, 94)">
    <path d="M0 -15 Q0 0 15 0 Q0 0 0 15 Q0 0 -15 0 Q0 0 0 -15 Z" fill="#f4be5e"/>
    <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.8"/>
  </g>

  <!-- Floating Tilted Card -->
  <g filter="url(#cardShadow)">
    <rect x="122" y="122" width="268" height="268" rx="74" fill="url(#cardGrad)" transform="rotate(-6 256 256)"/>
    <rect x="124" y="124" width="264" height="264" rx="72" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="2" transform="rotate(-6 256 256)"/>
  </g>

  <!-- Organic Pasos Leaf & Growth Stem -->
  <g transform="rotate(-6 256 256)">
    <g transform="translate(256 256) scale(10.8) translate(-12.8 -12.4)">
      <!-- Leaf Body Fill -->
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="#416850" fill-opacity="0.2"/>
      <!-- Leaf Contour -->
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="none" stroke="#1d3426" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Terracotta Growth Stem & Vein -->
      <path d="M5 21C7.2 16.8 11.2 12.8 16.8 8.2" fill="none" stroke="#c87a58" stroke-width="2.1" stroke-linecap="round" filter="url(#veinGlow)"/>
      <!-- Golden Growth Spark at Apex -->
      <circle cx="20" cy="3" r="1.35" fill="#f4be5e"/>
    </g>
  </g>

  <!-- Bottom Subtle Progress Dots -->
  <g transform="translate(256, 442)" opacity="0.6">
    <circle cx="-20" cy="0" r="4" fill="#f4be5e"/>
    <circle cx="0" cy="0" r="4" fill="#c87a58"/>
    <circle cx="20" cy="0" r="4" fill="#e9eedf"/>
  </g>
</svg>
"""

# 2. VERTICONS MASTER (Vertical Card Style for Tall Screens)
VERTICONS_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Multi-tier Verticons Material Shadows -->
    <filter id="vertShadow" x="-30%" y="-20%" width="160%" height="155%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="26" stdDeviation="30" flood-color="#06120b" flood-opacity="0.52"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.22"/>
    </filter>

    <!-- Vertical Card Gradient -->
    <linearGradient id="vertCardBg" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#497258"/>
      <stop offset="25%" stop-color="#365843"/>
      <stop offset="65%" stop-color="#243f30"/>
      <stop offset="100%" stop-color="#15271d"/>
    </linearGradient>

    <!-- Top Card Highlight -->
    <radialGradient id="vertTopGlow" cx="50%" cy="12%" r="55%">
      <stop offset="0%" stop-color="#72aa86" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#72aa86" stop-opacity="0"/>
    </radialGradient>

    <!-- Floating Badge Gradient -->
    <linearGradient id="badgeGrad" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fbfdf7"/>
      <stop offset="55%" stop-color="#ebf2e2"/>
      <stop offset="100%" stop-color="#d6e3c9"/>
    </linearGradient>

    <!-- Inner Badge Shadow -->
    <filter id="badgeShadow" x="-25%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#07150d" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#07150d" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- ================= VERTICAL RECTANGULAR CARD ================= -->
  <g filter="url(#vertShadow)">
    <rect x="114" y="26" width="284" height="460" rx="60" fill="url(#vertCardBg)"/>
    <rect x="114" y="26" width="284" height="460" rx="60" fill="url(#vertTopGlow)"/>
    <rect x="115.5" y="27.5" width="281" height="457" rx="58.5" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2.5"/>
  </g>

  <!-- ================= TOP CONTEXTUAL PILL ================= -->
  <rect x="208" y="56" width="96" height="22" rx="11" fill="#ffffff" fill-opacity="0.13"/>
  <circle cx="228" cy="67" r="4.2" fill="#f4be5e"/>
  <circle cx="256" cy="67" r="4.2" fill="#c87a58"/>
  <circle cx="284" cy="67" r="4.2" fill="#e9eedf"/>

  <!-- ================= CENTER HERO BADGE ================= -->
  <g filter="url(#badgeShadow)">
    <rect x="162" y="108" width="188" height="188" rx="52" fill="url(#badgeGrad)" transform="rotate(-5 256 202)"/>
    <rect x="164" y="110" width="184" height="184" rx="50" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="2" transform="rotate(-5 256 202)"/>
  </g>

  <!-- Pasos Leaf Mark Inside Badge -->
  <g transform="rotate(-5 256 202)">
    <g transform="translate(256 202) scale(7.5) translate(-12.8 -12.4)">
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="#416850" fill-opacity="0.22"/>
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="none" stroke="#1b3224" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 21C7.2 16.8 11.2 12.8 16.8 8.2" fill="none" stroke="#c87a58" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="20" cy="3" r="1.4" fill="#f4be5e"/>
    </g>
  </g>

  <!-- ================= BOTTOM CONTEXTUAL UI ================= -->
  <text x="256" y="342" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="25" font-weight="900" letter-spacing="6" fill="#f3f7ee">PASOS</text>

  <g transform="translate(0, 16)">
    <rect x="176" y="356" width="40" height="6" rx="3" fill="#f4be5e"/>
    <rect x="224" y="356" width="64" height="6" rx="3" fill="#c87a58"/>
    <rect x="296" y="356" width="40" height="6" rx="3" fill="#ffffff" fill-opacity="0.24"/>
  </g>

  <text x="256" y="420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" letter-spacing="2.2" fill="#c3d9bb" opacity="0.95">CRECEMOS EN FAMILIA</text>

  <g transform="translate(256, 446)">
    <circle cx="0" cy="0" r="3.5" fill="#f4be5e" opacity="0.9"/>
  </g>
</svg>
"""

# 3. ANDROID ADAPTIVE FOREGROUND (108dp x 108dp with 66dp Safe Zone, centered at 54, 54)
ADAPTIVE_FOREGROUND_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="100%" height="100%">
  <defs>
    <linearGradient id="fgCardGrad" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fafcf5"/>
      <stop offset="55%" stop-color="#ebf2e2"/>
      <stop offset="100%" stop-color="#d5e3c8"/>
    </linearGradient>
    <filter id="fgShadow" x="-30%" y="-25%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3.5" stdDeviation="4" flood-color="#08160e" flood-opacity="0.5"/>
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.8" flood-color="#08160e" flood-opacity="0.25"/>
    </filter>
    <filter id="fgVeinGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" flood-color="#c87a58" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Top-Right Sparkle in safe zone -->
  <g transform="translate(80, 26)">
    <path d="M0 -4 Q0 0 4 0 Q0 0 0 4 Q0 0 -4 0 Q0 0 0 -4 Z" fill="#f4be5e"/>
    <circle cx="0" cy="0" r="0.8" fill="#ffffff" opacity="0.9"/>
  </g>

  <!-- Floating Tilted Card centered at (54, 54), size 52x52 (fits well inside 66dp safe zone) -->
  <g filter="url(#fgShadow)">
    <rect x="28" y="28" width="52" height="52" rx="15" fill="url(#fgCardGrad)" transform="rotate(-6 54 54)"/>
    <rect x="28.5" y="28.5" width="51" height="51" rx="14.5" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="0.8" transform="rotate(-6 54 54)"/>
  </g>

  <!-- Leaf Mark Inside Card -->
  <g transform="rotate(-6 54 54)">
    <g transform="translate(54 54) scale(2.1) translate(-12.8 -12.4)">
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="#416850" fill-opacity="0.22"/>
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="none" stroke="#1d3426" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 21C7.2 16.8 11.2 12.8 16.8 8.2" fill="none" stroke="#c87a58" stroke-width="2.1" stroke-linecap="round" filter="url(#fgVeinGlow)"/>
      <circle cx="20" cy="3" r="1.35" fill="#f4be5e"/>
    </g>
  </g>

  <!-- Bottom 3 Progress Dots in safe zone -->
  <g transform="translate(54, 88)" opacity="0.75">
    <circle cx="-5" cy="0" r="1.2" fill="#f4be5e"/>
    <circle cx="0" cy="0" r="1.2" fill="#c87a58"/>
    <circle cx="5" cy="0" r="1.2" fill="#e9eedf"/>
  </g>
</svg>
"""

# 4. ANDROID ADAPTIVE FOREGROUND FOR VERTICONS (Centered vertical card in safe zone)
ADAPTIVE_FOREGROUND_VERTICONS_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="100%" height="100%">
  <defs>
    <filter id="fgVertShadow" x="-35%" y="-25%" width="170%" height="160%">
      <feDropShadow dx="0" dy="3.5" stdDeviation="4" flood-color="#000000" flood-opacity="0.55"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="fgVertCardBg" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#497258"/>
      <stop offset="25%" stop-color="#365843"/>
      <stop offset="65%" stop-color="#243f30"/>
      <stop offset="100%" stop-color="#15271d"/>
    </linearGradient>
    <linearGradient id="fgBadgeGrad" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fafcf5"/>
      <stop offset="100%" stop-color="#d6e3c9"/>
    </linearGradient>
  </defs>

  <!-- Vertical card fits within 66dp safe zone: width 40, height 64, centered at (54, 54) -->
  <g filter="url(#fgVertShadow)">
    <rect x="34" y="22" width="40" height="64" rx="9" fill="url(#fgVertCardBg)"/>
    <rect x="34.5" y="22.5" width="39" height="63" rx="8.5" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="0.6"/>
  </g>

  <!-- Top Micro-Pill -->
  <rect x="46" y="26" width="16" height="3.5" rx="1.7" fill="#ffffff" fill-opacity="0.16"/>
  <circle cx="49" cy="27.7" r="0.7" fill="#f4be5e"/>
  <circle cx="54" cy="27.7" r="0.7" fill="#c87a58"/>
  <circle cx="59" cy="27.7" r="0.7" fill="#e9eedf"/>

  <!-- Center Badge (size 26x26) -->
  <rect x="41" y="33" width="26" height="26" rx="7.5" fill="url(#fgBadgeGrad)" transform="rotate(-5 54 46)"/>
  <rect x="41.3" y="33.3" width="25.4" height="25.4" rx="7.2" fill="none" stroke="#ffffff" stroke-opacity="0.8" stroke-width="0.4" transform="rotate(-5 54 46)"/>

  <!-- Leaf Mark Inside Badge -->
  <g transform="rotate(-5 54 46)">
    <g transform="translate(54 46) scale(1.05) translate(-12.8 -12.4)">
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="#416850" fill-opacity="0.25"/>
      <path d="M20 3C5 1 1 10 6 16s16 3 14-13Z" fill="none" stroke="#1d3426" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 21C7.2 16.8 11.2 12.8 16.8 8.2" fill="none" stroke="#c87a58" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="20" cy="3" r="1.35" fill="#f4be5e"/>
    </g>
  </g>

  <!-- PASOS Text -->
  <text x="54" y="66" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="3.8" font-weight="900" letter-spacing="0.8" fill="#f3f7ee">PASOS</text>

  <!-- Micro progress track -->
  <rect x="42.5" y="69" width="6" height="1" rx="0.5" fill="#f4be5e"/>
  <rect x="49.5" y="69" width="9" height="1" rx="0.5" fill="#c87a58"/>
  <rect x="59.5" y="69" width="6" height="1" rx="0.5" fill="#ffffff" fill-opacity="0.3"/>
</svg>
"""

def wrap_html(svg_content):
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 100%; height: 100%; overflow: hidden; background: transparent; }}
  svg {{ width: 100%; height: 100%; display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""

def make_round(img):
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)
    round_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def generate():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    
    # 1. Save all master SVG files in public/
    files = {
        "icon.svg": NORMAL_SVG,
        "icon-normal.svg": NORMAL_SVG,
        "icon-verticons.svg": VERTICONS_SVG,
        "icon-foreground.svg": ADAPTIVE_FOREGROUND_SVG,
        "icon-verticons-foreground.svg": ADAPTIVE_FOREGROUND_VERTICONS_SVG,
    }
    for filename, content in files.items():
        with open(os.path.join(PUBLIC_DIR, filename), "w", encoding="utf-8") as f:
            f.write(content)
    print("✅ All SVG icons written to public/")

    # 2. Render high-res PNGs via Playwright with 100% viewport filling HTML wrapper
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        
        def render_svg_to_png(svg_str, width, height, output_path):
            temp_html_path = os.path.join(PUBLIC_DIR, "_render_temp.html")
            with open(temp_html_path, "w", encoding="utf-8") as hf:
                hf.write(wrap_html(svg_str))
            
            page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            page.goto("file:///" + temp_html_path.replace("\\", "/"))
            page.screenshot(path=output_path, omit_background=True)
            page.close()
            if os.path.exists(temp_html_path):
                os.remove(temp_html_path)

        # Render 512x512 Master PNGs
        normal_png = os.path.join(PUBLIC_DIR, "icon-normal.png")
        icon_png = os.path.join(PUBLIC_DIR, "icon.png")
        vert_png = os.path.join(PUBLIC_DIR, "icon-verticons.png")
        render_svg_to_png(NORMAL_SVG, 512, 512, normal_png)
        render_svg_to_png(NORMAL_SVG, 512, 512, icon_png)
        render_svg_to_png(VERTICONS_SVG, 512, 512, vert_png)
        print("✅ Rendered master public/icon.png and public/icon-verticons.png (512x512)")

        # Render Adaptive Foregrounds at 432x432 (xxxhdpi resolution = 4x of 108dp)
        fg_png = os.path.join(PUBLIC_DIR, "icon-foreground.png")
        vert_fg_png = os.path.join(PUBLIC_DIR, "icon-verticons-foreground.png")
        render_svg_to_png(ADAPTIVE_FOREGROUND_SVG, 432, 432, fg_png)
        render_svg_to_png(ADAPTIVE_FOREGROUND_VERTICONS_SVG, 432, 432, vert_fg_png)
        print("✅ Rendered adaptive foregrounds at 432x432 (centered in 66dp safe zone)")

        browser.close()

    # 3. Clean up obsolete Android Studio sample vectors that can shadow mipmaps
    old_robot_vector = os.path.join(ANDROID_RES, "drawable-v24", "ic_launcher_foreground.xml")
    if os.path.exists(old_robot_vector):
        os.remove(old_robot_vector)
        print("🧹 Removed obsolete drawable-v24/ic_launcher_foreground.xml")

    # 4. Generate beautiful gradient background drawable for Android Adaptive Icons
    bg_gradient_xml = """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <gradient
        android:type="linear"
        android:angle="315"
        android:startColor="#4a7359"
        android:centerColor="#335641"
        android:endColor="#1b3024" />
</shape>
"""
    bg_drawable_path = os.path.join(ANDROID_RES, "drawable", "ic_launcher_background.xml")
    os.makedirs(os.path.dirname(bg_drawable_path), exist_ok=True)
    with open(bg_drawable_path, "w", encoding="utf-8") as f:
        f.write(bg_gradient_xml)
    print("✅ Created gradient android/app/src/main/res/drawable/ic_launcher_background.xml")

    # Update background color fallback
    bg_color_xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#233d33</color>\n</resources>\n'
    with open(os.path.join(ANDROID_RES, "values", "ic_launcher_background.xml"), "w", encoding="utf-8") as f:
        f.write(bg_color_xml)

    # Ensure mipmap-anydpi-v26/ic_launcher.xml uses the gradient background and foreground mipmap
    anydpi_dir = os.path.join(ANDROID_RES, "mipmap-anydpi-v26")
    os.makedirs(anydpi_dir, exist_ok=True)
    adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""
    with open(os.path.join(anydpi_dir, "ic_launcher.xml"), "w", encoding="utf-8") as f:
        f.write(adaptive_xml)
    with open(os.path.join(anydpi_dir, "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
        f.write(adaptive_xml)
    print("✅ Verified adaptive-icon XML in mipmap-anydpi-v26")

    # 5. Generate Android Mipmap densities
    # Densities:
    # mdpi: 48x48 icon, 108x108 foreground
    # hdpi: 72x72 icon, 162x162 foreground
    # xhdpi: 96x96 icon, 216x216 foreground
    # xxhdpi: 144x144 icon, 324x324 foreground
    # xxxhdpi: 192x192 icon, 432x432 foreground
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    def generate_res_pack(base_icon_path, base_fg_path, target_root, label):
        base_icon = Image.open(base_icon_path).convert("RGBA")
        base_fg = Image.open(base_fg_path).convert("RGBA")
        
        for folder, (icon_size, fg_size) in densities.items():
            out_folder = os.path.join(target_root, folder)
            os.makedirs(out_folder, exist_ok=True)

            # 1. Standard icon (Legacy launchers)
            icon_res = base_icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            icon_res.save(os.path.join(out_folder, "ic_launcher.png"), "PNG")

            # 2. Round icon (Legacy launchers)
            round_res = make_round(icon_res)
            round_res.save(os.path.join(out_folder, "ic_launcher_round.png"), "PNG")

            # 3. Foreground (Modern Android 8.0+ Adaptive Launchers)
            fg_res = base_fg.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
            fg_res.save(os.path.join(out_folder, "ic_launcher_foreground.png"), "PNG")

        print(f"✅ Generated Android {label} icon pack in {target_root}")

    # Generate current active res/ (Normal by default)
    generate_res_pack(normal_png, fg_png, ANDROID_RES, "Active (Normal)")
    # Generate backup res-normal/
    generate_res_pack(normal_png, fg_png, ANDROID_RES_NORM, "res-normal archive")
    # Generate backup res-verticons/
    generate_res_pack(vert_png, vert_fg_png, ANDROID_RES_VERT, "res-verticons archive")

if __name__ == "__main__":
    generate()
