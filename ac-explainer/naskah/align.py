"""Align script words to Whisper word timestamps -> per-word times on the VIDEO timeline
(VO trimmed by LEAD seconds so speech starts at 1.0s). Writes words_aligned.json,
sections.json and a re-synced narasi.srt."""
import json, re, difflib, sys
sys.path.insert(0, "naskah")
import importlib.util
spec = importlib.util.spec_from_file_location("b", "naskah/build_srt.py")
src = open("naskah/build_srt.py").read()
SECTIONS = eval(src[src.index("SECTIONS = [") + len("SECTIONS = "): src.index("]\n\nWPS") + 1])
LEAD = 0.676  # leading silence trimmed from the recording
SPEECH_START = 1.676
W = json.load(open("naskah/whisper_words.json"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
script = []  # (section, word)
for si, (name, text) in enumerate(SECTIONS):
    for w in text.split(): script.append((si, w))
a = [norm(w) for _, w in script]; b = [norm(x["w"]) for x in W]
sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
times = [None] * len(a)
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op == "equal" or (op == "replace" and a1 - a0 == b1 - b0):
        for k in range(a1 - a0): times[a0 + k] = (W[b0 + k]["s"], W[b0 + k]["e"])
    elif op == "replace" and a1 - a0 == 2 and b1 - b0 == 1:  # e.g. "ke luar" vs "keluar"
        s0, e0 = W[b0]["s"], W[b0]["e"]; m = (s0 + e0) / 2
        times[a0], times[a0 + 1] = (s0, m), (m, e0)
matched = sum(t is not None for t in times)
# interpolate gaps
for i in range(len(times)):
    if times[i] is None:
        j = i
        while j < len(times) and times[j] is None: j += 1
        prev = times[i - 1][1] if i > 0 else SPEECH_START
        nxt = times[j][0] if j < len(times) else W[-1]["e"]
        n = j - i
        for k in range(n):
            s0 = prev + (nxt - prev) * k / n; s1 = prev + (nxt - prev) * (k + 1) / n
            times[i + k] = (s0, s1)
times[0] = (max(times[0][0], SPEECH_START), times[0][1])
if times[0][0] >= times[0][1]: times[0] = (SPEECH_START, SPEECH_START + 0.3)
# whisper smears the first phrase into the lead-in silence; the recording's first
# phrase ("Siang terik, kamu masuk kamar,") is spoken between 1.676 and 2.58 (silencedetect)
first = [i for i in range(5)]
w0, w1 = times[0][0], times[4][1]
for i in first:
    s0, e0 = times[i]
    times[i] = (1.676 + (s0 - w0) / (w1 - w0) * (2.58 - 1.676), 1.676 + (e0 - w0) / (w1 - w0) * (2.58 - 1.676))
out = [{"sec": script[i][0], "w": script[i][1], "s": round(times[i][0] - LEAD, 3), "e": round(times[i][1] - LEAD, 3)} for i in range(len(a))]
json.dump(out, open("naskah/words_aligned.json", "w"), ensure_ascii=False, indent=0)
secs = []
for si, (name, _) in enumerate(SECTIONS):
    ws = [o for o in out if o["sec"] == si]
    secs.append({"name": name, "start": ws[0]["s"], "end": ws[-1]["e"]})
json.dump(secs, open("naskah/sections.json", "w"), ensure_ascii=False, indent=1)
print(f"matched {matched}/{len(a)}")
for s in secs: print(f'{s["start"]:7.2f} - {s["end"]:7.2f}  {s["name"]}')

# --- re-synced SRT: same caption chunks as build_srt, timed by the aligned words ---
exec(src[src.index("MAXC ="): src.index("t = START")])
srt = []; idx = 1; wi = 0
for si, (name, text) in enumerate(SECTIONS):
    for c in chunks(text):
        n = len(c.split()); s0 = out[wi]["s"]; e0 = out[wi + n - 1]["e"]; wi += n
        srt.append([s0, e0, wrap(c)])
for i in range(len(srt) - 1):  # hold caption until next one (max +0.6s), never overlap
    srt[i][1] = min(max(srt[i][1], srt[i][0] + 0.8), srt[i + 1][0] - 0.04, srt[i][1] + 0.6) if srt[i + 1][0] - srt[i][1] > 0.04 else srt[i + 1][0] - 0.04
srt[-1][1] += 0.4
open("naskah/narasi.srt", "w").write("\n".join(f"{k+1}\n{ts(s)} --> {ts(e)}\n{t}\n" for k, (s, e, t) in enumerate(srt)))
json.dump([{"s": s, "e": e, "t": t} for s, e, t in srt], open("naskah/captions.json", "w"), ensure_ascii=False, indent=0)
print("captions", len(srt), "last end", srt[-1][1])
