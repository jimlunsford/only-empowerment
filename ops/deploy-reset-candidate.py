#!/usr/bin/env python3
"""Deploy one reviewed Phase 5 artifact; no configuration, DNS or production changes.
Run with sudo on the verified VPS after CI/artifact comparison. Args: SHA envelope-SHA256 CI-run.
The artifact envelope must be reset-artifact.json beside this script.
"""
import base64
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import sys

ROOT = Path('/var/www/dev.onlyempowerment.com')
OLD = ROOT / 'releases/77d921d8bd2aecab94f9581c36262bf48a54d608'
CONF = Path('/etc/nginx/sites-available/dev.onlyempowerment.com')
ORIGINAL = ROOT / 'private/deploy-staging-foundation.py'
CONF_HASH = '1af84bfffe4e3d4aafd4fc3b07147da1663b2f9c2d47b4e12534be7dbc5b683a'


def main():
    assert os.geteuid() == 0, 'Run with sudo on the VPS.'
    assert len(sys.argv) == 4
    sha, artifact_hash, ci_run = sys.argv[1:]
    assert re.fullmatch('[a-f0-9]{40}', sha) and re.fullmatch('[a-f0-9]{64}', artifact_hash) and ci_run.isdigit()
    assert hashlib.sha256(ORIGINAL.read_bytes()).hexdigest() == '9bc8bb3c7f8cb209530c98b8f56bc5ff96a97f7290a885b318d9294a8fff26fe'
    spec = importlib.util.spec_from_file_location('existing_backup', ORIGINAL)
    d = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(d)
    assert d.run(['hostname', '-f']).strip() == b'vps1.phoenix233.com'
    d.START = datetime.now(timezone.utc)
    source = Path(__file__).resolve().parent
    raw = (source / 'reset-artifact.json').read_bytes()
    assert d.digest(raw) == artifact_hash, 'Artifact envelope differs from independently reviewed package.'
    files = {n: base64.b64decode(v, validate=True) for n, v in json.loads(raw).items()}
    expected = {'index.html', 'build.json', 'favicon.svg', 'robots.txt', 'THIRD_PARTY_NOTICES.txt', 'LICENSE.txt', 'COPYRIGHT.txt', 'SHA256SUMS'}
    assets = {n for n in files if re.fullmatch(r'assets/index-[A-Za-z0-9_-]+\.(js|css)', n)}
    assert len(assets) == 2 and set(files) == expected | assets
    sums = {n: h for h, n in (line.split('  ', 1) for line in files['SHA256SUMS'].decode().splitlines())}
    assert set(sums) == set(files) - {'SHA256SUMS'} and all(d.digest(files[n]) == h for n, h in sums.items())
    meta = json.loads(files['build.json'])
    assert meta == {'version': '0.1.0-dev.5', 'commit': sha, 'dirty': False, 'tag': None, 'source': 'https://github.com/jimlunsford/only-empowerment/commit/' + sha}
    assert d.digest(CONF.read_bytes()) == CONF_HASH, 'Staging config changed; inspect before deployment.'
    current = ROOT / 'current'
    assert current.is_symlink() and current.resolve() == OLD
    assert d.LINK.is_symlink() and d.LINK.resolve() == CONF
    release = ROOT / 'releases' / sha
    assert not release.exists(), 'Never overwrite an immutable release.'
    d.run(['nginx', '-t'])
    assert d.run(['systemctl', 'is-active', 'nginx']).strip() == b'active'
    for timer in ['certbot.timer', 'vps-backup.timer', 'vps-backup-maintenance.timer']:
        assert d.run(['systemctl', 'is-active', timer]).strip() == b'active'
    hosts = ['jimlunsford.com', 'jimlunsford.net', 'bonumark.org', 'phoenix233.com', 'ltdcsserver.com', 'jiml.net']
    def health():
        return {h: d.run(['curl', '-4', '-fsS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', 'https://' + h]).decode() for h in hosts}
    before = health()
    assert set(before.values()) == {'200'}
    firewall = d.run(['ufw', 'status'])
    ports = d.run(['ss', '-H', '-lnt'])
    d.backup()
    os.umask(0o022)
    release.mkdir(mode=0o755)
    for name, data in files.items():
        p = release / name
        p.parent.mkdir(exist_ok=True, mode=0o755)
        p.write_bytes(data)
        p.chmod(0o444)
    (release / 'assets').chmod(0o555)
    release.chmod(0o555)
    private = ROOT / 'private'
    helper = private / ('deploy-reset-' + sha + '.py')
    shutil.copy2(Path(__file__), helper)
    helper.chmod(0o600)
    def switch(target):
        temp = ROOT / 'current.reset'
        assert not temp.exists() and not temp.is_symlink()
        temp.symlink_to(target)
        os.replace(temp, current)
    try:
        switch(release)
        for name, data in files.items():
            assert d.run(['curl', '-4', '-fsS', '--max-time', '30', 'https://' + d.SITE + '/' + name]) == data, 'Deployed byte mismatch: ' + name
        headers = d.run(['curl', '-4', '-fsSI', '--max-time', '15', 'https://' + d.SITE + '/']).decode().lower()
        assert 'x-robots-tag: noindex, nofollow, noarchive' in headers and "connect-src 'none'" in headers and "form-action 'none'" in headers
        d.run(['nginx', '-t'])
        assert d.run(['systemctl', 'is-active', 'nginx']).strip() == b'active'
        after = health()
        assert after == before
        assert d.run(['ufw', 'status']) == firewall
        assert d.run(['ss', '-H', '-lnt']) == ports
        assert d.digest(CONF.read_bytes()) == CONF_HASH
        d.EVIDENCE.update(build=meta, hashes=sums, ci_run=int(ci_run), artifact_envelope_sha256=artifact_hash,
                          rollback=str(OLD), neighbors_before=before, neighbors_after=after,
                          nginx='passed before and after; no reload needed', configuration='unchanged',
                          firewall='unchanged', listening_ports='unchanged', production='untouched')
        d.backup()
        paths = [release / n for n in files] + [CONF, helper, d.RENEWAL, d.SNIPPET, d.HOOK]
        paths += list((Path('/etc/letsencrypt/archive') / d.SITE).glob('*.pem'))
        d.snapshot_verify(paths)
    except Exception:
        switch(OLD)
        d.run(['nginx', '-t'])
        print('Rolled back staging current pointer. New release retained for inspection.', flush=True)
        raise
    (source / 'reset-deployment-result.json').write_text(json.dumps(d.EVIDENCE, indent=2) + '\n')
    print('RESET CANDIDATE STAGED: ' + sha, flush=True)
    print('Feature PR unmerged; deployed browser/product review still required.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP:', error, flush=True)
        sys.exit(1)
