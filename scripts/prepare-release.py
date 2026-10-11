"""Validate the actual signed APK, then emit the updater's bounded metadata."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
apk = root / 'app/build/outputs/apk/release/app-release.apk'
tools = Path(os.environ['ANDROID_HOME']) / 'build-tools/35.0.0'
subprocess.run([str(tools / 'apksigner'), 'verify', '--verbose', str(apk)], check=True)
badging = subprocess.check_output([str(tools / 'aapt'), 'dump', 'badging', str(apk)], text=True)
package = re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", badging)
sdk = re.search(r"sdkVersion:'(\d+)'", badging)
assert package and sdk, 'APK has no package or SDK information'
app_id, code, version = package.groups()
assert app_id == 'mg.kilalao.app' and int(code) > 0 and int(sdk[1]) >= 26
assert version == json.loads((root / 'package.json').read_text())['version']
assert re.fullmatch(r'\d+\.\d+\.\d+', version)
size = apk.stat().st_size
assert 0 < size <= 64 * 1024 * 1024
digest = hashlib.sha256(apk.read_bytes()).hexdigest()
name = f'Kilalao-{version}.apk'
out = root / 'release'
out.mkdir(exist_ok=True)
shutil.copyfile(apk, out / name)
(out / 'update.json').write_text(json.dumps({
    'applicationId': app_id, 'versionCode': int(code), 'versionName': version,
    'minSdk': int(sdk[1]), 'size': size, 'sha256': digest,
    'apkUrl': f'https://github.com/ARHeritiana/Kilalao/releases/download/v{version}/{name}',
}, indent=2) + '\n')
(out / 'SHA256SUMS').write_text(f'{digest}  {name}\n')
print(f'Prepared signed Kilalao {version} (version code {code}).')
