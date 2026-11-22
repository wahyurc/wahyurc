"""Builds naskah_vo.md + narasi_vo.txt + narasi.srt from one source of truth.
SRT timing is an ESTIMATE (2.5 words/sec, VO starts at 1.0s, pauses between
sections) and will be re-synced to the real recording later."""
import re

SECTIONS = [
 ("Hook", "Siang terik, kamu masuk kamar, nyalakan AC, dan dalam beberapa menit semuanya terasa sejuk. Tapi tahukah kamu? AC sama sekali tidak membuat dingin. Yang dilakukan AC adalah memindahkan panas, dari dalam kamar, ke luar rumah. Bagaimana caranya?"),
 ("Analogi", "Coba ingat saat kulitmu basah lalu tertiup angin. Terasa dingin, kan? Itu karena air yang menguap membawa pergi panas dari tubuhmu. AC memakai prinsip yang sama, hanya saja dilakukan terus-menerus, di dalam pipa tertutup."),
 ("Refrigeran", "Bintang utamanya adalah refrigeran, cairan khusus yang bisa mendidih pada suhu sangat rendah. Refrigeran ini berputar dalam satu lingkaran, melewati empat komponen penting."),
 ("1 — Evaporator", "Pertama, evaporator di unit dalam. Udara kamar yang hangat dihisap kipas, disaring, lalu dilewatkan ke kisi-kisi logam yang dingin. Di dalam kisi itu, refrigeran bertekanan rendah menguap, dan menyerap panas dari udara. Udara yang keluar pun terasa sejuk. Bonusnya, uap air di udara ikut mengembun di kisi dingin, lalu dibuang lewat selang. Itulah kenapa kamar ber-AC terasa lebih kering."),
 ("2 — Kompresor", "Kedua, kompresor di unit luar, jantung dari sistem AC. Refrigeran yang sudah menjadi gas dihisap, lalu dimampatkan. Tekanannya naik, dan suhunya ikut melonjak, bahkan lebih panas dari udara di luar rumah."),
 ("3 — Kondensor", "Ketiga, kondensor. Gas panas itu mengalir ke kisi-kisi di unit luar, dan kipas besar meniupkan panasnya ke udara bebas. Itu sebabnya angin dari unit luar terasa hangat. Setelah panasnya lepas, refrigeran kembali menjadi cair."),
 ("4 — Katup ekspansi", "Keempat, katup ekspansi, atau pada banyak AC rumahan, pipa kapiler. Cairan bertekanan tinggi dipaksa melewati celah yang sangat sempit. Tekanannya turun drastis, suhunya anjlok, dan refrigeran yang kini dingin kembali ke evaporator. Siklus pun berulang, terus-menerus."),
 ("Kontrol", "Lalu, kapan AC berhenti? Sensor suhu di unit dalam terus memantau kamar. Begitu suhu yang kamu pilih tercapai, AC biasa mematikan kompresornya. Sementara AC inverter cukup memperlambat putarannya, sehingga suhu lebih stabil dan listrik lebih hemat."),
 ("Tips perawatan", "Supaya AC tetap dingin dan awet, ada tiga kebiasaan sederhana. Satu, bersihkan filter secara rutin. Filter yang penuh debu membuat udara tertahan, AC bekerja lebih berat, dan tagihan listrik ikut naik. Dua, jangan halangi unit luar. Beri ruang di sekitarnya, supaya panas bisa dibuang dengan lancar. Tiga, panggil teknisi untuk servis berkala, agar kisi-kisi bersih dan refrigeran tetap cukup. Dan selama AC menyala, tutup pintu serta jendela, supaya dingin tidak bocor ke luar."),
 ("Penutup", "Jadi, ingat empat langkahnya: menyerap, memampatkan, membuang, lalu mengembang. Setiap hembusan sejuk dari AC, sebenarnya adalah panas kamarmu yang sedang diantar keluar."),
 ("Ajakan share", "Nah, kalau kamu punya teman yang AC-nya selalu disetel paling dingin, atau yang filternya belum dicuci sejak zaman dulu, kirimkan video ini ke dia. Anggap saja, kamu sedang mengirim sedikit kesejukan."),
]

WPS, START, GAP = 2.5, 1.0, 0.45
MAXC = 32  # chars per line for portrait captions

def chunks(text):
    # split on sentence/comma boundaries, then pack into <= 2 lines of MAXC chars
    parts = [p.strip() for p in re.split(r"(?<=[.?!,:])\s+", text) if p.strip()]
    out, cur = [], ""
    for p in parts:
        cand = (cur + " " + p).strip()
        if len(cand) <= MAXC * 2 - 4: cur = cand
        else:
            if cur: out.append(cur)
            while len(p) > MAXC * 2 - 4:  # very long clause: split by words
                w = p.split(); acc = ""
                while w and len(acc + " " + w[0]) <= MAXC * 2 - 4: acc = (acc + " " + w.pop(0)).strip()
                out.append(acc); p = " ".join(w)
            cur = p
    if cur: out.append(cur)
    return out

def wrap(s):
    if len(s) <= MAXC: return s
    w = s.split(); best = None
    for i in range(1, len(w)):
        a, b = " ".join(w[:i]), " ".join(w[i:])
        sc = max(len(a), len(b))
        if best is None or sc < best[0]: best = (sc, a, b)
    return best[1] + "\n" + best[2]

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

t = START; srt = []; idx = 1; total_words = 0
for name, text in SECTIONS:
    for c in chunks(text):
        n = len(c.split()); total_words += n
        d = max(1.0, n / WPS)
        srt.append(f"{idx}\n{ts(t)} --> {ts(t + d - 0.04)}\n{wrap(c)}\n"); idx += 1
        t += d + (0.15 if c.endswith((".", "?", "!")) else 0.0)
    t += GAP
vo_end = t - GAP
open("narasi.srt", "w").write("\n".join(srt))
open("narasi_vo.txt", "w").write("\n\n".join(text for _, text in SECTIONS) + "\n")
md = [f"# Naskah Voiceover — Cara Kerja AC\n",
      f"Perkiraan: {total_words} kata ≈ {vo_end - START:.0f} detik suara ≈ {vo_end + 1.5:.0f} detik video · Portrait 1080×1920 (Instagram Reels / TikTok)\n",
      "Panduan rekam: bicara santai, jeda singkat di tiap koma, jeda ±0,5 detik antar-bagian. Durasi asli rekamanmu yang akan jadi acuan; SRT ini akan disinkron ulang ke rekamanmu.\n"]
for name, text in SECTIONS: md.append(f"**[{name}]** {text}\n")
open("naskah_vo.md", "w").write("\n".join(md))
print(total_words, "words; VO ~", round(vo_end - START, 1), "s; video ~", round(vo_end + 1.5, 1), "s;", idx - 1, "captions")
