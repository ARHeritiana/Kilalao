#!/usr/bin/env python3
"""Render the demo narration (app/src/main/assets/demo-text.js) to small Opus clips.

Offline neural TTS: sherpa-onnx with the Kokoro multi-lang v1.0 model, voice
af_heart (speaker 3), slightly slowed for a calm delivery. Only lines whose text
or settings changed are re-rendered; voice/manifest.json records a hash per clip.

  pip install sherpa-onnx soundfile numpy
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
  tar xjf kokoro-multi-lang-v1_0.tar.bz2
  KOKORO_DIR=$PWD/kokoro-multi-lang-v1_0 python3 scripts/make-voice.py

Needs node (to read demo-text.js) and ffmpeg with libopus.
"""
import hashlib, json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf, sherpa_onnx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'app', 'src', 'main', 'assets')
OUT = os.path.join(ASSETS, 'voice')
D = os.environ.get('KOKORO_DIR', 'kokoro-multi-lang-v1_0')
SID = int(os.environ.get('TTS_SID', 3))          # af_heart
SPEED = float(os.environ.get('TTS_SPEED', 0.93))
BITRATE = os.environ.get('VOICE_BITRATE', '28k')

def lines():
    js = subprocess.check_output(['node', '-e', 'process.stdout.write(JSON.stringify(require(process.argv[1])))', os.path.join(ASSETS, 'demo-text.js')])
    return {f'{game}-{i + 1}': text for game, texts in json.loads(js).items() for i, text in enumerate(texts)}

def engine():
    m = sherpa_onnx.OfflineTtsKokoroModelConfig(model=f'{D}/model.onnx', voices=f'{D}/voices.bin', tokens=f'{D}/tokens.txt',
                                                data_dir=f'{D}/espeak-ng-data', dict_dir=f'{D}/dict', lexicon=f'{D}/lexicon-us-en.txt', lang='en-us')
    mc = sherpa_onnx.OfflineTtsModelConfig(kokoro=m, num_threads=int(os.environ.get('TTS_THREADS', 2)), provider='cpu')
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=mc, max_num_sentences=1))

def main():
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(path)) if os.path.exists(path) else {}
    todo = lines(); tts = None
    for key, text in todo.items():
        digest = hashlib.sha256(f'{text}|{SID}|{SPEED}|{BITRATE}'.encode()).hexdigest()[:16]
        clip = os.path.join(OUT, key + '.ogg')
        if manifest.get(key, {}).get('hash') == digest and os.path.exists(clip):
            continue
        tts = tts or engine()
        audio = tts.generate(text, sid=SID, speed=SPEED)
        x = np.asarray(audio.samples, dtype=np.float32)
        # Gentle level and a short tail so clips never end abruptly.
        x = x / max(1e-6, np.abs(x).max()) * 0.85
        x = np.concatenate([x, np.zeros(int(0.25 * audio.sample_rate), dtype=np.float32)])
        with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
            sf.write(wav.name, x, audio.sample_rate)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav.name, '-af', 'afade=t=in:d=0.03',
                            '-c:a', 'libopus', '-b:a', BITRATE, '-ac', '1', '-application', 'voip', clip], check=True)
        manifest[key] = {'hash': digest, 'seconds': round(len(x) / audio.sample_rate, 2)}
        json.dump(manifest, open(path, 'w'), indent=1, sort_keys=True)
        print(key, manifest[key]['seconds'], flush=True)
    for key in [k for k in manifest if k not in todo]:
        manifest.pop(key)
        if os.path.exists(os.path.join(OUT, key + '.ogg')):
            os.remove(os.path.join(OUT, key + '.ogg'))
    json.dump(manifest, open(path, 'w'), indent=1, sort_keys=True)
    total = sum(v['seconds'] for v in manifest.values())
    print(f'{len(manifest)} clips, {total / 60:.1f} min', flush=True)
    print('VOICEDONE', flush=True)

if __name__ == '__main__':
    sys.exit(main())
