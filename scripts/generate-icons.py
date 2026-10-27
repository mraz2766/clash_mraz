"""生成像素风「环流」品牌资源：应用图标、Windows/macOS 图标、托盘图标与侧栏品牌图。

图形定义在 16×16 像素网格上（与 design/logo/pixel-concepts.html 一致）。每个尺寸都用
整数倍放大：一个设计像素对应 k×k 个屏幕像素并居中，任何尺寸都不会出现模糊或
粗细不均的像素。只有圆角底板做抗锯齿。运行：
    python scripts/generate-icons.py      # 需要 Pillow
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src/assets/image'
ICONS = ROOT / 'src-tauri/icons'
ICO_SIZES = [16, 20, 24, 32, 48, 64, 128, 256]
SUPERSAMPLE = 4
TILE_RADIUS = 0.2217

ACCENT = '#005FB8'
WHITE = '#FFFFFF'
TILE_EDGE = '#E3E3E1'
SYS_PROXY = '#1E9E5A'
TUN = '#7C4DDB'
INK = '#000000'

# The ring, open at the top right. '#' marks a pixel.
RING = [
    '................',
    '................',
    '.....####.......',
    '....#####.......',
    '...###..........',
    '..###...........',
    '..##............',
    '..##........##..',
    '..##........##..',
    '..##........##..',
    '..###......###..',
    '...###....###...',
    '....########....',
    '.....######.....',
    '................',
    '................',
]
# The node in the gap carries the state; each keeps clear of both ring ends.
NODES = {
    'dot': [(11, 3), (12, 3), (11, 4), (12, 4)],
    # A 3×3 plus is the pixel stand-in for a circle (system proxy).
    'plus': [(12, 3), (11, 4), (12, 4), (13, 4), (12, 5)],
    'square': [(x, y) for y in (3, 4, 5) for x in (11, 12, 13)],
}
GLYPH = (2, 2, 14, 14)  # Occupied cells: columns/rows 2–13.


def ring_cells():
    return [(x, y) for y, row in enumerate(RING) for x, cell in enumerate(row) if cell == '#']


def tile_image(size, fill, edge=None):
    canvas = size * SUPERSAMPLE
    image = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    width = max(1, round(canvas * 0.004))
    ImageDraw.Draw(image).rounded_rectangle(
        (0, 0, canvas - 1, canvas - 1), radius=canvas * TILE_RADIUS,
        fill=fill, outline=edge, width=width if edge else 1,
    )
    return image.resize((size, size), Image.Resampling.LANCZOS)


def render(size, *, tile=None, edge=None, ring=ACCENT, node=ACCENT, shape='dot', fill_ratio=0.78):
    """Draw the glyph at a whole-number scale so every design pixel stays square and sharp."""
    image = tile_image(size, tile, edge) if tile else Image.new('RGBA', (size, size), (0, 0, 0, 0))
    span = GLYPH[2] - GLYPH[0]
    k = max(1, int(size * fill_ratio) // span)
    origin = (size - span * k) // 2 - GLYPH[0] * k
    draw = ImageDraw.Draw(image)
    for cells, color in ((ring_cells(), ring), (NODES[shape], node)):
        for x, y in cells:
            left, top = origin + x * k, origin + y * k
            draw.rectangle((left, top, left + k - 1, top + k - 1), fill=color)
    return image


def app_icon(size):
    # Reversed: white pixels on the accent tile, strongest on desktops and taskbars.
    return render(size, tile=ACCENT, ring=WHITE, node=WHITE)


def save_ico(path, factory):
    images = [factory(size) for size in ICO_SIZES]
    images[-1].save(path, sizes=[(s, s) for s in ICO_SIZES], append_images=images[:-1])


# Application icon, installer icon, Windows tiles, macOS bundle icon and sidebar.
master = app_icon(1024)
master.save(ASSETS / 'logo.png')
# Sidebar: exact renders for 100% / 150% / 200% scaling, so pixels never blur.
for scale, size in (('1x', 32), ('1.5x', 48), ('2x', 64)):
    app_icon(size).save(ASSETS / f'brand-icon@{scale}.png')
for destination in ICONS.glob('*.png'):
    with Image.open(destination) as previous:
        size = previous.size[0]
    app_icon(size).save(destination)
save_ico(ICONS / 'icon.ico', app_icon)
save_ico(ASSETS / 'logo.ico', app_icon)
master.save(ICONS / 'icon.icns')

# Colour tray icons: accent pixels on a white tile; the node's shape and colour mark the state.
tray_states = {
    'common': {'node': ACCENT, 'shape': 'dot'},
    'sys': {'node': SYS_PROXY, 'shape': 'plus'},
    'tun': {'node': TUN, 'shape': 'square'},
}
for kind, state in tray_states.items():
    def factory(size, state=state):
        return render(size, tile=WHITE, edge=TILE_EDGE if size >= 32 else None, **state)

    name = 'tray-icon.ico' if kind == 'common' else f'tray-icon-{kind}.ico'
    save_ico(ICONS / name, factory)
    if kind != 'common':
        factory(256).save(ASSETS / f'tray-{kind}.png')

# macOS template icons: black pixels only, same node shapes.
for kind, state in tray_states.items():
    def factory(size, shape=state['shape']):
        return render(size, ring=INK, node=INK, shape=shape, fill_ratio=0.9)

    asset_name = 'tray-mono.png' if kind == 'common' else f'tray-{kind}-mono.png'
    icon_name = 'tray-icon-mono.ico' if kind == 'common' else f'tray-icon-{kind}-mono.ico'
    factory(256).save(ASSETS / asset_name)
    save_ico(ICONS / icon_name, factory)
    if kind != 'common':
        save_ico(ICONS / f'tray-icon-{kind}-mono-new.ico', factory)

print('Pixel Orbit app, Windows, macOS, tray and sidebar icons generated.')
