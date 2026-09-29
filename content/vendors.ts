import type { Vendor } from "./types";

// The Summer Market's vendors. The Market opens in summer 2027, so there are none yet:
// the directory and the /vendors/[slug] pages switch on as soon as this list has entries.
// (The sample vendors used while designing the site are in git history.)
//
// Makers for Christmas at The Argo live in content/argo.ts.

export const vendors: Vendor[] = [];

export function getVendor(slug: string) {
  return vendors.find((v) => v.slug === slug);
}
