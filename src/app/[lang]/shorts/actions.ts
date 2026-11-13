"use server";

import { getShorts, type Page, type ShortsItem } from "@/lib/api";

// The next page of the feed as the visitor scrolls. page comes from the browser like any other input.
export async function moreShorts(page: unknown): Promise<Page<ShortsItem>> {
  if (typeof page !== "number" || !Number.isInteger(page) || page < 1 || page > 10_000) throw new Error("bad page");
  return getShorts(page, PAGE_SIZE);
}

const PAGE_SIZE = 20;
