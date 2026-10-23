"""生成「环流」品牌资源：应用图标、Windows/macOS 图标、托盘图标与侧栏品牌图。

几何与 design/logo/clash-orbit.svg 一致。每个尺寸单独以 4 倍超采样绘制后缩小，
32px 及以下改用加粗版本，保证标题栏和托盘里依然清晰。运行：
    python scripts/generate-icons.py      # 需要 Pillow
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src/assets/image'
ICONS = ROOT / 'src-tauri/icons'
ICO_SIZES = [16, 20, 24, 32, 48, 64, 128, 256]
SUPERSAMPLE = 4

ACCENT = '#005FB8'
SYS_PROXY = '#1E9E5A'
TUN = '#7C4DDB'
TILE = '#FFFFFF'
TILE_EDGE = '#E3E3E1'
INK = '#000000'

# Proportions of the canvas side. `gap` is the open arc, counter-clockwise from 3 o'clock.
APP = {'r': 0.2861, 'w': 0.0732, 'gap': (20, 70), 'node': 0.0537}
# Small sizes widen the gap so the node stays separate from the ring ends at 16px.
APP_SMALL = {'r': 0.29, 'w': 0.10, 'gap': (5, 85), 'node': 0.10}
TRAY = {'r': 0.30, 'w': 0.11, 'gap': (5, 85), 'node': 0.10}
TILE_RADIUS = 0.2217


def point(size, r, angle):
    rad = math.radians(angle)
    return size / 2 + r * math.cos(rad), size / 2 - r * math.sin(rad)


def draw_ring(draw, size, geom, color):
    r, w = geom['r'] * size, geom['w'] * size
    start, end = geom['gap']
    outer = r + w / 2
    box = (size / 2 - outer, size / 2 - outer, size / 2 + outer, size / 2 + outer)
    # Pillow measures clockwise from 3 o'clock with y down; skip the gap from -end to -start.
    draw.arc(box, start=-start, end=360 - end, fill=color, width=round(w))
    for angle in (start, end):
        x, y = point(size, r, angle)
        draw.ellipse((x - w / 2, y - w / 2, x + w / 2, y + w / 2), fill=color)


def draw_node(draw, size, geom, color, shape='dot', hollow=False):
    """The node sits in the gap; its shape and colour carry the tray state."""
    x, y = point(size, geom['r'] * size, sum(geom['gap']) / 2)
    stroke = max(1, round(geom['w'] * size * 0.55))
    if shape == 'dot':
        n = geom['node'] * size * (1.2 if hollow else 1)
        box = (x - n, y - n, x + n, y + n)
        if hollow:
            draw.ellipse(box, outline=color, width=stroke)
        else:
            draw.ellipse(box, fill=color)
    else:
        half = geom['node'] * size * 1.1
        box = (x - half, y - half, x + half, y + half)
        radius = half * 0.45
        if hollow:
            draw.rounded_rectangle(box, radius=radius, outline=color, width=stroke)
        else:
            draw.rounded_rectangle(box, radius=radius, fill=color)


def render(size, geom, *, tile=True, ring=ACCENT, node=ACCENT, shape='dot', hollow=False):
    canvas = size * SUPERSAMPLE
    image = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if tile:
        edge = max(1, round(canvas * 0.004)) if size >= 48 else 0
        draw.rounded_rectangle(
            (0, 0, canvas - 1, canvas - 1), radius=canvas * TILE_RADIUS,
            fill=TILE, outline=TILE_EDGE if edge else None, width=edge or 1,
        )
    draw_ring(draw, canvas, geom, ring)
    draw_node(draw, canvas, geom, node, shape, hollow)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def app_icon(size):
    return render(size, APP_SMALL if size <= 32 else APP)


def save_ico(path, factory):
    images = [factory(size) for size in ICO_SIZES]
    images[-1].save(path, sizes=[(s, s) for s in ICO_SIZES], append_images=images[:-1])


# Application icon, installer icon, Windows tiles and macOS bundle icon.
master = app_icon(1024)
master.save(ASSETS / 'logo.png')
app_icon(128).save(ASSETS / 'brand-icon.png')
for destination in ICONS.glob('*.png'):
    with Image.open(destination) as previous:
        size = previous.size[0]
    app_icon(size).save(destination)
save_ico(ICONS / 'icon.ico', app_icon)
save_ico(ASSETS / 'logo.ico', app_icon)
master.save(ICONS / 'icon.icns')

# Colour tray icons: the tile keeps contrast on light and dark taskbars.
tray_states = {
    'common': {'node': ACCENT, 'shape': 'dot'},
    'sys': {'node': SYS_PROXY, 'shape': 'dot'},
    'tun': {'node': TUN, 'shape': 'square'},
}
for kind, state in tray_states.items():
    factory = lambda size, state=state: render(size, TRAY, **state)
    name = 'tray-icon.ico' if kind == 'common' else f'tray-icon-{kind}.ico'
    save_ico(ICONS / name, factory)
    if kind != 'common':
        factory(256).save(ASSETS / f'tray-{kind}.png')

# Monochrome template icons: glyph only; hollow circle / hollow square mark the state.
mono_states = {
    'common': {'shape': 'dot', 'hollow': False},
    'sys': {'shape': 'dot', 'hollow': True},
    'tun': {'shape': 'square', 'hollow': True},
}
for kind, state in mono_states.items():
    factory = lambda size, state=state: render(size, TRAY, tile=False, ring=INK, node=INK, **state)
    asset_name = 'tray-mono.png' if kind == 'common' else f'tray-{kind}-mono.png'
    icon_name = 'tray-icon-mono.ico' if kind == 'common' else f'tray-icon-{kind}-mono.ico'
    factory(256).save(ASSETS / asset_name)
    save_ico(ICONS / icon_name, factory)
    if kind != 'common':
        save_ico(ICONS / f'tray-icon-{kind}-mono-new.ico', factory)

print('Orbit app, Windows, macOS, tray and sidebar icons generated.')
