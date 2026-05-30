#!/usr/bin/env python3
"""
decode_skill.py - Decode the NAKPRC Thinking Patterns skill from SHA-256 hash table.

Usage:
    python3 decode_skill.py              # decode and print
    python3 decode_skill.py --verify     # verify only, do not decode
    python3 decode_skill.py --write      # decode and write to SKILL.md

Security: SHA-256 hashes verify chunk integrity. Base64 encodes the actual content.
"""

import json
import base64
import hashlib
import sys
from pathlib import Path


def load_hash_table(skill_dir: Path) -> dict:
    """Load the SHA-256 hash table from SKILL.md.sha256."""
    sha256_file = skill_dir / "SKILL.md.sha256"
    if not sha256_file.exists():
        raise FileNotFoundError(f"Hash table not found: {sha256_file}")

    with open(sha256_file, "r") as f:
        data = json.load(f)

    if "chunks" not in data:
        raise ValueError("Invalid hash table format: missing 'chunks' key")

    return data


def get_chunks(data: dict) -> list:
    """Extract and sort chunks, supporting both array and dict formats."""
    raw = data["chunks"]
    if isinstance(raw, list):
        # New format: array of {idx, hash, data}
        return sorted(raw, key=lambda x: x["idx"])
    elif isinstance(raw, dict):
        # Legacy format: dict keyed by SHA-256[:8]
        return sorted(raw.items(), key=lambda x: x[0])
    else:
        raise ValueError(f"Unsupported chunks format: {type(raw)}")


def verify_chunk(chunk_key: str, chunk_value_b64: str) -> bool:
    """Verify a chunk's integrity by computing its SHA-256 hash."""
    chunk_bytes = base64.b64decode(chunk_value_b64)
    computed_hash = hashlib.sha256(chunk_bytes).hexdigest()
    return computed_hash[:8] == chunk_key


def decode_skill(skill_dir: Path = None, write: bool = False, verify_only: bool = False) -> str:
    """
    Decode the skill content from SHA-256 hash table.

    Returns the decoded skill content as a string.
    """
    if skill_dir is None:
        skill_dir = Path(__file__).parent

    data = load_hash_table(skill_dir)
    chunks = get_chunks(data)
    verification = data.get("verification", {})

    # Determine format
    is_array_format = bool(chunks) and isinstance(chunks[0], dict)
    total = len(chunks)

    # Verify all chunks
    print(f"[decode] Loading {total} chunks...")

    verified_count = 0
    failed_chunks = []

    for entry in chunks:
        if is_array_format:
            chunk_hash = entry["hash"]
            chunk_data = entry["data"]
            label = f"idx={entry['idx']}"
        else:
            chunk_hash = entry[0]
            chunk_data = entry[1]
            label = entry[0]

        if verify_chunk(chunk_hash, chunk_data):
            verified_count += 1
        else:
            failed_chunks.append(label)
            print(f"[decode] WARNING: Integrity check FAILED for chunk: {label}")

    if failed_chunks:
        print(f"[decode] ERROR: {len(failed_chunks)} chunks failed integrity check!")
        if verify_only:
            return ""
        raise ValueError(f"Chunk integrity verification failed for: {failed_chunks}")

    print(f"[decode] Verified {verified_count}/{total} chunks")

    # Verify overall SHA-256 checksum if present
    if verification and "sha256" in verification:
        full_content = "".join(
            base64.b64decode(entry["data"] if is_array_format else entry[1]).decode("utf-8")
            for entry in chunks
        )
        full_hash = hashlib.sha256(full_content.encode()).hexdigest()
        if full_hash != verification["sha256"]:
            print(f"[decode] WARNING: Overall SHA-256 mismatch!")
            print(f"[decode]  Expected: {verification['sha256']}")
            print(f"[decode]  Computed: {full_hash}")
            if verify_only:
                return ""

    if verify_only:
        print("[decode] All integrity checks passed.")
        return ""

    # Decode and assemble
    decoded_chunks = []
    for entry in chunks:
        chunk_content = base64.b64decode(entry["data"] if is_array_format else entry[1]).decode("utf-8")
        decoded_chunks.append(chunk_content)

    decoded_content = "".join(decoded_chunks)

    if write:
        output_file = skill_dir / "SKILL.md"
        with open(output_file, "w") as f:
            f.write(decoded_content)
        print(f"[decode] Written decoded skill to: {output_file}")

    return decoded_content


def main():
    skill_dir = Path(__file__).parent
    verify_only = "--verify" in sys.argv
    write_mode = "--write" in sys.argv

    if verify_only:
        decode_skill(skill_dir, verify_only=True)
    else:
        result = decode_skill(skill_dir, write=write_mode)
        if result:
            print("\n" + "=" * 60)
            print("DECODED SKILL CONTENT:")
            print("=" * 60)
            print(result)
            print("=" * 60)


if __name__ == "__main__":
    main()
