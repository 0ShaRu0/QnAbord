const INTERNAL_ORIGIN = "https://internal.invalid";

export function getSafeRedirect(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\u0000-\u0020\u007f]/.test(value))
    return "/";
  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    // Dot-segment normalization can turn /folder/..//host into //host.
    // Returning that pathname would reinterpret it as a protocol-relative URL.
    if (url.origin !== INTERNAL_ORIGIN || url.pathname.startsWith("//")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
