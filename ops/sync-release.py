#!/usr/bin/env python3
"""Prepare an inactive release from SHA256SUMS; never activate or reload it.

Usage: python3 ops/sync-release.py DIST SITE_ROOT/releases/COMMIT-PRESENTATION
The destination must not be the current release. Unlisted files are purged only
inside this explicit candidate directory, after all source hashes are verified.
"""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys


def sync_release(source, destination):
    source = Path(source).resolve(strict=True)
    destination = Path(destination).absolute()
    if any(p.is_symlink() for p in [destination, *destination.parents]):
        raise ValueError('Destination and its parents must not be symlinks.')
    destination = destination.resolve()
    if destination.parent.name != 'releases':
        raise ValueError('Destination must be a child of the site releases directory.')
    current = destination.parent.parent / 'current'
    if (current.exists() or current.is_symlink()) and current.resolve() == destination:
        raise ValueError('Cannot modify the current release.')
    if source == destination or source in destination.parents or destination in source.parents:
        raise ValueError('Source and destination must be separate trees.')
    if any(p.is_symlink() for p in source.rglob('*')):
        raise ValueError('Source must contain regular files, not symlinks.')
    manifest = (source / 'SHA256SUMS').read_bytes()
    files = {}
    for line in manifest.decode('utf-8').splitlines():
        match = re.fullmatch(r'([a-f0-9]{64})  ([A-Za-z0-9_./-]+)', line)
        if not match:
            raise ValueError('Malformed manifest entry.')
        digest, name = match.groups()
        if (name.startswith('/') or any(p in {'', '.', '..'} for p in name.split('/'))
                or name == 'SHA256SUMS' or name in files):
            raise ValueError('Unsafe or duplicate manifest path.')
        data = (source / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Manifest hash mismatch: ' + name)
        files[name] = data
    required = {'index.html', '404.html', '404.css', 'favicon.svg', 'robots.txt',
                'read/index.html', 'build.json'}
    if not required.issubset(files):
        raise ValueError('Required release files are missing from the manifest.')
    metadata = json.loads(files['build.json'])
    commit, mode = metadata.get('commit', ''), metadata.get('presentation')
    if (not re.fullmatch(r'[a-f0-9]{40}', commit) or metadata.get('dirty') is not False
            or mode not in {'staging', 'production'}):
        raise ValueError('Release must identify clean source and a valid presentation.')
    if destination.name != f'{commit}-{mode}':
        raise ValueError('Destination must match COMMIT-PRESENTATION from build.json.')
    if mode == 'production' and metadata.get('version') != '1.0.0':
        raise ValueError('Production requires version 1.0.0.')
    if destination.exists() and (not destination.is_dir() or
            any(p.is_symlink() or not (p.is_file() or p.is_dir()) for p in destination.rglob('*'))):
        raise ValueError('Destination must be a regular directory tree without symlinks.')
    files['SHA256SUMS'] = manifest
    # Verification completes before any writes or removal. Source extras are
    # deliberately excluded, even if a stale directory was packed with dist.
    destination.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        target.chmod(0o644)
    for path in sorted(destination.rglob('*'), key=lambda p: len(p.parts), reverse=True):
        if path.is_file() and path.relative_to(destination).as_posix() not in files:
            path.unlink()
        elif path.is_dir() and not any(path.iterdir()):
            path.rmdir()
    for name, data in files.items():
        if (destination / name).read_bytes() != data:
            raise ValueError('Written release verification failed: ' + name)
    actual = {p.relative_to(destination).as_posix() for p in destination.rglob('*') if p.is_file()}
    if actual != set(files):
        raise ValueError('Written release contains unexpected files.')
    return len(files)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    try:
        count = sync_release(*sys.argv[1:])
        print(f'Verified {count} files; stale files purged. Release remains inactive.')
    except (ValueError, OSError) as error:
        sys.exit(str(error))
