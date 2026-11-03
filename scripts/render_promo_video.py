#!/usr/bin/env python3
"""Render a lightweight, silent Proamina promo MP4 from the repository's own photos.
Free dependencies: Pillow and FFmpeg. No AI credits or external media hosting.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import math
import subprocess

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "img"
OUT = ROOT / "assets" / "video"
OUT.mkdir(parents=True, exist_ok=True)

W, H, FPS, SECONDS = 960, 540, 20, 8
INK = (19, 24, 20)
MUTED = (97, 104, 94)
LIME = (212, 250, 100)
CREAM = (248, 247, 242)
DARK = (22, 27, 23)

def font(sz, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, sz)
    return ImageFont.load_default()

F10, F14, F17, F22 = [font(i, True) for i in (10, 14, 17, 22)]
F46, F51 = font(46, True), font(51, True)
F18 = font(18)
F13 = font(13)

def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

def alpha(x, start, end):
    return smooth((x - start) / max(0.001, end - start))

def make_card(path, size):
    im = Image.open(path).convert("RGBA")
    # Keep the jar's authentic transparency; frame non-transparent product photos.
    if path.suffix.lower() == ".png":
        im.thumbnail((size[0] - 12, size[1] - 12), Image.Resampling.LANCZOS)
        return im, True
    card = Image.new("RGBA", size, (237, 232, 224, 255))
    crop = ImageOps.fit(im, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0]-1, size[1]-1), radius=18, fill=255)
    card.paste(crop, (0, 0), mask)
    card.putalpha(mask)
    return card, False

PRODUCTS = [
    (IMG/"proamina-pouch-200g.jpg", (166, 166), "200 G"),
    (IMG/"proamina-1kg.png", (212, 242), "1 KG"),
    (IMG/"proamina-sachets-5g.jpg", (166, 166), "100 × 5 G"),
]
CARDS = [(make_card(path, size), label) for path, size, label in PRODUCTS]

def base():
    image = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(image)
    d.ellipse((460, -160, 1130, 620), fill=(232, 237, 222))
    d.ellipse((580, -140, 1090, 540), fill=(219, 231, 205))
    d.ellipse((705, -90, 1060, 420), fill=(214, 239, 190))
    d.rounded_rectangle((24, 24, W - 24, H - 24), radius=19, outline=(221, 225, 214), width=2)
    d.text((65, 49), "PROAMINA®", font=F22, fill=INK)
    d.text((65, 80), "BY ITALPROTEIN", font=F10, fill=MUTED, stroke_width=0)
    d.line((65, 107, 286, 107), fill=(192, 202, 183), width=2)
    d.text((65, 500), "ITALPROTEIN.COM", font=F13, fill=MUTED)
    d.rounded_rectangle((771, 488, 905, 511), radius=11, fill=(37, 44, 38))
    d.text((790, 494), "MADE IN ITALY", font=F10, fill=(240, 244, 236))
    return image

BACKGROUND = base()

def paste_product(frame, idx, t):
    (pic, transparent), name = CARDS[idx]
    destinations = [(500, 217), (640, 150), (787, 222)]
    x, y = destinations[idx]
    reveal = alpha(t, 0.16 + idx * 0.28, 1.25 + idx * 0.25)
    if reveal <= 0.001:
        return
    y += int(31 * (1.0 - reveal) + math.sin(t * 2.4 + idx * 1.7) * 5)
    x += int(95 * (1.0 - reveal))
    # Shadow is detached so translucent jar artwork remains faithful.
    shadow = Image.new("RGBA", (pic.width + 50, pic.height + 50))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((24, pic.height + 5, pic.width + 28, pic.height + 25),
               fill=(14, 19, 15, int(46 * reveal)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    frame.alpha_composite(shadow, (x - 25, y - 8))
    item = pic.copy()
    item.putalpha(item.getchannel("A").point(lambda a: int(a * reveal)))
    frame.alpha_composite(item, (x, y))
    draw = ImageDraw.Draw(frame)
    tw = draw.textbbox((0, 0), name, font=F14)[2]
    draw.rounded_rectangle((x + (pic.width - tw)//2 - 12, y+pic.height+12,
                            x + (pic.width + tw)//2 + 12, y+pic.height+39),
                           radius=13, fill=(255, 255, 255, int(227 * reveal)))
    draw.text((x + (pic.width-tw)//2, y+pic.height+18), name, font=F14,
              fill=(20, 27, 20, int(255 * reveal)))

def write_scene(frame, t, language):
    d = ImageDraw.Draw(frame)
    copy = {
        "it": [
            ("NUOVE POSSIBILITÀ", ["Per la cucina.", "Per le bevande.", "Per il bar."]),
            ("TRE FORMATI", ["Un ingrediente.", "Tre formati.", "Tante idee."]),
            ("SCOPRI PROAMINA®", ["Il tuo formato.", "Il tuo prossimo", "esperimento."])
        ],
        "en": [
            ("NEW POSSIBILITIES", ["For cooking.", "For drinks.", "For cafés."]),
            ("THREE FORMATS", ["One ingredient.", "Three formats.", "More ideas."]),
            ("DISCOVER PROAMINA®", ["Your format.", "Your next", "experiment."])
        ],
    }[language]
    # Crossfade short typographic chapters, no flashing or rapid cuts.
    fades = [
        min(alpha(t, 0.0, 0.46), 1 - alpha(t, 2.20, 2.63)),
        min(alpha(t, 2.25, 2.65), 1 - alpha(t, 4.77, 5.17)),
        min(alpha(t, 4.80, 5.25), 1 - alpha(t, 7.48, 8.0))
    ]
    for (kicker, rows), fade in zip(copy, fades):
        if fade < 0.01:
            continue
        col = tuple(int(MUTED[i]*fade + CREAM[i]*(1-fade)) for i in range(3))
        d.text((66, 159), kicker, font=F14, fill=col)
        for i, row in enumerate(rows):
            c = tuple(int(INK[j]*fade + CREAM[j]*(1-fade)) for j in range(3))
            d.text((62, 205 + i*59), row, font=F46 if len(row)>15 else F51, fill=c)
    # Constant CTA chip: clear and legible in the website's visual language.
    label = "SCOPRI I FORMATI  ↗" if language=="it" else "EXPLORE FORMATS  ↗"
    d.rounded_rectangle((64, 424, 326, 477), radius=13, fill=LIME)
    d.text((84, 442), label, font=F17, fill=INK)

def frame_at(t, language):
    frame = BACKGROUND.convert("RGBA")
    for idx in (0, 1, 2):
        paste_product(frame, idx, t)
    write_scene(frame, t, language)
    return frame.convert("RGB")

def render(language):
    target = OUT / ("proamina-promo-" + language + ".mp4")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s:v", f"{W}x{H}",
        "-r", str(FPS), "-i", "pipe:0", "-an", "-c:v", "libx264",
        "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-r", str(FPS), str(target)
    ]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        for n in range(FPS * SECONDS):
            process.stdin.write(frame_at(n / FPS, language).tobytes())
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"FFmpeg render failed: {language}")
    print(f"Created {target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)")

if __name__ == "__main__":
    for lang in ("it", "en"):
        render(lang)
