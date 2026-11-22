"""SFX layer synced to the scene cuts (whoosh peaks on each cut, clicks on button presses)."""
import numpy as np, wave, sys
SR = 48000; FPS = 24
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 30.5
N = int(SR * DUR); out = np.zeros(N); rng = np.random.default_rng(7)
def add(sig, at):
    i = max(0, int(at * SR)); j = min(N, i + len(sig)); out[i:j] += sig[: j - i]
def whoosh(d=0.42, g=0.5):
    n = int(d * SR); nz = rng.standard_normal(n); u = np.arange(n) / n
    a = 0.02 + 0.45 * u; y = np.zeros(n); acc = 0.0
    for k in range(n): acc += a[k] * (nz[k] - acc); y[k] = acc
    return y * np.sin(np.pi * u) ** 2 * g
def click(f0=2400, g=0.35):
    n = int(0.06 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * t) * np.exp(-t * 90) * g
def pop(g=0.25):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * g
def chime(g=0.07):
    n = int(1.2 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * t) / (i + 1) for i, f in enumerate([1046.5, 1318.5, 1568])) * np.exp(-t * 3) * g
CUTS = [72, 132, 180, 216, 276, 324, 372, 378, 444, 480, 516, 534, 546, 564, 582, 600, 624]
for c in CUTS: add(whoosh(), c / FPS - 0.3)          # whoosh peaks right on the cut
for c in [156, 668]: add(click(), c / FPS)           # Learn click, Get it now click
for c in [12, 15, 18, 24, 30, 182, 187, 190]: add(pop(), c / FPS)  # tags popping
for c in [384, 646]: add(chime(), c / FPS)           # name reveal, end title
out = np.tanh(out * 1.2) * 0.9
data = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
