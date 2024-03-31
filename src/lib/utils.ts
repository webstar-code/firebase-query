import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Transaction {
  id: string,
  customer: string,
  amount: number,
  currency: any,
  status: "succeeded" | "failed" | "attempted",
  paymentMethod: "online" | "cash",
  date: string
}

