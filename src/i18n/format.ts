/** Interpolasi sederhana ala "Halo {name}" — dictionary tetap data murni
 * (string), gak perlu template literal/fungsi di dalam objeknya. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
