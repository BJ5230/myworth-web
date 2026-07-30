const preserve = new Set(['UOB', 'ASNB', 'CIMB', 'MYR', 'BJ']);

export function toPascalWords(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const clean = word.toUpperCase();
      if (preserve.has(clean)) return clean;
      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    })
    .join(' ');
}

export function makeId(): string {
  return crypto.randomUUID();
}
