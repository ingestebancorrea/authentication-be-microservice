const PLACEHOLDER = /\{(\w+)\}/g;

export function formatMessage(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(PLACEHOLDER, (token, key: string) =>
    key in params ? String(params[key]) : token,
  );
}