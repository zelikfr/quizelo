import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists with conflict resolution.
 * Use everywhere in place of template-string concatenation.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
