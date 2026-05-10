# Claude Code Session Log — Setup Guide

A drop-in setup that gives every Claude Code project an auto-updating
`SESSION_LOG.md` capturing every conversation across every session.

## What you get

- `<project-root>/SESSION_LOG.md` — a chronologically-ordered, human-readable
  Markdown file with one entry per Claude turn (user prompt + assistant reply).
- Auto-appended after every Claude Code turn ends, in every session that has
  this project as its working directory.
- A one-shot backfill that reconstructs entries from the project's full
  transcript history (so the log doesn't start empty).

What is **not** captured: tool calls, thinking, raw transcripts, sub-agent
work. Those still live in the per-session JSONL transcripts under
`~/.claude/projects/`. If you need them, read those directly.

## Why a hook (and not memory or CLAUDE.md)

This is an automated behavior triggered by an event ("after each turn,
append to a file"). Memory, preferences, and CLAUDE.md are *instructions
to Claude* — they cannot trigger anything. Only a `Stop` hook configured
in `~/.claude/settings.json` runs automatically when each Claude turn ends.

## Prerequisites

- Node.js (any recent version; 18+ is fine).
- Claude Code with hook support.
- Write access to `~/.claude/settings.json` and `~/.claude/hooks/`.

## How to set it up

You have two options:

### Option A — Have Claude do it for you

Open Claude Code in the project. Paste the prompt at the bottom of this
document into the chat. Claude will create the script, wire the hook,
backfill from history, and report when done.

### Option B — Do it manually

Follow the steps below. About 5 minutes.

---

## Step 1 — Create the hook script

Save the following as `~/.claude/hooks/session-log.js`:

```javascript
#!/usr/bin/env node
// Stop hook: append a Markdown digest of each Claude turn to <cwd>/SESSION_LOG.md
// Receives JSON on stdin: { session_id, transcript_path, cwd, stop_hook_active, ... }
// Silent on every error — must never block Claude.

const fs = require('fs');
const path = require('path');

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (buf += c));
process.stdin.on('end', () => {
  try {
    const hook = JSON.parse(buf || '{}');
    if (hook.stop_hook_active === true) return;

    const transcriptPath = hook.transcript_path;
    const cwd = hook.cwd;
    const sessionId = hook.session_id || '';
    if (!transcriptPath || !cwd || !fs.existsSync(transcriptPath)) return;

    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    const msgs = [];
    for (const ln of lines) {
      try { msgs.push(JSON.parse(ln)); } catch { /* skip malformed */ }
    }

    // Find the LAST "real" user message — what the human actually typed.
    // Skip:
    //   - tool results (toolUseResult / sourceToolAssistantUUID, or all-tool_result content)
    //   - skill body injections (isMeta:true + sourceToolUseID — entire skill markdown)
    //   - any other synthetic tool-originated message
    let userIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.type !== 'user' || !m.message || m.message.role !== 'user') continue;
      if (m.isMeta === true) continue;
      if (m.sourceToolUseID) continue;
      if (m.sourceToolAssistantUUID) continue;
      if (m.toolUseResult !== undefined) continue;
      const content = m.message.content;
      if (Array.isArray(content) && content.every((c) => c && c.type === 'tool_result')) continue;
      userIdx = i;
      break;
    }
    if (userIdx === -1) return;

    // Extract user text
    let userText = '';
    const userContent = msgs[userIdx].message.content;
    if (typeof userContent === 'string') {
      userText = userContent;
    } else if (Array.isArray(userContent)) {
      userText = userContent
        .filter((c) => c && c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text)
        .join('\n');
    }

    // Strip harness/IDE noise tags
    userText = userText
      .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
      .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, '')
      .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, '')
      .replace(/<command-message>[\s\S]*?<\/command-message>/g, '')
      .replace(/<command-name>[\s\S]*?<\/command-name>/g, '')
      .replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g, '')
      .replace(/<user-prompt-submit-hook>[\s\S]*?<\/user-prompt-submit-hook>/g, '')
      .trim();

    if (!userText) return;

    // Collect assistant text emitted after that user message
    const assistantParts = [];
    for (let i = userIdx + 1; i < msgs.length; i++) {
      const m = msgs[i];
      if (m.type !== 'assistant' || !m.message) continue;
      const content = m.message.content;
      if (!Array.isArray(content)) continue;
      for (const c of content) {
        if (c && c.type === 'text' && typeof c.text === 'string' && c.text.trim()) {
          assistantParts.push(c.text);
        }
      }
    }
    const assistantText = assistantParts.join('\n\n').trim();
    if (!assistantText) return;

    // Build entry
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const projectName = path.basename(cwd) || cwd;
    const sid = sessionId.slice(0, 8) || 'unknown';

    const entry =
      `\n## ${ts} — ${projectName} · session ${sid}\n\n` +
      `**User:**\n\n${userText}\n\n` +
      `**Assistant:**\n\n${assistantText}\n\n` +
      `---\n`;

    const logPath = path.join(cwd, 'SESSION_LOG.md');
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(
        logPath,
        `# Session Log — ${projectName}\n\n` +
          `Auto-generated by Claude Code Stop hook. Each entry = one turn ` +
          `(user prompt + assistant reply). Tool calls and thinking are not logged.\n`
      );
    }
    fs.appendFileSync(logPath, entry);
  } catch {
    // never block Claude
  }
});
```

## Step 2 — Wire the hook in `~/.claude/settings.json`

Merge (don't replace) this block into your existing `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/session-log.js\""
          }
        ]
      }
    ]
  }
}
```

If you already have other top-level keys (`permissions`, `env`, etc.), keep
them and add `"hooks"` alongside. If you already have other Stop hooks,
append a new entry to the existing `"Stop"` array — don't overwrite it.

## Step 3 — Verify with a pipe-test (optional but recommended)

```bash
mkdir -p /tmp/sl-test
cat > /tmp/sl-test/transcript.jsonl <<'EOF'
{"type":"user","message":{"role":"user","content":"hello"}}
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Looking..."},{"type":"tool_use","id":"t1","name":"Read","input":{}}]}}
{"type":"user","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","content":"x"}]},"toolUseResult":{}}
{"type":"user","message":{"role":"user","content":[{"type":"text","text":"# Some Skill\nbody..."}]},"isMeta":true,"sourceToolUseID":"abc"}
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Done."}]}}
EOF
echo '{"session_id":"abc12345xyz","transcript_path":"/tmp/sl-test/transcript.jsonl","cwd":"/tmp/sl-test","stop_hook_active":false,"hook_event_name":"Stop"}' \
  | node "$HOME/.claude/hooks/session-log.js"
