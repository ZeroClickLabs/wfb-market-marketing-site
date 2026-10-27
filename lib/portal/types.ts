// The vendor portal's data, as the screens use it. Filled from Supabase when connected, or from
// sample data in the development preview (lib/portal/demo.ts).

import type { MarketId } from "@/components/wfb";

export type ParticipationStatus = "invited" | "confirmed" | "declined";

export interface PortalVendor {
  id: string;
  name: string;
  town: string;
  categories: string[];
  description: string;
  products: string[];
  website: string;
  instagram: string;
  phone: string;
  profilePublished: boolean;
  /** True when the vendor has edited their profile since it was last published. */
  profilePendingReview: boolean;
}

export interface PortalMarket {
  id: string;
  name: string;
  kind: MarketId;
}

export interface PortalDate {
  id: string;
  market: PortalMarket;
  /** YYYY-MM-DD */
  date: string;
  /** "HH:MM" */
  opensAt: string;
  closesAt: string;
  loadInAt: string;
  teardownBy: string;
  location: string;
  address: string;
  mapUrl?: string;
  contactName?: string;
  contactPhone?: string;
  vendorNotes?: string;
  dateStatus: "scheduled" | "cancelled" | "moved";
  status: ParticipationStatus;
  stall?: string;
  vendorNote?: string;
  respondedAt?: string;
}

export interface PortalUpdate {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned: boolean;
  read: boolean;
  /** e.g. "All vendors" or "Summer Market vendors". */
  audienceLabel: string;
  /** Set when an event partner posted it, e.g. "The Argo". */
  authorOrg?: string;
}

export interface PortalGuide {
  id: string;
  title: string;
  body: string;
  /** null = every market */
  marketId: string | null;
}

export interface PortalAsset {
  id: string;
  title: string;
  description: string;
  kind: "logo" | "social" | "poster" | "photo" | "other";
  market: PortalMarket | null;
  url: string;
  fileName: string;
  sizeLabel: string;
}

export interface PortalMember {
  name: string;
  email: string;
  isYou: boolean;
  emailUpdates: boolean;
}

export interface ProfileInput {
  name: string;
  town: string;
  description: string;
  products: string[];
  website: string;
  instagram: string;
  phone: string;
}

// ---- Admin --------------------------------------------------------------------------------------

export type VendorStatus = "lead" | "applied" | "approved" | "active" | "inactive" | "declined";
export type NoteKind = "note" | "email" | "call" | "meeting";

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** Last time a portal invite was sent. */
  invitedAt?: string;
  hasLogin: boolean;
  emailUpdates: boolean;
}

export interface AdminNote {
  id: string;
  kind: NoteKind;
  body: string;
  at: string;
  author: string;
}

export interface AdminVendor extends PortalVendor {
  status: VendorStatus;
  source: "application" | "manual";
  createdAt: string;
  contacts: AdminContact[];
  notes: AdminNote[];
  marketIds: string[];
  applicationId?: string;
}

export interface AdminApplication {
  id: string;
  submittedAt: string;
  business: string;
  name: string;
  email: string;
  phone?: string;
  town: string;
  category: string;
  products: string;
  markets: string[];
  status: "new" | "approved" | "declined";
  vendorId: string;
}

/** A market date without any one vendor's answer. */
export type MarketDate = Omit<PortalDate, "status" | "stall" | "vendorNote" | "respondedAt">;

export interface Participation {
  vendorId: string;
  dateId: string;
  status: ParticipationStatus;
  stall?: string;
  note?: string;
  respondedAt?: string;
}

export interface Audience {
  kind: "all" | "market" | "vendors";
  marketId?: string;
  vendorIds?: string[];
}

export interface AdminUpdate {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned: boolean;
  audience: Audience;
  audienceLabel: string;
  emailedAt?: string;
  recipients: { vendorId: string; vendorName: string; readAt?: string }[];
  /** Set when an event partner posted it, e.g. "The Argo". */
  authorOrg?: string;
}

export interface RosterRow extends Participation {
  vendorName: string;
  categories: string[];
}

export interface DateCounts {
  invited: number;
  confirmed: number;
  declined: number;
}

// ---- Event partners -----------------------------------------------------------------------------

export interface MarketPartner {
  id: string;
  marketId: string;
  name: string;
  email: string;
  organisation: string;
  invitedAt?: string;
  hasLogin: boolean;
}

export interface EventTask {
  id: string;
  marketId: string;
  title: string;
  notes?: string;
  owner: "market" | "partner";
  dueDate?: string;
  doneAt?: string;
  doneBy?: string;
  createdAt: string;
}

export interface EventNote {
  id: string;
  marketId: string;
  body: string;
  authorName: string;
  authorOrg?: string;
  at: string;
}

/** A roster row as an event partner sees it: no CRM fields, plus contacts for the day. */
export interface PartnerRosterRow extends RosterRow {
  contacts: { name: string; email: string; phone?: string }[];
}
