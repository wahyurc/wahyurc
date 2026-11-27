import json, subprocess, sys, numpy as np
AUDIO = sys.argv[1]
from faster_whisper import WhisperModel
prompt = open("naskah/spoken_paras.txt").read()[:800]
raw = subprocess.run(["ffmpeg","-v","error","-i",AUDIO,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
segs,_ = m.transcribe(a, language="id", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
W=[{"w":w.word.strip(),"s":round(float(w.start),3),"e":round(float(w.end),3)} for s in segs for w in s.words]
json.dump(W, open(sys.argv[2],"w"), ensure_ascii=False)
print(len(W), W[:4], W[-4:])
