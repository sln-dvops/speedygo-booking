import DOMPurify from "dompurify"

export function sanitizeFormData<T extends Record<string, string>>(data: T): T {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, DOMPurify.sanitize(value)])) as T
}

