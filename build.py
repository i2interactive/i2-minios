#!/usr/bin/env python3
"""Build i2 miniOS into one offline HTML file:  python3 build.py  ->  dist/i2minios.html"""
import os, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(ROOT, 'src')
ORDER = ['core', 'sys', 'cast', 'world', 'play', 'learn', 'three', 'music', 'robo', 'meta', 'apps1', 'apps2', 'apps3', 'apps4',
         'sports1', 'sports2', 'apps5', 'apps6', 'apps7', 'apps8', 'apps9', 'apps10', 'apps11', 'demo', 'brand', 'shell']   # order matters: later files use earlier ones
import base64, json, glob
_mus = sorted(glob.glob(os.path.join(ROOT, 'music', '*.mp3')))   # built-in background tunes (original, made for i2 miniOS)
_names = {}
if os.path.exists(os.path.join(ROOT, 'music', 'names.json')): _names = json.load(open(os.path.join(ROOT, 'music', 'names.json')))
BGMJS = 'const BGM_BUILTIN = ' + json.dumps([{'name': _names.get(os.path.basename(f), os.path.basename(f)[:-4]), 'd': base64.b64encode(open(f, 'rb').read()).decode()} for f in _mus]) + ';\n'
app = '\n'.join(open(os.path.join(SRC, f + '.js'), encoding='utf-8').read() for f in ORDER).replace('/* ── background music:', BGMJS + '/* ── background music:', 1)
html = open(os.path.join(SRC, 'tpl.html'), encoding='utf-8').read()
html = html.replace('/*__FONTS__*/', open(os.path.join(SRC, 'fonts.css'), encoding='utf-8').read(), 1)
html = html.replace('/*__THREE__*/', open(os.path.join(ROOT, 'vendor', 'three.min.js'), encoding='utf-8').read(), 1)
i = html.index('/*__APP__*/'); html = html[:i] + app + html[i + len('/*__APP__*/'):]
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
out = os.path.join(ROOT, 'dist', 'i2minios.html'); open(out, 'w', encoding='utf-8').write(html)
try: subprocess.run(['node', '--check', '-'], input=app.encode(), check=True); print('JS syntax OK')
except (FileNotFoundError, subprocess.CalledProcessError) as e: print('(skipped / failed node --check)', e)
print(f'Built {out}  ({len(html)//1024} KB)')
