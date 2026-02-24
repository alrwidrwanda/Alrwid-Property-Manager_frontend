/**
 * Builds a route path for a page, with optional query string.
 * @param {string} pageWithOptionalQuery - e.g. "Dashboard" or "ClientProfile?id=123"
 * @returns {string} - e.g. "/Dashboard" or "/ClientProfile?id=123"
 */
export function createPageUrl(pageWithOptionalQuery) {
  const [page, qs] = String(pageWithOptionalQuery).split('?')
  const base = `/${page}`
  return qs ? `${base}?${qs}` : base
}
