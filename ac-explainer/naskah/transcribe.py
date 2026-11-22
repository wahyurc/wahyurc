import json, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
prompt = open("naskah/narasi_vo.txt").read()[:800]
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
raw = subprocess.run(["ffmpeg","-v","error","-i","audio/Suara Voiceover.wav","-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, info = m.transcribe(audio, language="id", word_timestamps=True, initial_prompt=prompt, vad_filter=False, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
json.dump(words, open("naskah/whisper_words.json", "w"), ensure_ascii=False, indent=0)
print(len(words), words[:5], words[-5:])
