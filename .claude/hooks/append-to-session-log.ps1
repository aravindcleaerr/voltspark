#Requires -Version 5
# Stop hook - appends a turn entry to docs/session-log.md after each assistant turn.
# PowerShell port of the field-engineering project's append-to-session-log.sh.
# Resilient: never breaks the session - all errors are swallowed, always exits 0.
# Opt-in: does nothing unless docs/session-log.md already exists.

$ErrorActionPreference = 'SilentlyContinue'

try {
    # Project root = two levels up from this script: .claude/hooks -> .claude -> <root>
    $projectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $log = Join-Path $projectDir 'docs\session-log.md'

    # Opt-in: do nothing unless the log file exists (user enables logging by creating it)
    if (-not (Test-Path -LiteralPath $log)) { exit 0 }

    # Hook input JSON arrives on stdin
    $raw = [Console]::In.ReadToEnd()
    $transcript = $null
    if (-not [string]::IsNullOrWhiteSpace($raw)) {
        try { $transcript = ($raw | ConvertFrom-Json).transcript_path } catch {}
    }

    $ts       = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $lastUser = '(no user prompt extracted)'
    $files    = @()

    if ($transcript -and (Test-Path -LiteralPath $transcript)) {
        $entries = @(
            foreach ($line in Get-Content -LiteralPath $transcript) {
                if ($line.Trim()) { try { $line | ConvertFrom-Json } catch {} }
            }
        )

        # Last genuine user prompt. A real prompt is preceded by an assistant message
        # that made NO tool calls (the end of the prior turn). Tool results AND
        # skill-injected content both follow an assistant message that made tool calls.
        $lastUserIdx = -1
        for ($i = 0; $i -lt $entries.Count; $i++) {
            $e = $entries[$i]
            if ($e.type -ne 'user' -or $null -eq $e.message.content) { continue }

            # Nearest preceding assistant message — skip this user msg if it made tool calls
            $precededByToolCall = $false
            for ($j = $i - 1; $j -ge 0; $j--) {
                if ($entries[$j].type -ne 'assistant') { continue }
                $pc = $entries[$j].message.content
                if ($pc -isnot [string]) {
                    foreach ($b in $pc) { if ($b.type -eq 'tool_use') { $precededByToolCall = $true } }
                }
                break
            }
            if ($precededByToolCall) { continue }

            $content = $e.message.content
            if ($content -is [string]) {
                $lastUserIdx = $i; $lastUser = $content
            }
            else {
                $txt = ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join ' '
                if ($txt) { $lastUserIdx = $i; $lastUser = $txt }
            }
        }

        # Files written/edited by the assistant since that user message
        if ($lastUserIdx -ge 0) {
            $seen = [ordered]@{}
            for ($i = $lastUserIdx + 1; $i -lt $entries.Count; $i++) {
                $e = $entries[$i]
                if ($e.type -ne 'assistant' -or $e.message.content -is [string]) { continue }
                foreach ($c in $e.message.content) {
                    if ($c.type -eq 'tool_use' -and $c.name -in @('Edit','Write','MultiEdit','NotebookEdit')) {
                        $fp = $c.input.file_path
                        if ($fp) {
                            # Make relative to project root (case-insensitive: drive letters may differ in case)
                            $rel = $fp
                            if ($fp.Length -gt $projectDir.Length -and
                                $fp.Substring(0, $projectDir.Length).ToLower() -eq $projectDir.ToLower()) {
                                $rel = $fp.Substring($projectDir.Length).TrimStart('\', '/')
                            }
                            $seen[$rel] = $true
                        }
                    }
                }
            }
            $files = @($seen.Keys)
        }
    }

    # One-line, length-capped user prompt
    $userFlat = ([regex]::Replace($lastUser, '\s+', ' ')).Trim()
    if ($userFlat.Length -gt 600) { $userFlat = $userFlat.Substring(0, 600) + '...' }

    $entry = "`n---`n`n### Turn @ $ts`n`n**User:** $userFlat`n"
    if ($files.Count -gt 0) { $entry += "`n**Files touched:** " + ($files -join ', ') + "`n" }

    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::AppendAllText($log, $entry, $utf8)
}
catch { }

exit 0
