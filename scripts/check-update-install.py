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

def instrument(method, token=None):
    extra = ['-e', 'githubToken', token] if token else []
    output = run('shell', 'am', 'instrument', '-w', *extra, '-e', 'class', 'mg.kilalao.app.UpdateInstallTest#' + method,
                 'mg.kilalao.app.test/androidx.test.runner.AndroidJUnitRunner')
    if token:
        output = output.replace(token, '[redacted]')
    print(output, flush=True)
    if 'OK (1 test)' not in output:
        log = run('logcat', '-d', '-t', '150', 'AndroidRuntime:E', '*:S', check=False)
        print(log.replace(token, '[redacted]') if token else log, flush=True)
    assert 'OK (1 test)' in output and 'FAILURES' not in output, 'Android test failed'

instrument('prepareInstallerAndPermissionRoundTrip')
run('shell', 'am', 'start', '-W', '-a', 'android.settings.MANAGE_UNKNOWN_APP_SOURCES', '-d', 'package:mg.kilalao.app')
for _ in range(15):
    run('shell', 'uiautomator', 'dump', '/sdcard/kilalao-settings.xml', check=False)
    xml = run('shell', 'cat', '/sdcard/kilalao-settings.xml', check=False)
    try:
        switch = next((n for n in ET.fromstring(xml).iter('node') if 'Switch' in n.get('class', '')), None)
    except ET.ParseError:
        switch = None
    if switch is not None:
        if switch.get('checked') != 'true':
            bounds = list(map(int, re.findall(r'\d+', switch.get('bounds'))))
            run('shell', 'input', 'tap', str((bounds[0]+bounds[2])//2), str((bounds[1]+bounds[3])//2))
        break
    time.sleep(1)
else:
    print(xml, flush=True)
    raise RuntimeError('Android installation permission switch was not shown')
run('shell', 'input', 'keyevent', '4')
run('shell', 'am', 'force-stop', 'mg.kilalao.app')
run('shell', 'am', 'start', '-W', '-n', 'mg.kilalao.app/.MainActivity')
for _ in range(30):
    run('shell', 'uiautomator', 'dump', '/sdcard/kilalao-installer.xml', check=False)
    xml = run('shell', 'cat', '/sdcard/kilalao-installer.xml', check=False)
    try:
        nodes = ET.fromstring(xml).iter('node')
        button = next((n for n in nodes if n.get('package') == 'com.android.packageinstaller'
                       and n.get('text', '').lower() in ('update', 'install')
                       and n.get('clickable') == 'true' and n.get('enabled') == 'true'), None)
    except ET.ParseError:
        button = None
    if button is not None:
        bounds = list(map(int, re.findall(r'\d+', button.get('bounds'))))
        run('shell', 'input', 'tap', str((bounds[0]+bounds[2])//2), str((bounds[1]+bounds[3])//2))
        break
    time.sleep(1)
else:
    print(xml, flush=True)
    print(run('logcat', '-d', '-t', '150', 'AndroidRuntime:E', '*:S', check=False), flush=True)
    raise RuntimeError('Android installer confirmation was not shown')

for _ in range(60):
    if f'versionCode={expected_code} ' in run('shell', 'dumpsys', 'package', 'mg.kilalao.app'):
        break
    time.sleep(1)
else:
    raise RuntimeError('Verified release did not replace the baseline')

instrument('verifyAfterReplacement')
if os.environ.get('KILALAO_VERIFY_PRIVATE_RELEASE') == 'true':
    instrument('verifyAuthenticatedPrivateReleaseDownload', os.environ['GITHUB_TOKEN'])
print('PASS: checksum/signature checks, encrypted credentials, installation permission round-trip, Android installer update, saved Hanoi move, favorite and undo history.', flush=True)
