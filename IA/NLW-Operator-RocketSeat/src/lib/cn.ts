import { twMerge } from "tailwind-merge";

type ClassValue = false | null | string | undefined;

export function cn(...classes: ClassValue[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}