cat /tmp/sl-test/SESSION_LOG.md
```

You should see one entry where `**User:**` is `hello` (NOT the skill body
from message 4) and `**Assistant:**` contains both `Looking...` and `Done.`
joined. If the skill body shows up as the user prompt, the `isMeta` /
`sourceToolUseID` filters aren't being applied — re-check Step 1.

> **Windows note:** Node on Windows resolves `/tmp/x` against the current
> drive (e.g. `D:\tmp\x`), which may not exist. Use a forward-slash
> absolute path like `C:/Users/<you>/AppData/Local/Temp/sl-test` for the
> test instead.

## Step 4 — Backfill from history (one-shot)

This populates `SESSION_LOG.md` with every past conversation in this
project's transcript history, not just the ones from now on.

Save the following as `~/.claude/hooks/session-log-regen-all.js`:

```javascript
// One-shot: walk every JSONL transcript in a project's transcript dir and emit
// a single chronologically-merged SESSION_LOG.md.
// Usage: node session-log-regen-all.js <transcript-dir> <out.md> <project-display-name>

const fs = require('fs');
const path = require('path');

const transcriptDir = process.argv[2];
const outPath = process.argv[3];
const projectName = process.argv[4];
if (!transcriptDir || !outPath || !projectName) {
  console.error('usage: node session-log-regen-all.js <transcript-dir> <out.md> <project-name>');
  process.exit(2);
}

const stripTags = (s) =>
  s
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, '')
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, '')
    .replace(/<command-message>[\s\S]*?<\/command-message>/g, '')
    .replace(/<command-name>[\s\S]*?<\/command-name>/g, '')
    .replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g, '')
    .replace(/<user-prompt-submit-hook>[\s\S]*?<\/user-prompt-submit-hook>/g, '')
    .trim();

