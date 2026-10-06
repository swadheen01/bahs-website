/**
 * Emergency compatibility shim for legacy route handlers.
 *
 * Public data pages now render dynamically, so invalidating an App Router path
 * after an API request has no useful effect and can create persistent ISR
 * writes. Keep handlers response-compatible while the obsolete calls are
 * removed from their individual mutation paths.
 */
export function revalidatePath(_path: string, _type?: "layout" | "page"): void {}
