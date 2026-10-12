"""Test only on a disposable emulator: real installer replacement, then saved progress."""
import os
import json
from pathlib import Path
import re
import subprocess
import time
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
expected_code = json.loads((root / 'release/update.json').read_text())['versionCode']
adb = str(Path(os.environ['ANDROID_HOME']) / 'platform-tools/adb')
serial = os.environ.get('ANDROID_SERIAL', 'emulator-5554')
assert serial.startswith('emulator-'), 'This test is restricted to a disposable emulator'

def run(*args, check=True):
    return subprocess.run([adb, '-s', serial, *args], text=True, capture_output=True, check=check).stdout

for _ in range(120):
    if run('shell', 'getprop', 'sys.boot_completed', check=False).strip() == '1':
        break
    time.sleep(2)
else:
    raise RuntimeError('Android emulator did not finish booting')

run('shell', 'settings', 'put', 'global', 'window_animation_scale', '0')
run('shell', 'settings', 'put', 'global', 'transition_animation_scale', '0')
run('shell', 'settings', 'put', 'global', 'animator_duration_scale', '0')
run('shell', 'input', 'keyevent', '82')
run('install', '-r', str(root / 'app/build/outputs/apk/debug/app-debug.apk'))
run('install', '-r', str(root / 'app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk'))

def instrument(method):
    output = run('shell', 'am', 'instrument', '-w', '-e', 'class', 'mg.kilalao.app.UpdateInstallTest#' + method,
                 'mg.kilalao.app.test/androidx.test.runner.AndroidJUnitRunner')
    print(output, flush=True)
    assert 'OK (1 test)' in output and 'FAILURES' not in output, 'Android test failed'

instrument('prepareInstallerAndPermissionRoundTrip')
for _ in range(30):
    run('shell', 'uiautomator', 'dump', '/sdcard/kilalao-installer.xml', check=False)
    xml = run('shell', 'cat', '/sdcard/kilalao-installer.xml', check=False)
    try:
        nodes = ET.fromstring(xml).iter('node')
        button = next((n for n in nodes if n.get('text', '').lower() == 'update' and n.get('clickable') == 'true'), None)
    except ET.ParseError:
        button = None
    if button is not None:
        bounds = list(map(int, re.findall(r'\d+', button.get('bounds'))))
        run('shell', 'input', 'tap', str((bounds[0]+bounds[2])//2), str((bounds[1]+bounds[3])//2))
        break
    time.sleep(1)
else:
    raise RuntimeError('Android installer confirmation was not shown')

for _ in range(60):
    if f'versionCode={expected_code} ' in run('shell', 'dumpsys', 'package', 'mg.kilalao.app'):
        break
    time.sleep(1)
else:
    raise RuntimeError('Verified release did not replace the baseline')

instrument('verifyAfterReplacement')
print('PASS: checksum/signature checks, encrypted credentials, installation permission round-trip, Android installer update, saved Hanoi move, favorite and undo history.', flush=True)
