"""Align display script (narasi_vo.txt) to Whisper word times; VO is placed at +OFFSET s in the video.
Writes src/words_aligned.json, src/captions.json and naskah/narasi.srt (re-synced)."""
import json, re, difflib
OFFSET = 1.0
paras = [p.strip() for p in open("naskah/narasi_vo.txt").read().strip().split("\n\n")]
import sys
W = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "naskah/whisper_words.json"))
def toks(text):  # keep "16 GB" as one token like whisper's "16GB"
    return re.sub(r"(\d+) GB", r"\1GB", text).split()
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace("ei", "ai") if s.lower().strip(".,?!") == "ei" else s.lower())
script = [(pi, w) for pi, p in enumerate(paras) for w in toks(p)]
a = [norm(w) for _, w in script]; b = [norm(x["w"]) for x in W]
times = [None] * len(a)
for op, a0, a1, b0, b1 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
    if op == "equal" or (op == "replace" and a1 - a0 == b1 - b0):
        for k in range(a1 - a0): times[a0 + k] = (W[b0 + k]["s"], W[b0 + k]["e"])
    elif op == "replace" and b1 > b0:  # spread the whisper span over the script words
        s0, e0 = W[b0]["s"], W[b1 - 1]["e"]; n = a1 - a0
        for k in range(n): times[a0 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
matched = sum(t is not None for t in times)
for i in range(len(times)):
    if times[i] is None:
        j = i
        while j < len(times) and times[j] is None: j += 1
        p = times[i - 1][1] if i else 0.0; q = times[j][0] if j < len(times) else W[-1]["e"]
        for k in range(i, j): times[k] = (p + (q - p) * (k - i) / (j - i), p + (q - p) * (k - i + 1) / (j - i))
out = [{"sec": script[i][0], "w": script[i][1].replace("GB", " GB") if re.match(r"\d+GB", script[i][1]) else script[i][1], "s": round(times[i][0] + OFFSET, 3), "e": round(times[i][1] + OFFSET, 3)} for i in range(len(a))]
json.dump(out, open("src/words_aligned.json", "w"), ensure_ascii=False, indent=0)
print(f"matched {matched}/{len(a)}")
for pi in range(len(paras)):
    ws = [o for o in out if o["sec"] == pi]; print(f'{ws[0]["s"]:6.2f}-{ws[-1]["e"]:6.2f} {paras[pi][:50]}')
# captions: sentence/comma chunks, max 2 lines x ~30 chars
MAXC = 30
caps = []; wi = 0
for pi, p in enumerate(paras):
    parts = [x for x in re.split(r"(?<=[.?!,:])\s+", p) if x]
    cur = []
    def flush():
        global wi
        if not cur: return
        txt = " ".join(cur); n = len(toks(txt))
        caps.append([out[wi]["s"], out[wi + n - 1]["e"], txt]); wi += n
    LIM = MAXC * 2 - 6
    pieces = []
    for part in parts:  # split long clauses into word groups that fit two lines
        w = part.split(); acc = []
        for x in w:
            if len(" ".join(acc + [x])) > LIM and acc: pieces.append(" ".join(acc)); acc = []
            acc.append(x)
        if acc: pieces.append(" ".join(acc))
    for part in pieces:
        if len(" ".join(cur + [part])) <= LIM and not (cur and len(cur[-1].split()) <= 2 and False): cur.append(part)
        else: flush(); cur = [part]
    flush()
def wrap(s):
    if len(s) <= MAXC: return s
    w = s.split(); best = min(((max(len(" ".join(w[:i])), len(" ".join(w[i:]))), i) for i in range(1, len(w))))
    return " ".join(w[:best[1]]) + "\n" + " ".join(w[best[1]:])
for i in range(len(caps) - 1):
    caps[i][1] = min(max(caps[i][1] + 0.3, caps[i][0] + 0.7), caps[i + 1][0] - 0.04)
caps[-1][1] += 0.5
ts = lambda t: "%02d:%02d:%02d,%03d" % (t // 3600, t % 3600 // 60, int(t % 60), round((t % 1) * 1000) % 1000)
open("naskah/narasi.srt", "w").write("\n".join(f"{k+1}\n{ts(s)} --> {ts(e)}\n{wrap(t)}\n" for k, (s, e, t) in enumerate(caps)))
json.dump([{"s": s, "e": e, "t": wrap(t)} for s, e, t in caps], open("src/captions.json", "w"), ensure_ascii=False, indent=0)
print("captions", len(caps), "last", caps[-1][1])
