"""从保留的原图生成透明圆角 Logo 和桌面平台图标。需要 Pillow。"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src/assets/image'
ICONS = ROOT / 'src-tauri/icons'
SIZES = [(n, n) for n in (16, 20, 24, 32, 48, 64, 128, 256)]


def rounded(source):
    image = source.convert('RGBA')
    width, height = image.size
    mask = Image.new('L', (width * 4, height * 4))
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, width * 4 - 1, height * 4 - 1),
        radius=min(width, height) * 4 * 0.22, fill=255,
    )
    mask = mask.resize(image.size, Image.Resampling.LANCZOS)
    image.putalpha(ImageChops.multiply(image.getchannel('A'), mask))
    return image


master = rounded(Image.open(ASSETS / 'mascot-source.png'))
master.save(ASSETS / 'mascot.png')
master.resize((128, 128), Image.Resampling.LANCZOS).save(ASSETS / 'brand-icon.png')
for destination in ICONS.glob('*.png'):
    with Image.open(destination) as previous:
        size = previous.size
    master.resize(size, Image.Resampling.LANCZOS).save(destination)
master.save(ICONS / 'icon.ico', sizes=SIZES)
master.save(ICONS / 'icon.icns')
master.save(ASSETS / 'logo.ico', sizes=SIZES)
master.save(ICONS / 'tray-icon.ico', sizes=SIZES)

# 将状态标记放在圆角内侧，保持系统代理和 TUN 的语义与可辨识度。
for kind, color in [('sys', '#1A73E8'), ('tun', '#188038')]:
    variant = master.copy()
    draw = ImageDraw.Draw(variant)
    width, height = variant.size
    box = (width * .66, height * .12, width * .88, height * .34)
    stroke = max(1, round(width * .012))
    if kind == 'sys':
        draw.ellipse(box, fill=color, outline='#FFFFFF', width=stroke)
    else:
        draw.rounded_rectangle(box, radius=width * .045, fill=color,
                               outline='#FFFFFF', width=stroke)
    variant.save(ASSETS / f'tray-{kind}.png')
    variant.save(ICONS / f'tray-icon-{kind}.ico', sizes=SIZES)

print('Rounded RGBA logo, PNG, ICO, ICNS and colour tray icons generated.')
