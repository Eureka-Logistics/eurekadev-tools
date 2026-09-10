export interface RegexMatchItem {
  index: number;
  match: string;
  start: number;
  end: number;
  groups: string[];
}

export interface RegexTestResult {
  valid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  replacedText?: string;
}

export function executeRegex(
  pattern: string,
  flags: string,
  testString: string,
  replacePattern?: string,
): RegexTestResult {
  if (!pattern) {
    return { valid: true, matches: [], replacedText: testString };
  }

  try {
    const isGlobal = flags.includes("g");
    // Ensure we don't infinitely loop on 0-length matches
    const safeFlags = isGlobal ? flags : flags + "g";
    const regex = new RegExp(pattern, safeFlags);

    const matches: RegexMatchItem[] = [];
    let match: RegExpExecArray | null;
    let loopCount = 0;
    const maxLoops = 2000;

    while (
      (match = regex.exec(testString)) !== null &&
      loopCount++ < maxLoops
    ) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;
      const groups = match.slice(1);

      matches.push({
        index: matches.length + 1,
        match: matchText,
        start,
        end,
        groups: groups.map((g) => (g !== undefined ? g : "")),
      });

      if (!isGlobal) break;

      if (matchText.length === 0) {
        regex.lastIndex++;
      }
    }

    let replacedText = testString;
    if (replacePattern !== undefined) {
      const replacerRegex = new RegExp(pattern, flags);
      replacedText = testString.replace(replacerRegex, replacePattern);
    }

    return {
      valid: true,
      matches,
      replacedText,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
      matches: [],
    };
  }
}