const isRealUserMsg = (m) => {
  if (!m || m.type !== 'user' || !m.message || m.message.role !== 'user') return false;
  if (m.isMeta === true) return false;
  if (m.sourceToolUseID) return false;
  if (m.sourceToolAssistantUUID) return false;
  if (m.toolUseResult !== undefined) return false;
  const content = m.message.content;
  if (Array.isArray(content) && content.every((c) => c && c.type === 'tool_result')) return false;
  return true;
};

const extractUserText = (m) => {
  const c = m.message.content;
  let t = '';
  if (typeof c === 'string') t = c;
  else if (Array.isArray(c)) t = c.filter((x) => x && x.type === 'text' && typeof x.text === 'string').map((x) => x.text).join('\n');
  return stripTags(t);
};

const extractAssistantText = (m) => {
  if (!m || m.type !== 'assistant' || !m.message) return '';
  const c = m.message.content;
  if (!Array.isArray(c)) return '';
  return c.filter((x) => x && x.type === 'text' && typeof x.text === 'string' && x.text.trim()).map((x) => x.text).join('\n\n');
};

const fmtTs = (iso) => {
  const d = iso ? new Date(iso) : new Date(0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const files = fs
  .readdirSync(transcriptDir)
  .filter((f) => f.endsWith('.jsonl'))
  .map((f) => {
    const full = path.join(transcriptDir, f);
    return { full, name: f, mtime: fs.statSync(full).mtimeMs };
  })
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  console.error('no transcripts found in', transcriptDir);
  process.exit(1);
}
const activeFile = files[0].full;

const allEntries = [];
const perFileStats = [];

for (const fileInfo of files) {
  const lines = fs.readFileSync(fileInfo.full, 'utf8').trim().split('\n');
  const msgs = [];
  for (const ln of lines) { try { msgs.push(JSON.parse(ln)); } catch {} }
  const sessionId = (msgs.find((m) => m.sessionId) || {}).sessionId || path.basename(fileInfo.name, '.jsonl');
  const sid = sessionId.slice(0, 8);

  const turns = [];
  let i = 0;
  while (i < msgs.length) {
    if (!isRealUserMsg(msgs[i])) { i++; continue; }
    const userText = extractUserText(msgs[i]);
    const userTs = msgs[i].timestamp;
    if (!userText) { i++; continue; }
    const parts = [];
    let j = i + 1;
    for (; j < msgs.length; j++) {
      if (isRealUserMsg(msgs[j])) break;
      const at = extractAssistantText(msgs[j]);
      if (at) parts.push(at);
    }
    const assistantText = parts.join('\n\n').trim();
    if (assistantText) {
      turns.push({ tsIso: userTs, sid, userText, assistantText });
    }
    i = j;
  }

  // For the active transcript, drop the trailing turn (in-progress)
  if (fileInfo.full === activeFile && turns.length > 0) {
    turns.pop();
  }

  perFileStats.push({ name: fileInfo.name, sid, turns: turns.length, active: fileInfo.full === activeFile });
  for (const t of turns) allEntries.push(t);
}

allEntries.sort((a, b) => {
  const ta = new Date(a.tsIso || 0).getTime();
  const tb = new Date(b.tsIso || 0).getTime();
  return ta - tb;
});

let out = `# Session Log — ${projectName}\n\n` +
  `Auto-generated by Claude Code Stop hook. Each entry = one turn ` +
  `(user prompt + assistant reply). Tool calls and thinking are not logged.\n`;

for (const e of allEntries) {
  out += `\n## ${fmtTs(e.tsIso)} — ${projectName} · session ${e.sid}\n\n` +
    `**User:**\n\n${e.userText}\n\n` +
    `**Assistant:**\n\n${e.assistantText}\n\n` +
    `---\n`;
}

fs.writeFileSync(outPath, out);

console.error(`wrote ${allEntries.length} entries to ${outPath}`);
console.error('per-file:');
for (const s of perFileStats) {
  console.error(`  ${s.sid} ${s.active ? '[active]' : '         '} turns=${s.turns}  (${s.name})`);
}
```

Find this project's transcript directory. Claude Code stores transcripts at
`~/.claude/projects/<sanitized-cwd>/`, where `<sanitized-cwd>` is the
absolute project path with the drive colon and slashes replaced by dashes:

| OS / cwd                              | Sanitized name                   |
|---------------------------------------|----------------------------------|
| `/Users/me/code/foo`                  | `-Users-me-code-foo`             |
| `/home/me/code/foo`                   | `-home-me-code-foo`              |
| `D:/Project-AI/Foo Bar`               | `d--Project-AI-Foo-Bar`          |

Verify with `ls ~/.claude/projects/` and pick the directory matching this
project. Then run:

```bash
node ~/.claude/hooks/session-log-regen-all.js \
  ~/.claude/projects/<sanitized-cwd> \
  <project-root>/SESSION_LOG.md \
  "<display name>"
```

The script reports how many entries it wrote per session and in total. The
**most recently modified** transcript is treated as "active" and its
trailing turn is dropped — that's the in-progress conversation, which the
live Stop hook will write cleanly when the current turn ends.

You can re-run the regen at any time. It overwrites `SESSION_LOG.md` from
scratch, so any manual edits will be lost.

## Step 5 — Other Claude Code windows already open

Settings are loaded once at session start. Any Claude Code window that was
**already open** in this project before you added the hook won't fire it.
In each such window, run `/hooks` once (which reloads config) or restart
the window. New sessions started from now on pick up the hook automatically.

## Optional: `.gitignore`

Decide whether to commit `SESSION_LOG.md`. If not (typical for personal
notes), add to `.gitignore`:

```
SESSION_LOG.md
```

If it's a team project and you want the conversation history shared, omit
that line and commit the file. Be aware the log can contain anything you
typed into Claude — review before committing if you handle secrets.

## Troubleshooting

**Log file isn't being created.**
Run `/hooks` in the session and check that `Stop` shows the
`session-log.js` command. If not, the settings.json edit didn't apply —
check JSON syntax with `node -e "JSON.parse(require('fs').readFileSync(process.env.HOME + '/.claude/settings.json', 'utf8'))"`.

**Log entries contain skill bodies as the "user prompt".**
The `isMeta` / `sourceToolUseID` / `sourceToolAssistantUUID` /
`toolUseResult` filters in Step 1 aren't being applied. Re-paste the
script.

**Log entries contain `<ide_selection>` or `<ide_opened_file>` blocks.**
The tag-stripping regex list is incomplete. Compare against Step 1.

**Backfill says "no transcripts found".**
You named the wrong sanitized directory. List
`~/.claude/projects/` and find the one matching your cwd.

---

## Appendix — Drop-in prompt for Claude

Paste this into a fresh Claude Code session in the project where you want
the log set up. Claude will do all five steps and report when done.

````
Set up an automatic session log for this project, and backfill it with
every past conversation in this project's transcript history.

Goal: <cwd>/SESSION_LOG.md should contain a chronologically-ordered,
human-readable Markdown digest of every Claude Code conversation that has
ever happened (or will happen) in this project's directory — across all
sessions.

Follow the doc at <cwd>/CLAUDE-SESSION-LOG-SETUP.md (or copy from
~/CLAUDE-SESSION-LOG-SETUP.md). Specifically:

  1. Create ~/.claude/hooks/session-log.js exactly as specified in Step 1
     of the doc. Do not omit any of the filters (isMeta, sourceToolUseID,
     sourceToolAssistantUUID, toolUseResult, all-tool_result content) or
     any of the tag-stripping regexes.
  2. Merge the Stop hook into ~/.claude/settings.json per Step 2. Use the
     update-config skill if available; otherwise read the file, merge the
     hooks block in, and write it back as valid JSON.
  3. Pipe-test the hook per Step 3, including a synthetic skill-body
     injection message (isMeta:true + sourceToolUseID). Confirm the User:
     section in the output is the real prompt, NOT the skill body.
  4. Find this project's transcript directory under ~/.claude/projects/
     (sanitize cwd: replace drive colon and slashes with dashes). Create
     ~/.claude/hooks/session-log-regen-all.js per Step 4 of the doc and
     run it to backfill <cwd>/SESSION_LOG.md from history. Report
     entry count, session count, and date range covered.
  5. Tell me to run /hooks (or restart) in any other Claude Code windows
     I already have open in this project, since settings are loaded at
     session start. Suggest gitignoring SESSION_LOG.md.
````
