#!/usr/bin/env bash
# no-dash-check: PreToolUse hook for Write and Edit.
# Blocks any content that contains an em dash (U+2014) or en dash (U+2013).
# Enforces the project writing rule in CLAUDE.md. Plain hyphens are unaffected.
input=$(cat)
text=$(printf '%s' "$input" | jq -r '[.tool_input.content // empty, .tool_input.new_string // empty] | join("\n")')
if printf '%s' "$text" | grep -qP '[\x{2013}\x{2014}]'; then
  echo "Blocked: the content contains an em dash or en dash. This project forbids both (see CLAUDE.md Writing Rules). Use a hyphen for compound words, or a comma, colon, parentheses, or two sentences instead." >&2
  exit 2
fi
exit 0
