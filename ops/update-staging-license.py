#!/usr/bin/env python3
"""One-time license update. Args: accepted full SHA, adjacent artifact SHA-256.
Uses the inspected root-owned helper for existing VPS-wide backup/restore checks.
No DNS, TLS issuance, privileges, firewall or production changes.
"""
import base64
from datetime import datetime, timezone
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import sys
import time
import hashlib

ROOT = Path('/var/www/dev.onlyempowerment.com')
OLD = ROOT / 'releases/701664c1b4af37287f4b16fcf8a76a41d09f00c7'
CONF = Path('/etc/nginx/sites-available/dev.onlyempowerment.com')
ORIGINAL = ROOT / 'private/deploy-staging-foundation.py'


def main():
    assert os.geteuid() == 0, 'Run with sudo on the VPS.'
    assert len(sys.argv) == 3 and re.fullmatch('[a-f0-9]{40}', sys.argv[1]) and re.fullmatch('[a-f0-9]{64}', sys.argv[2])
    sha, artifact_hash = sys.argv[1:]
    assert hashlib.sha256(ORIGINAL.read_bytes()).hexdigest() == '9bc8bb3c7f8cb209530c98b8f56bc5ff96a97f7290a885b318d9294a8fff26fe'
    spec = importlib.util.spec_from_file_location('existing_backup', ORIGINAL)
    d = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(d)
    assert d.run(['hostname', '-f']).strip() == b'vps1.phoenix233.com'
    d.START = datetime.now(timezone.utc)
    source = Path(__file__).resolve().parent
    raw = (source / 'license-artifact.json').read_bytes()
    assert d.digest(raw) == artifact_hash, 'Artifact differs from reviewed package.'
    files = {n: base64.b64decode(v, validate=True) for n, v in json.loads(raw).items()}
    expected = {'index.html', 'build.json', 'favicon.svg', 'robots.txt', 'THIRD_PARTY_NOTICES.txt', 'LICENSE.txt', 'COPYRIGHT.txt', 'SHA256SUMS'}
    assets = {n for n in files if re.fullmatch(r'assets/index-[A-Za-z0-9_-]+\.(js|css)', n)}
    assert len(assets) == 2 and set(files) == expected | assets
    sums = {n: h for h, n in (line.split('  ', 1) for line in files['SHA256SUMS'].decode().splitlines())}
    assert set(sums) == set(files) - {'SHA256SUMS'}
    assert all(d.digest(files[n]) == h for n, h in sums.items())
    assert d.digest(files['LICENSE.txt']) == '0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0'
    meta = json.loads(files['build.json'])
    assert meta == {'version': '0.1.0-dev.1', 'commit': sha, 'dirty': False, 'tag': None, 'source': 'https://github.com/jimlunsford/only-empowerment/commit/' + sha}
    before = CONF.read_bytes()
    assert d.digest(before) == '4ed6af083d80548bba65ca53c2dbbcaa7b18891a39b93bdcf56c8a133b4ab707', 'Nginx changed; inspect before reuse.'
    current = ROOT / 'current'
    assert current.is_symlink() and current.resolve() == OLD
    assert d.LINK.is_symlink() and d.LINK.resolve() == CONF
    release = ROOT / 'releases' / sha
    assert not release.exists(), 'Release exists; inspect, do not overwrite.'
    d.run(['nginx', '-t'])
    hosts = ['jimlunsford.com', 'jimlunsford.net', 'bonumark.org', 'phoenix233.com', 'ltdcsserver.com', 'jiml.net']
    def health():
        return [d.run(['curl', '-4', '-fsS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', 'https://' + h]).decode() for h in hosts]
    assert health() == ['200'] * len(hosts)
    d.backup()
    os.umask(0o022)
    release.mkdir(mode=0o755)
    for n, data in files.items():
        p = release / n
        p.parent.mkdir(exist_ok=True, mode=0o755)
        p.write_bytes(data)
        p.chmod(0o444)
    (release / 'assets').chmod(0o555)
    release.chmod(0o555)
    private = ROOT / 'private'
    shutil.copy2(Path(__file__), private / 'update-staging-license.py')
    (private / 'nginx-before-license.conf').write_bytes(before)
    marker = b'    location = /SHA256SUMS'
    assert before.count(marker) == 1
    after = before.replace(marker, b'    location = /LICENSE.txt { try_files $uri =404; }\n    location = /COPYRIGHT.txt { try_files $uri =404; }\n' + marker)
    def switch(target):
        temp = ROOT / 'current.license-new'
        assert not temp.exists() and not temp.is_symlink()
        temp.symlink_to(target)
        os.replace(temp, current)
    try:
        CONF.write_bytes(after)
        d.run(['nginx', '-t'])
        d.run(['systemctl', 'reload', 'nginx'])
        switch(release)
        for attempt in range(10):
            try:
                assert d.run(['curl', '-4', '-fsS', '--max-time', '10', 'https://' + d.SITE + '/LICENSE.txt']) == files['LICENSE.txt']
                break
            except (RuntimeError, AssertionError):
                if attempt == 9:
                    raise
                time.sleep(1)
        for n, data in files.items():
            assert d.run(['curl', '-4', '-fsS', '--max-time', '30', 'https://' + d.SITE + '/' + n]) == data, 'Live bytes differ: ' + n
        assert health() == ['200'] * len(hosts)
        headers = d.run(['curl', '-4', '-fsSI', '--max-time', '15', 'https://' + d.SITE + '/']).decode().lower()
        assert 'x-robots-tag: noindex, nofollow, noarchive' in headers and "connect-src 'none'" in headers
    except Exception:
        switch(OLD)
        CONF.write_bytes(before)
        d.run(['nginx', '-t'])
        d.run(['systemctl', 'reload', 'nginx'])
        print('Rolled back current pointer and staging Nginx. New release retained for inspection.', flush=True)
        raise
    d.EVIDENCE.update(build=meta, hashes=sums)
    d.backup()
    paths = [release / n for n in files] + [CONF, private / 'update-staging-license.py', private / 'nginx-before-license.conf', d.RENEWAL, d.SNIPPET, d.HOOK]
    paths += list((Path('/etc/letsencrypt/archive') / d.SITE).glob('*.pem'))
    d.snapshot_verify(paths)
    (source / 'license-deployment-result.json').write_text(json.dumps(d.EVIDENCE, indent=2) + '\n')
    print('LICENSE STAGING UPDATE PASS: ' + sha, flush=True)
    print('TLS/config/production preserved. Browser notice acceptance remains.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP:', error, flush=True)
        sys.exit(1)
