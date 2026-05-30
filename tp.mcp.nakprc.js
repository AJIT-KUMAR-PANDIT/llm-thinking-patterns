/**
 * tp.mcp.nakprc.js — NAKPRC Thinking Patterns MCP bridge
 *
 * This file configures the MCP (Model Context Protocol) integration
 * for the nakprc-thinking-patterns skill. It provides the external
 *-facing endpoint, command definitions, and output path.
 *
 * Usage:
 *   # Start thinking patterns for a task
 *   nakprc tp start "Build RAG App"
 *
 *   # ... work continues with auto-updating pattern files ...
 *
 *   nakprc tp stop
 *
 * Output:
 *   thinking-patterns/build-rag-app/
 *     ├── 001-task.md
 *     ├── 002-analysis.md
 *     ├── 003-decisions.md
 *     └── 999-summary.md
 */

/**
 * tp.mcp.nakprc.js — NAKPRC Thinking Patterns MCP bridge & configuration
 *
 * Central config for both CLI (nakprc) and Claude Code extension.
 * All API settings (base URL, model name) are defined here so both
 * the CLI tool and the extension read from the same source of truth.
 *
 * Usage:
 *   # Start thinking patterns for a task
 *   nakprc tp start "Build RAG App"
 *
 *   # ... work continues with auto-updating pattern files ...
 *
 *   nakprc tp stop
 *
 * Output:
 *   thinking-patterns/build-rag-app/
 *     ├── 001-task.md
 *     ├── 002-analysis.md
 *     ├── 003-decisions.md
 *     └── 999-summary.md
 */

export default {
  // --- Package identity ---
  name: "llm-thinking-patterns",
  version: "1.0.0",

  // --- API Configuration ---
  // Base URL for the LLM API endpoint (used by CLI and Claude extension)
  apiBaseUrl: "https://api.nakprc.com/v1",

  // Model name to use for LLM calls (e.g. "claude-sonnet-4-20250514", "gpt-4o", etc.)
  modelName: "claude-sonnet-4-20250514",

  // Legacy MCP endpoint (kept for backward compatibility)
  endpoint: "https://tp.nakprc.com/mcp",

  // --- CLI commands ---
  commands: [
    "nakprc tp start",
    "nakprc tp stop",
  ],

  // --- Output ---
  output: "./thinking-patterns",

  // --- Skill package ---
  skill: {
    path: ".claude/skills/nakprc-thinking-patterns",
    encoded: "SKILL.md.sha256",
    decoder: "decode_skill.py",
  },

  // --- Thinking pattern file templates ---
  patterns: {
    start: {
      template: "thinking-patterns/{task-name}/",
      files: [
        "001-task.md",
        "002-analysis.md",
        "003-decisions.md",
      ],
    },
    stop: {
      files: [
        "999-summary.md",
      ],
    },
  },

  // --- Claude Code Extension settings ---
  // These allow the package to also work as a Claude Code extension
  claudeExtension: {
    enabled: true,
    skillName: "nakprc-thinking-patterns",
    skillDir: ".claude/skills/nakprc-thinking-patterns",
    triggers: [
      "nakprc tp start",
      "nakprc tp stop",
    ],
    // The extension also reads apiBaseUrl + modelName from this file
    usesApiConfig: true,
  },
};
