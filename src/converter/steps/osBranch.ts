export function toBash(firstIds: {
  macos: string | null;
  linux: string | null;
  windows: string | null;
}): string {
  const lines: string[] = [];

  lines.push('case "$(uname -s)" in');
  if (firstIds.macos) lines.push(`  Darwin) NEXT="${firstIds.macos}" ;;`);
  if (firstIds.linux) lines.push(`  Linux) NEXT="${firstIds.linux}" ;;`);
  if (firstIds.windows) lines.push(`  CYGWIN*|MINGW*|MSYS*) NEXT="${firstIds.windows}" ;;`);
  lines.push('  *) echo "Unsupported OS: $(uname -s)" >&2; exit 1 ;;');
  lines.push("esac");

  return lines.join("\n");
}

export function toPowerShell(firstIds: {
  macos: string | null;
  linux: string | null;
  windows: string | null;
}): string {
  const lines: string[] = [];

  lines.push('if ($PSVersionTable.Platform -eq "Win32NT") {');
  if (firstIds.windows) lines.push(`  $NEXT = '${firstIds.windows}'`);
  lines.push('} elseif ($PSVersionTable.OS -match "Darwin") {');
  if (firstIds.macos) lines.push(`  $NEXT = '${firstIds.macos}'`);
  lines.push('} else {');
  if (firstIds.linux) lines.push(`  $NEXT = '${firstIds.linux}'`);
  lines.push("}");

  return lines.join("\n");
}
