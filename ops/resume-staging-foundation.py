#!/usr/bin/env python3
"""Resume the inspected Phase 1 rollback without reissuing TLS or replacing files."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone

ROOT = Path('/var/www/dev.onlyempowerment.com')
SOURCE = Path(__file__).resolve().parent
ORIGINAL = ROOT / 'private/deploy-staging-foundation.py'
ORIGINAL_HASH = '9bc8bb3c7f8cb209530c98b8f56bc5ff96a97f7290a885b318d9294a8fff26fe'
CONFIG_HASH = '4ed6af083d80548bba65ca53c2dbbcaa7b18891a39b93bdcf56c8a133b4ab707'


def main():
    assert os.geteuid() == 0, 'Run with sudo on the VPS.'
    assert subprocess.check_output(['hostname', '-f']).strip() == b'vps1.phoenix233.com'
    assert hashlib.sha256(ORIGINAL.read_bytes()).hexdigest() == ORIGINAL_HASH, 'Original helper changed; inspect before reuse.'
    spec = importlib.util.spec_from_file_location('oe_original', ORIGINAL)
    d = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(d)
    d.START = datetime.now(timezone.utc)
    e = d.EVIDENCE
    e['started'] = d.START.isoformat()
    e['recovery'] = 'Resume retained files and certificate with a bounded strict-TLS readiness check.'
    assert not d.CONF.exists() and not d.LINK.is_symlink(), 'Staging is already enabled; inspect before rerunning.'
    assert (ROOT / 'current').is_symlink() and (ROOT / 'current').resolve() == d.RELEASE
    assert d.RENEWAL.exists(), 'Expected issued certificate lineage is missing.'
    config = ROOT / 'private/nginx-failed.conf'
    assert hashlib.sha256(config.read_bytes()).hexdigest() == CONFIG_HASH, 'Retained Nginx configuration differs from reviewed configuration.'
    sums = dict(line.split('  ', 1)[::-1] for line in (d.RELEASE / 'SHA256SUMS').read_text().splitlines())
    assert set(sums) == d.PUBLIC - {'SHA256SUMS'}
    for name, value in sums.items():
        assert d.digest((d.RELEASE / name).read_bytes()) == value, f'Release changed: {name}'
    meta = json.loads((d.RELEASE / 'build.json').read_text())
    assert meta == {'version': d.VERSION, 'commit': d.SHA, 'dirty': False, 'tag': None, 'source': 'https://github.com/jimlunsford/only-empowerment/commit/' + d.SHA}
    # Pin the metadata file itself to the independently verified accepted CI manifest.
    assert sums['build.json'] == '4602980a5ca36647f192b22761938c1f59725188948f7c2e3f5aaa2578ac21db'
    e.update(build=meta, hashes=sums, ci_run=35076785285)
    for ns in ['ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com', '1.1.1.1', '8.8.8.8']:
        assert d.run(['dig', '@' + ns, d.SITE, 'A', '+short']).decode().splitlines() == [d.IP]
        assert not d.run(['dig', '@' + ns, d.SITE, 'AAAA', '+short']).strip()
    live = Path('/etc/letsencrypt/live') / d.SITE
    verification = subprocess.run(['openssl', 'verify', '-purpose', 'sslserver', '-verify_hostname', d.SITE, '-CAfile', '/etc/ssl/certs/ca-certificates.crt', '-untrusted', str(live / 'chain.pem'), str(live / 'cert.pem')], capture_output=True, text=True)
    if verification.returncode:
        print(verification.stdout + verification.stderr, flush=True)
        raise RuntimeError('Issued certificate failed hostname/chain validation; no Nginx change made.')
    print('Issued certificate hostname and trusted chain: PASS.', flush=True)
    e['certificate'] = d.run(['openssl', 'x509', '-in', str(live / 'cert.pem'), '-noout', '-dates', '-issuer', '-fingerprint', '-sha256', '-ext', 'subjectAltName']).decode()
    print(e['certificate'], flush=True)
    renewal = d.RENEWAL.read_text()
    assert re.search(r'authenticator\s*=\s*webroot', renewal) and '/var/www/letsencrypt' in renewal
    assert d.HOOK.is_file() and d.SNIPPET.is_file()
    d.run(['nginx', '-t'])
    e['firewall_before'] = d.run(['ufw', 'status']).decode()
    e['ports_before'] = d.run(['ss', '-H', '-lnt']).decode()
    neighbors = ['jimlunsford.com', 'jimlunsford.net', 'bonumark.org', 'phoenix233.com', 'ltdcsserver.com', 'jiml.net']
    def health():
        return {host: d.run(['curl', '-4', '-sS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', 'https://' + host + '/']).decode() for host in neighbors}
    e['neighbors_before'] = health()
    assert all(code == '200' for code in e['neighbors_before'].values())
    d.backup()
    shutil.copy2(Path(__file__), ROOT / 'private/resume-staging-foundation.py')
    try:
        shutil.copyfile(config, d.CONF)
        d.CONF.chmod(0o644)
        d.LINK.symlink_to(d.CONF)
        d.run(['nginx', '-t'])
        d.run(['systemctl', 'reload', 'nginx'])
        # Reload completion signals acceptance of the reload, not new-worker readiness.
        # Every probe validates TLS normally. Never use --insecure or disable trust.
        for attempt in range(1, 11):
            probe = subprocess.run(['curl', '-4', '-fsSI', '--connect-timeout', '3', '--max-time', '5', 'https://' + d.SITE + '/'], capture_output=True)
            if probe.returncode == 0:
                e['tls_readiness_attempts'] = attempt
                break
            print(f'Strict HTTPS readiness attempt {attempt}: curl exit {probe.returncode}.', flush=True)
            if probe.returncode not in {7, 28, 35, 60} or attempt == 10:
                print(probe.stderr.decode(errors='replace'), flush=True)
                raise RuntimeError('Staging never passed strict HTTPS readiness.')
            time.sleep(1)
        for name, value in sums.items():
            body = d.run(['curl', '-4', '-fsS', '--max-time', '30', f'https://{d.SITE}/{name}'])
            assert d.digest(body) == value, f'Live file mismatch: {name}'
        e['headers'] = d.run(['curl', '-4', '-fsSI', '--max-time', '20', f'https://{d.SITE}/']).decode()
        for header in ['content-security-policy:', 'x-content-type-options:', 'x-frame-options:', 'referrer-policy:', 'x-robots-tag: noindex, nofollow, noarchive']:
            assert header in e['headers'].lower()
        for path in ['/.env', '/.git/config', '/package.json', '/private/', '/assets/', '/missing-page', '/ops/']:
            assert d.run(['curl', '-sS', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', f'https://{d.SITE}{path}']).decode() == '404'
        e['neighbors_after'] = health()
        assert e['neighbors_after'] == e['neighbors_before']
    except Exception:
        if d.LINK.is_symlink():
            d.LINK.unlink()
        if d.CONF.exists():
            d.CONF.unlink()
        d.run(['nginx', '-t'])
        d.run(['systemctl', 'reload', 'nginx'])
        print('Recovery host rolled back. Original retained configuration and certificate are preserved.', flush=True)
        raise
    print('Staging HTTPS, seven live file hashes, headers, isolation and neighboring sites: PASS.', flush=True)
    print('Running staging-lineage renewal dry run with existing deploy hooks.', flush=True)
    d.run(['certbot', 'renew', '--cert-name', d.SITE, '--dry-run', '--run-deploy-hooks', '--non-interactive', '--no-random-sleep-on-renew'], timeout=600)
    e['renewal_dry_run'] = 'passed with deploy hooks'
    e['firewall_after'] = d.run(['ufw', 'status']).decode()
    e['ports_after'] = d.run(['ss', '-H', '-lnt']).decode()
    assert e['firewall_after'] == e['firewall_before']
    assert sorted(line.split()[3] for line in e['ports_before'].splitlines()) == sorted(line.split()[3] for line in e['ports_after'].splitlines())
    d.write(ROOT / 'private/deployment-before-backup.json', json.dumps(e, indent=2) + '\n', 0o600)
    d.backup()
    paths = [d.RELEASE / name for name in d.PUBLIC]
    paths += [d.CONF, d.RENEWAL, d.SNIPPET, d.HOOK, ORIGINAL, ROOT / 'private/resume-staging-foundation.py', ROOT / 'private/deployment-before-backup.json']
    archives = list((Path('/etc/letsencrypt/archive') / d.SITE).glob('*.pem'))
    assert len(archives) >= 4, 'TLS archive coverage incomplete.'
    paths += archives
    d.snapshot_verify(paths)
    e['finished'] = datetime.now(timezone.utc).isoformat()
    d.write(SOURCE / 'deployment-result.json', json.dumps(e, indent=2) + '\n', 0o644)
    print('STAGING DEPLOYED: https://' + d.SITE, flush=True)
    print('Renewal and restored snapshot coverage: PASS. Browser acceptance remains for the assistant.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP:', error, flush=True)
        sys.exit(1)
