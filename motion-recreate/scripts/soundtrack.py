"""Synthesised original soundtrack: warm pad + beat + whooshes/clicks on every cut."""
import numpy as np, wave, sys
SR = 48000; DUR = 28.0; N = int(SR * DUR)
t = np.arange(N) / SR
out = np.zeros(N)
rng = np.random.default_rng(7)
BPM = 120; beat = 60 / BPM

def add(sig, at):
    i = int(at * SR); j = min(N, i + len(sig)); out[i:j] += sig[: j - i]

# pad chords (Fmaj7 - Am7 - Dm9 - Bbmaj7), 4 beats each... loop
chords = [[174.6, 220, 261.6, 329.6], [220, 261.6, 329.6, 392], [146.8, 220, 261.6, 329.6], [116.5, 233.1, 293.7, 349.2]]
bar = beat * 4
for b in range(int(DUR / bar) + 1):
    st = b * bar; n = int(bar * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.3) * np.minimum(1, (bar - tt) / 0.4)
    sig = sum(np.sin(2 * np.pi * fr * tt) * 0.5 + np.sin(2 * np.pi * fr * 2.003 * tt) * 0.12 for fr in chords[b % 4])
    add(sig * env * 0.035, st)
# kick / hat / clap
def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = 50 + 120 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.55
def hat():
    n = int(0.05 * SR); nz = rng.standard_normal(n); nz = np.diff(np.concatenate([[0], nz]))
    return nz * np.exp(-np.arange(n) / SR * 80) * 0.06
def clap():
    n = int(0.18 * SR); nz = rng.standard_normal(n)
    return nz * np.exp(-np.arange(n) / SR * 22) * 0.12
k = 0.0
while k < DUR - 0.4:
    i = round(k / beat * 2)
    if not (15.4 < k < 15.85) and not (21.4 < k < 21.6):
        if i % 2 == 0: add(kick(), k)
        add(hat(), k + beat / 4)
        if i % 4 == 2: add(clap(), k)
    k += beat / 2
# whoosh on cuts
def whoosh(d=0.45, up=True):
    n = int(d * SR); nz = rng.standard_normal(n); tt = np.arange(n) / n
    # one-pole lowpass with sweeping cutoff
    y = np.zeros(n); a_sweep = (0.02 + 0.5 * (tt if up else 1 - tt))
    acc = 0.0
    for j in range(n): acc += a_sweep[j] * (nz[j] - acc); y[j] = acc
    return y * np.sin(np.pi * tt) ** 2 * 0.5
cuts = [3.2, 5.4, 7.4, 9.0, 11.4, 13.25, 15.5, 15.8, 18.5, 20.15, 21.6, 22.5, 23.6]
for c in cuts: add(whoosh(), max(0, c - 0.3))
def click(f0=2200):
    n = int(0.06 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 90) * 0.3
for c in [0.5, 1.0, 6.32, 21.65, 21.8, 21.95, 25.3]: add(click(), c)
def chime(at):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fr * tt) / (i + 1) for i, fr in enumerate([1046.5, 1318.5, 1568]))
    add(s * np.exp(-tt * 3) * 0.08, at)
for c in [1.6, 6.32, 15.85, 24.6]: chime(c)
# master fade
out *= np.minimum(1, t / 0.2) * np.minimum(1, (DUR - t) / 1.2)
out = np.tanh(out * 1.4) * 0.8
data = (np.stack([out, np.roll(out, 90)], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
