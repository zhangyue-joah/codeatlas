export function getStringParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function getPositiveIntParam(value: string | string[] | undefined, fallback = 1): number {
  const raw = getStringParam(value);
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return fallback;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

/**
 * 读取“多值”查询参数：
 * - 支持 `?key=a&key=b`
 * - 支持 `?key=a,b`
 */
export function getStringArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(',');
  return raw.map((item) => item.trim()).filter(Boolean);
}

export function buildSearchHref(
  pathname: string,
  params: Record<string, string | string[] | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      searchParams.set(key, value.join(','));
      continue;
    }
    searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
