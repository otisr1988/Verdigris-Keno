#!/usr/bin/env python3
"""
Packaging script for Verdigris Keno
Produces:
1. Verdigris_Keno_Math.zip
2. Verdigris_Keno_Frontend.zip
And computes SHA-256 checksums.
"""

import os
import zipfile
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT / "dist"
MATH_DIR = ROOT / "math"
OUTPUT_DIR = ROOT / "release"

OUTPUT_DIR.mkdir(exist_ok=True)

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def create_zip(src_dir, zip_path, prefix=""):
    print(f"Creating {zip_path.name} from {src_dir}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(src_dir):
            for file in sorted(files):
                full_path = Path(root) / file
                rel_path = full_path.relative_to(src_dir)
                archive_name = os.path.join(prefix, str(rel_path)) if prefix else str(rel_path)
                z.write(full_path, archive_name)
    print(f"  Done. Size: {zip_path.stat().st_size:,} bytes")

def main():
    math_zip = OUTPUT_DIR / "Verdigris_Keno_Math.zip"
    if MATH_DIR.exists():
        create_zip(MATH_DIR, math_zip, prefix="math")
    else:
        print(f"Warning: {MATH_DIR} does not exist!")

    frontend_zip = OUTPUT_DIR / "Verdigris_Keno_Frontend.zip"
    if DIST_DIR.exists():
        create_zip(DIST_DIR, frontend_zip, prefix="")
    else:
        print(f"Note: dist directory {DIST_DIR} not yet built. Run npm run build first.")

    # Write checksums
    checksum_file = OUTPUT_DIR / "checksums.sha256"
    with open(checksum_file, "w") as cf:
        for z in [math_zip, frontend_zip]:
            if z.exists():
                digest = sha256_file(z)
                cf.write(f"{digest}  {z.name}\n")
                print(f"SHA-256 ({z.name}): {digest}")

if __name__ == "__main__":
    main()
