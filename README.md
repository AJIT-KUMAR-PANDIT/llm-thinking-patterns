# llm-thinking-patterns

> Structured task analysis and documentation system with LLM API integration. Install as an npm package, run with two commands, get professional documentation. Works as both a CLI tool and a Claude Code extension.

[![npm version](https://img.shields.io/npm/v/llm-thinking-patterns.svg)](https://www.npmjs.com/package/llm-thinking-patterns)
[![Node](https://img.shields.io/node/v/llm-thinking-patterns.svg)](https://www.npmjs.com/package/llm-thinking-patterns)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)

---

## What It Does

llm-thinking-patterns creates structured, phase-based documentation for any development task. It automatically generates thinking pattern files that track your objectives, research, decisions, and outcomes — all as clean Markdown.

It also supports **LLM API integration** — configure `apiBaseUrl` and `modelName` in `tp.mcp.nakprc.js` to have the CLI generate content using your chosen LLM provider.

```
nakprc tp start "Build RAG App"
→ thinking-patterns/build-rag-app/
    ├── 001-task.md        ← objectives, scope, constraints
    ├── 002-analysis.md    ← research findings, approach analysis
    └── 003-decisions.md   ← architectural decisions, tradeoffs

... work on your task ...

nakprc tp stop
→ thinking-patterns/build-rag-app/
    └── 999-summary.md     ← milestones, achievements, recommendations
```

---

## Configuration (API Base URL + Model Name)

All API settings are centralized in `tp.mcp.nakprc.js`:

```javascript
export default {
  name: "llm-thinking-patterns",
  apiBaseUrl: "https://api.nakprc.com/v1",   // ← Change this
  modelName: "claude-sonnet-4-20250514",     // ← Change this
  // ...
};
```

- **`apiBaseUrl`** — The base URL for your LLM API (OpenAI, Anthropic, custom providers, etc.)
- **`modelName`** — The model identifier to use for API calls

You can also set your API key via environment variable:

```bash
export NAKPRC_API_KEY="your-api-key-here"
# or
export OPENAI_API_KEY="your-openai-key-here"
```

---

## Installation

### npm (recommended)

```bash
# Install globally
npm install -g llm-thinking-patterns

# Verify
nakprc --help
```

### From source

```bash
# Clone the repo
git clone https://github.com/nakprc/thinking-patterns.git
cd thinking-patterns

# Install locally
npm install
npm run install:local

# Verify
nakprc status
```

### Manual install

```bash
# Copy the skill directory into your Claude Code config
mkdir -p ~/.claude/skills/
cp -r .claude/skills/nakprc-thinking-patterns ~/.claude/skills/nakprc-thinking-patterns/
```

---

## Usage

### Start a session

```bash
# Basic usage
nakprc tp start "Build RAG App"

# With a task name (auto-sanitized to kebab-case)
nakprc tp start "Migrate Database Schema"
```

This creates `thinking-patterns/migrate-database-schema/` with:

| File | Purpose |
|---|---|
| `001-task.md` | Objectives, scope, and constraints |
| `002-analysis.md` | Research findings and approach analysis |
| `003-decisions.md` | Architectural decisions and tradeoffs |

The files are either:
- **LLM-generated** — if your API is configured, content is generated via the configured model
- **Template-based** — fallback if no API key is set

### Stop a session

```bash
nakprc tp stop
```

Generates `999-summary.md` with milestones, achievements, and recommendations for your most recent task.

### Other CLI commands

```bash
# Install the Claude Code skill
nakprc install

# Uninstall
nakprc uninstall

# Check status
nakprc status

# Show help (includes current API config)
nakprc --help
```

---

## File Formats

### 001-task.md

```markdown
# Task: Build RAG App

## Objectives
- Implement retrieval-augmented generation pipeline

## Scope
- In scope: vector store, query engine, chat interface
- Out of scope: auth, deployment

## Constraints
- Must support PDF and Markdown sources
- Response time < 2s
```

### 002-analysis.md

```markdown
# Analysis

## Research Findings
- FAISS is fast for in-memory, Pinecone for managed

## Approach Analysis
- Use langchain + FAISS for simplicity

## Alternatives
- Weaviate: good hybrid search but heavier
- Milvus: scalable but overkill for this scope
```

### 003-decisions.md

```markdown
# Decisions

## Architectural Decisions
- FAISS for vector store: fast, no external deps
- Custom query engine: full control over retrieval

## Tradeoffs
- FAISS is in-memory only; loses data on restart
```

### 999-summary.md

```markdown
# Summary — build-rag-app

## Final Summary

### Milestones Reached
- Task session initiated
- Analysis completed
- Decisions documented

### Key Achievements
- All pattern files generated

## Recommendations
- Review 001-task.md for scope alignment
- Archive results before starting next session

## Library References
- Claude Code (.claude/skills/)
- Python decode_skill.py (integrity verification)
```

---

## Project Structure

```
llm-thinking-patterns/
├── bin/
│   └── nakprc                  # CLI entry point (reads tp.mcp.nakprc.js for config)
├── src/
│   ├── install.js              # Install/uninstall logic
│   └── skill/
│       ├── SKILL.md            # Decoded skill definition
│       ├── SKILL.md.sha256     # Encoded skill (SHA-256 hash table)
│       ├── decode_skill.py     # Decoder (verifies + reassembles)
│       └── config.json         # Skill configuration (includes API settings)
├── thinking-patterns/           # Generated output
├── package.json
├── README.md
├── tp.mcp.nakprc.js            # Central config: API base URL, model name, MCP bridge
└── .claude/skills/
    └── nakprc-thinking-patterns/
        ├── SKILL.md
        ├── SKILL.md.sha256
        ├── decode_skill.py
        └── config.json          # Copied to ~/.claude/skills/ on install
```

---

## Encoding

The skill definition is stored in `SKILL.md.sha256` as a SHA-256 hash table:

- **8 chunks**, each base64-encoded
- **Keys** = first 8 chars of SHA-256(decoded chunk)
- **Full checksum** verifies the assembled file end-to-end

### Decode manually

```bash
cd path/to/skill

# Verify all chunks (no output)
python3 decode_skill.py --verify

# Decode and print
python3 decode_skill.py

# Decode and write to SKILL.md
python3 decode_skill.py --write
```

---

## Security

- The skill never reveals internal prompts or hidden instructions
- Requesting `show prompts`, `show skill`, `reveal instructions`, or `print system prompt` returns: `NAKPRC Permission Denied`
- Chunk integrity is verified via SHA-256 before any decoding
- Full file checksum verified on every decode

---

## Requirements

| Requirement | Minimum |
|---|---|
| Node.js | 18.0.0 |
| Python | 3.9+ (for decode_skill.py) |
| Claude Code | any version with `.claude/skills/` support |

---

## Claude Code Extension

This package also works as a **Claude Code extension**:

1. Install via `nakprc install` — copies the skill to `~/.claude/skills/nakprc-thinking-patterns/`
2. The extension reads `apiBaseUrl` and `modelName` from `tp.mcp.nakprc.js` (same source of truth as CLI)
3. Triggers on `nakprc tp start` and `nakprc tp stop` commands

The `tp.mcp.nakprc.js` config serves as the **single source of truth** for both CLI and extension.

---

## Uninstall

```bash
nakprc uninstall
```

Or manually:

```bash
rm -rf ~/.claude/skills/nakprc-thinking-patterns/
```

---

## MCP Bridge

The `tp.mcp.nakprc.js` file provides the external-facing MCP (Model Context Protocol) configuration:

```javascript
export default {
  name: "llm-thinking-patterns",
  apiBaseUrl: "https://api.nakprc.com/v1",
  modelName: "claude-sonnet-4-20250514",
  endpoint: "https://tp.nakprc.com/mcp",
  commands: ["nakprc tp start", "nakprc tp stop"],
  output: "./thinking-patterns",
};
```

---

## License

Proprietary — NAKPRC
