#!/usr/bin/env python3
"""One-time Phase 1 staging deployment on Jim's VPS. No credential/config changes.
Run with sudo only after reviewing this script and placing artifact.json beside it.
Refuses an existing site. Uses the existing VPS-wide backup and Certbot account.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
from datetime import datetime, timezone

SITE = 'dev.onlyempowerment.com'
SHA = '701664c1b4af37287f4b16fcf8a76a41d09f00c7'
VERSION = '0.1.0-dev.1'
IP = '104.36.229.165'
ROOT = Path('/var/www') / SITE
RELEASE = ROOT / 'releases' / SHA
CONF = Path('/etc/nginx/sites-available') / SITE
LINK = Path('/etc/nginx/sites-enabled') / SITE
RENEWAL = Path('/etc/letsencrypt/renewal') / (SITE + '.conf')
SNIPPET = Path('/etc/nginx/snippets/acme-http01.conf')
HOOK = Path('/etc/letsencrypt/renewal-hooks/deploy/00-nginx-validated-reload')
ARTIFACT_SHA256 = '14ebc75cd71c62788a6407ef13eac4616707ac76d47f2fc98fc53456cd72684b'
PUBLIC = {'THIRD_PARTY_NOTICES.txt', 'assets/index-DjxWIcLg.js', 'assets/index-Gs19Boei.css', 'build.json', 'favicon.svg', 'index.html', 'robots.txt', 'SHA256SUMS'}
EVIDENCE = {}


def run(args, timeout=120, env=None):
    result = subprocess.run(args, capture_output=True, timeout=timeout, env=env)
    if result.returncode:
        raise RuntimeError(f'{Path(args[0]).name} exited {result.returncode}; inspect locally, secret output withheld')
    return result.stdout


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write(path, text, mode=0o644):
    path.write_text(text)
    path.chmod(mode)


def backup():
    print('Running existing VPS-wide backup service.', flush=True)
    run(['systemctl', 'start', 'vps-backup.service'], timeout=7200)
    for key, expected in [('Result', b'success'), ('ExecMainStatus', b'0')]:
        assert run(['systemctl', 'show', 'vps-backup.service', '-p', key, '--value']).strip() == expected
    print('VPS-wide backup service: PASS.', flush=True)


def snapshot_verify(paths):
    # Same read-only verification method used by the existing LTDCS deployment.
    cfg = json.loads(Path('/etc/vps-backup/config.json').read_text())
    leaves = []
    def walk(obj, prefix=''):
        if isinstance(obj, dict):
            for key, val in obj.items():
                walk(val, prefix + '.' + key)
        elif isinstance(obj, str):
            leaves.append((prefix.lower().replace('-', '_'), obj))
    walk(cfg)
    expected_repo = 'rclone:gdrive-backup:VPS-Backups/vps1.phoenix233.com/restic'
    assert any(v == expected_repo for _, v in leaves), 'Existing backup repository changed; inspect first.'
    passwords = {v for k, v in leaves if 'password' in k and 'file' in k and v.startswith('/') and Path(v).is_file()}
    rclone = {v for k, v in leaves if 'rclone' in k and 'config' in k and v.startswith('/') and Path(v).is_file()}
    assert len(passwords) == 1 and len(rclone) == 1, 'Backup configuration requires review.'
    env = os.environ.copy()
    env.update(RESTIC_REPOSITORY=expected_repo, RESTIC_PASSWORD_FILE=passwords.pop(), RCLONE_CONFIG=rclone.pop())
    snapshots = json.loads(run(['restic', 'snapshots', '--json'], timeout=600, env=env))
    # Match this server and required coverage, never another host's latest snapshot.
    candidates = [s for s in snapshots if s.get('hostname') in {'vps1', 'vps1.phoenix233.com'} and '/var/www' in s.get('paths', [])]
    assert candidates, 'No matching VPS-wide snapshot.'
    latest = max(candidates, key=lambda s: s['time'])
    assert datetime.fromisoformat(latest['time'].replace('Z', '+00:00')) >= START, 'Snapshot is not from this execution.'
    sid = latest['id']
    verified = []
    for path in sorted(set(paths), key=str):
        restored = run(['restic', 'dump', sid, str(path)], timeout=600, env=env)
        assert digest(restored) == digest(path.read_bytes()), f'Backup mismatch: {path}'
        verified.append(str(path))
    EVIDENCE['backup'] = {'snapshot': sid, 'time': latest['time'], 'restored_and_sha256_matched': verified}
    print(f'VERIFIED SNAPSHOT {sid}: {len(verified)} files restored to memory and SHA-256 matched.', flush=True)


def main():
    global START
    START = datetime.now(timezone.utc)
    os.umask(0o077)
    assert os.geteuid() == 0, 'Run with sudo on the VPS.'
    assert run(['hostname', '-f']).strip() == b'vps1.phoenix233.com', 'Wrong host.'
    assert not ROOT.exists() and not CONF.exists() and not LINK.is_symlink() and not RENEWAL.exists(), 'Existing staging state requires inspection; do not rerun blindly.'
    assert SNIPPET.is_file() and HOOK.is_file(), 'Established ACME architecture missing.'
    assert '/var/www/letsencrypt' in SNIPPET.read_text()
    assert Path('/etc/vps-backup/config.json').is_file()
    for timer in ['certbot.timer', 'vps-backup.timer', 'vps-backup-maintenance.timer']:
        assert run(['systemctl', 'is-active', timer]).strip() == b'active'
    nginx_before = run(['nginx', '-T'])
    assert SITE.encode() not in nginx_before, 'Conflicting enabled host.'
    for cert in Path('/etc/letsencrypt/live').glob('*/cert.pem'):
        sans = run(['openssl', 'x509', '-in', str(cert), '-noout', '-ext', 'subjectAltName']).decode()
        assert SITE not in sans and '*.onlyempowerment.com' not in sans, 'Existing SAN coverage requires inspection.'
    for ns in ['ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com', '1.1.1.1', '8.8.8.8']:
        assert run(['dig', '@' + ns, SITE, 'A', '+short']).decode().splitlines() == [IP], f'DNS not ready at {ns}.'
        assert not run(['dig', '@' + ns, SITE, 'AAAA', '+short']).strip(), 'Unexpected AAAA record.'
    source = Path(__file__).resolve().parent
    raw = (source / 'artifact.json').read_bytes()
    assert digest(raw) == ARTIFACT_SHA256, 'Artifact envelope mismatch.'
    files = {name: base64.b64decode(value, validate=True) for name, value in json.loads(raw).items()}
    assert set(files) == PUBLIC
    sums = {}
    for line in files['SHA256SUMS'].decode().splitlines():
        value, name = line.split('  ', 1)
        assert name in PUBLIC and digest(files[name]) == value, 'Artifact file mismatch.'
        sums[name] = value
    assert set(sums) == PUBLIC - {'SHA256SUMS'}
    meta = json.loads(files['build.json'])
    assert meta == {'version': VERSION, 'commit': SHA, 'dirty': False, 'tag': None, 'source': 'https://github.com/jimlunsford/only-empowerment/commit/' + SHA}
    EVIDENCE.update(started=START.isoformat(), build=meta, hashes=sums, ci_run=35076785285)
    EVIDENCE['firewall_before'] = run(['ufw', 'status']).decode()
    EVIDENCE['ports_before'] = run(['ss', '-H', '-lnt']).decode()
    neighbors = ['jimlunsford.com', 'jimlunsford.net', 'bonumark.org', 'phoenix233.com', 'ltdcsserver.com', 'jiml.net']
    def health():
        return {host: run(['curl', '-4', '-sS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', 'https://' + host + '/']).decode() for host in neighbors}
    EVIDENCE['neighbors_before'] = health()
    assert all(code == '200' for code in EVIDENCE['neighbors_before'].values()), 'A neighboring site needs investigation before deployment.'
    print('Preflight: verified host, clean artifact, DNS, no conflicts, neighboring sites healthy.', flush=True)
    backup()
    RELEASE.mkdir(parents=True, mode=0o755)
    (ROOT / 'private').mkdir(mode=0o700)
    write(ROOT / 'private' / 'nginx-before.txt', nginx_before.decode(), 0o600)
    shutil.copy2(Path(__file__), ROOT / 'private' / Path(__file__).name)
    for name, data in files.items():
        target = RELEASE / name
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
        target.write_bytes(data)
        target.chmod(0o444)
    for directory in sorted([p for p in RELEASE.rglob('*') if p.is_dir()], reverse=True):
        directory.chmod(0o555)
    RELEASE.chmod(0o555)
    (ROOT / 'releases').chmod(0o755)
    ROOT.chmod(0o755)
    (ROOT / 'current.new').symlink_to(RELEASE)
    os.replace(ROOT / 'current.new', ROOT / 'current')
    headers = '''    add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
'''
    http = f'''server {{
    listen 80;
    listen [::]:80;
    server_name {SITE};
    include /etc/nginx/snippets/acme-http01.conf;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    location / {{ return 301 https://{SITE}$request_uri; }}
}}
'''
    tls = f'''server {{
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name {SITE};
    root {ROOT}/current;
    index index.html;
    autoindex off;
    access_log /var/log/nginx/{SITE}.access.log;
    error_log /var/log/nginx/{SITE}.error.log;
    ssl_certificate /etc/letsencrypt/live/{SITE}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{SITE}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
{headers}    expires -1;
    location = / {{ try_files /index.html =404; }}
    location = /index.html {{ try_files $uri =404; }}
    location = /build.json {{ try_files $uri =404; }}
    location = /favicon.svg {{ try_files $uri =404; }}
    location = /robots.txt {{ try_files $uri =404; }}
    location = /THIRD_PARTY_NOTICES.txt {{ try_files $uri =404; }}
    location = /SHA256SUMS {{ try_files $uri =404; }}
    location ~ ^/assets/index-[A-Za-z0-9_-]+\\.(js|css)$ {{ expires 1y; try_files $uri =404; }}
    location / {{ return 404; }}
}}
'''
    token = secrets.token_hex(24)
    challenge = Path('/var/www/letsencrypt/.well-known/acme-challenge') / token
    try:
        write(CONF, http)
        LINK.symlink_to(CONF)
        run(['nginx', '-t'])
        run(['systemctl', 'reload', 'nginx'])
        write(challenge, token)
        assert run(['curl', '-4', '-fsS', '--max-time', '20', f'http://{SITE}/.well-known/acme-challenge/{token}']).decode() == token
        run(['certbot', 'certonly', '--webroot', '-w', '/var/www/letsencrypt', '--preferred-challenges', 'http-01', '--cert-name', SITE, '-d', SITE, '--non-interactive'], timeout=300)
        write(CONF, http + tls)
        run(['nginx', '-t'])
        run(['systemctl', 'reload', 'nginx'])
        for name, value in sums.items():
            body = run(['curl', '-4', '-fsS', '--max-time', '30', f'https://{SITE}/{name}'])
            assert digest(body) == value, f'Live byte mismatch: {name}'
        for path in ['/.env', '/.git/config', '/package.json', '/private/', '/assets/', '/missing-page', '/ops/']:
            code = run(['curl', '-sS', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', f'https://{SITE}{path}']).decode()
            assert code == '404', f'Unexpected path response: {path}'
        EVIDENCE['headers'] = run(['curl', '-4', '-fsSI', '--max-time', '20', f'https://{SITE}/']).decode()
        for required in ['content-security-policy:', 'x-content-type-options:', 'x-frame-options:', 'referrer-policy:', 'x-robots-tag: noindex, nofollow, noarchive']:
            assert required in EVIDENCE['headers'].lower(), f'Missing header: {required}'
        EVIDENCE['neighbors_after'] = health()
        assert EVIDENCE['neighbors_after'] == EVIDENCE['neighbors_before']
    except Exception:
        if LINK.is_symlink():
            LINK.unlink()
        if CONF.exists():
            CONF.rename(ROOT / 'private' / 'nginx-failed.conf')
        run(['nginx', '-t'])
        run(['systemctl', 'reload', 'nginx'])
        print('New staging host rolled back. Files and any issued certificate retained for inspection.', flush=True)
        raise
    finally:
        challenge.unlink(missing_ok=True)
    print('Staging HTTPS, all seven live file hashes, headers and isolation: PASS.', flush=True)
    EVIDENCE['certificate'] = run(['openssl', 'x509', '-in', f'/etc/letsencrypt/live/{SITE}/cert.pem', '-noout', '-dates', '-issuer', '-fingerprint', '-sha256', '-ext', 'subjectAltName']).decode()
    renewal = RENEWAL.read_text()
    assert re.search(r'authenticator\s*=\s*webroot', renewal) and '/var/www/letsencrypt' in renewal
    print('Running staging-lineage renewal dry run with existing deploy hooks.', flush=True)
    run(['certbot', 'renew', '--cert-name', SITE, '--dry-run', '--run-deploy-hooks', '--non-interactive', '--no-random-sleep-on-renew'], timeout=600)
    EVIDENCE['renewal_dry_run'] = 'passed with deploy hooks'
    EVIDENCE['firewall_after'] = run(['ufw', 'status']).decode()
    EVIDENCE['ports_after'] = run(['ss', '-H', '-lnt']).decode()
    assert EVIDENCE['firewall_after'] == EVIDENCE['firewall_before']
    assert sorted(line.split()[3] for line in EVIDENCE['ports_after'].splitlines()) == sorted(line.split()[3] for line in EVIDENCE['ports_before'].splitlines())
    write(ROOT / 'private' / 'deployment-before-backup.json', json.dumps(EVIDENCE, indent=2) + '\n', 0o600)
    backup()
    paths = [RELEASE / name for name in PUBLIC]
    paths += [CONF, RENEWAL, SNIPPET, HOOK, ROOT / 'private' / Path(__file__).name, ROOT / 'private' / 'deployment-before-backup.json']
    paths += list((Path('/etc/letsencrypt/archive') / SITE).glob('*.pem'))
    assert len(paths) >= 18, 'TLS archive coverage incomplete.'
    snapshot_verify(paths)
    EVIDENCE['finished'] = datetime.now(timezone.utc).isoformat()
    report = source / 'deployment-result.json'
    write(report, json.dumps(EVIDENCE, indent=2) + '\n', 0o644)
    print('STAGING DEPLOYED: https://' + SITE, flush=True)
    print('Renewal and verified snapshot coverage: PASS. Browser acceptance remains for the assistant.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP:', error, flush=True)
        sys.exit(1)
