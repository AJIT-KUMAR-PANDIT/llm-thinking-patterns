/**
 * src/install.js — Installer for NAKPRC Thinking Patterns skill
 *
 * Copies the skill package into Claude Code's skill directory (~/.claude/skills/).
 * Supports both global install (npm link) and local use.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const SKILL_NAME = "nakprc-thinking-patterns";
const SKILL_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || "/tmp",
  ".claude",
  "skills",
  SKILL_NAME
);
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_SKILL = path.join(PACKAGE_ROOT, "src", "skill");

// --- Helpers ---

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  mkdirp(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function skillIsInstalled() {
  return fs.existsSync(path.join(SKILL_DIR, "SKILL.md"));
}

function skillIsEncrypted() {
  return fs.existsSync(path.join(SKILL_DIR, "SKILL.md.sha256"));
}

// --- Install ---

async function install() {
  console.log("NAKPRC Thinking Patterns — Installer");
  console.log("======================================\n");

  if (skillIsInstalled()) {
    console.log("Skill is already installed at:", SKILL_DIR);
    if (skillIsEncrypted()) {
      console.log("  Status: Installed (encrypted skill format)");
    } else {
      console.log("  Status: Installed (decrypted skill format)");
    }
    console.log("\nTo reinstall, run: nakprc uninstall && nakprc install\n");
    return;
  }

  // Find source skill files
  let sourceDir = SRC_SKILL;
  if (!fs.existsSync(sourceDir)) {
    // Fallback: use .claude/skills/ if running from source repo
    sourceDir = path.join(PACKAGE_ROOT, ".claude", "skills", SKILL_NAME);
  }

  if (!fs.existsSync(sourceDir)) {
    console.error("Error: skill source not found.");
    console.error("  Expected: " + sourceDir);
    console.error("  Make sure you're running from a proper installation.");
    process.exit(1);
  }

  console.log("Installing to:", SKILL_DIR);
  copyDir(sourceDir, SKILL_DIR);

  // Make decode script executable
  const decodeScript = path.join(SKILL_DIR, "decode_skill.py");
  if (fs.existsSync(decodeScript)) {
    try {
      fs.chmodSync(decodeScript, "0755");
    } catch {
      // chmod may fail on Windows; that's okay
    }
  }

  // Create thinking-patterns output dir if it doesn't exist
  const outputDir = path.join(PACKAGE_ROOT, "thinking-patterns");
  if (!fs.existsSync(outputDir)) {
    mkdirp(outputDir);
  }

  console.log("\x1b[32m✓\x1b[0m Installed successfully!");
  console.log(`  Skill: ${SKILL_DIR}`);
  console.log(`  Usage: nakprc tp start "Your Task Name"`);
  console.log(`  Output: thinking-patterns/`);
  console.log();
}

// --- Uninstall ---

function uninstall() {
  if (!skillIsInstalled()) {
    console.log("Skill is not installed at:", SKILL_DIR);
    return;
  }

  const skillFile = path.join(SKILL_DIR, "SKILL.md");
  const encodedFile = path.join(SKILL_DIR, "SKILL.md.sha256");

  // Remove the skill directory
  try {
    if (fs.existsSync(SKILL_DIR)) {
      fs.rmSync(SKILL_DIR, { recursive: true, force: true });
      console.log("\x1b[33m✓\x1b[0m Skill uninstalled from:", SKILL_DIR);
    }
  } catch (err) {
    console.error("Error removing skill:", err.message);
  }

  // Clean up encoded file if it exists separately
  if (fs.existsSync(encodedFile)) {
    try {
      fs.unlinkSync(encodedFile);
      console.log("  Removed: SKILL.md.sha256");
    } catch {
      // already removed
    }
  }
}

// --- Status ---

function status() {
  const skillMd = path.join(SKILL_DIR, "SKILL.md");
  const encoded = path.join(SKILL_DIR, "SKILL.md.sha256");
  const decoder = path.join(SKILL_DIR, "decode_skill.py");
  const config = path.join(SKILL_DIR, "config.json");

  console.log("NAKPRC Thinking Patterns — Status");
  console.log("===================================\n");

  console.log("Install path:", SKILL_DIR);

  const files = [
    { name: "SKILL.md", path: skillMd, required: true },
    { name: "SKILL.md.sha256", path: encoded, required: false },
    { name: "decode_skill.py", path: decoder, required: true },
    { name: "config.json", path: config, required: true },
  ];

  let allOk = true;
  for (const f of files) {
    const exists = fs.existsSync(f.path);
    const icon = exists ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    console.log(`  ${icon} ${f.name}${f.required ? " (required)" : " (optional)"}`);
    if (f.required && !exists) allOk = false;
  }

  console.log();
  if (allOk) {
    console.log("\x1b[32m✓\x1b[0m Skill is installed and ready.");
  } else {
    console.log("\x1b[33m!\x1b[0m Skill is partially installed. Run 'nakprc install' to fix.");
  }
}

export { install, uninstall, status };
