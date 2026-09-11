"""从保留的原图生成圆角品牌资源、桌面图标与 macOS 单色托盘图标。"""
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


def subject_mask(source):
    """从近白背景中提取主体，生成适合 macOS template icon 的实心轮廓。"""
    image = source.convert('RGB')
    mask = Image.new('L', image.size)
    mask.putdata([
        0 if min(pixel) > 242 and max(pixel) - min(pixel) < 16 else 255
        for pixel in image.get_flattened_data()
    ])
    return mask


def monochrome(source, kind='common'):
    mask = subject_mask(source)
    image = Image.new('RGBA', source.size, (0, 0, 0, 0))
    image.putalpha(mask)
    if kind != 'common':
        draw = ImageDraw.Draw(image)
        width, height = image.size
        box = (width * .67, height * .12, width * .87, height * .32)
        stroke = max(2, round(width * .025))
        if kind == 'sys':
            draw.ellipse(box, fill=(0, 0, 0, 0), outline=(0, 0, 0, 255), width=stroke)
        else:
            draw.rounded_rectangle(box, radius=width * .04,
                                   fill=(0, 0, 0, 0),
                                   outline=(0, 0, 0, 255), width=stroke)
    return image


master = rounded(Image.open(ASSETS / 'mascot-source.png'))
master.save(ASSETS / 'mascot.png')
master.resize((128, 128), Image.Resampling.LANCZOS).save(ASSETS / 'brand-icon.png')
for destination in ICONS.glob('*.png'):
    with Image.open(destination) as previous:
        size = previous.size
    master.resize(size, Image.Resampling.LANCZOS).save(destination)
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

# macOS 模板图标只保留海豚轮廓，并用圆环/圆角方形区分状态。
for kind in ('common', 'sys', 'tun'):
    variant = monochrome(Image.open(ASSETS / 'mascot-source.png'), kind)
    asset_name = 'tray-mono.png' if kind == 'common' else f'tray-{kind}-mono.png'
    icon_name = 'tray-icon-mono.ico' if kind == 'common' else f'tray-icon-{kind}-mono.ico'
    variant.save(ASSETS / asset_name)
    variant.save(ICONS / icon_name, sizes=SIZES)
    if kind != 'common':
        variant.save(ICONS / f'tray-icon-{kind}-mono-new.ico', sizes=SIZES)

print('Rounded brand, app, colour tray and monochrome template icons generated.')
