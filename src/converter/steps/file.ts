import { FileStep } from "../../features/workflow/types/workflow";
import {
  interpolateVars,
  interpolateVarsPwsh,
  escapePwshSingleQuoted,
  escapeSedPattern,
  escapeSedReplace,
} from "../utils";

export function toBash(step: FileStep): string {
  const { operation } = step;
  const filePath = interpolateVars(step.filePath);

  switch (operation.type) {
    case "createOrOverwrite": {
      const content = interpolateVars(operation.content);
      return `cat > "${filePath}" << EOF\n${content}\nEOF`;
    }

    case "append": {
      const content = interpolateVars(operation.content);
      return `cat >> "${filePath}" << EOF\n${content}\nEOF`;
    }

    case "replaceText": {
      const search = interpolateVars(operation.search);
      const replace = interpolateVars(operation.replace);
      return `sed -i 's|${escapeSedPattern(search)}|${escapeSedReplace(replace)}|g' "${filePath}"`;
    }
  }
}

export function toPowerShell(step: FileStep): string {
  const { operation } = step;
  const filePath = interpolateVarsPwsh(step.filePath);

  switch (operation.type) {
    case "createOrOverwrite": {
      const content = interpolateVarsPwsh(operation.content);
      return `Set-Content -Path "${filePath}" -Value @"\n${content}\n"@`;
    }

    case "append": {
      const content = interpolateVarsPwsh(operation.content);
      return `Add-Content -Path "${filePath}" -Value "${content}"`;
    }

    case "replaceText": {
      const search = escapePwshSingleQuoted(interpolateVarsPwsh(operation.search));
      const replace = escapePwshSingleQuoted(interpolateVarsPwsh(operation.replace));
      return `(Get-Content "${filePath}") -replace '${search}', '${replace}' | Set-Content "${filePath}"`;
    }
  }
}
