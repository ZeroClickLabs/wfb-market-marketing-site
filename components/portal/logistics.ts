import type { AdminField } from "./AdminForm";
import type { MarketDate } from "@/lib/portal/types";

/** The fields for editing a date's logistics, filled from the date (or the last date, for new ones). */
export function logisticsFormFields(d?: Partial<MarketDate>): AdminField[] {
  return [
    { kind: "time", name: "opensAt", label: "Opens", required: true, defaultValue: d?.opensAt ?? "08:00", half: true },
    { kind: "time", name: "closesAt", label: "Closes", required: true, defaultValue: d?.closesAt ?? "13:00", half: true },
    { kind: "time", name: "loadInAt", label: "Load-in from", required: true, defaultValue: d?.loadInAt ?? "06:30", half: true },
    { kind: "time", name: "teardownBy", label: "Packed up by", required: true, defaultValue: d?.teardownBy ?? "14:00", half: true },
    { kind: "text", name: "location", label: "Location", required: true, defaultValue: d?.location, half: true },
    { kind: "text", name: "address", label: "Address for maps", defaultValue: d?.address, half: true },
    { kind: "text", name: "contactName", label: "Day-of contact", defaultValue: d?.contactName, half: true },
    { kind: "tel", name: "contactPhone", label: "Day-of phone", defaultValue: d?.contactPhone, half: true },
    { kind: "textarea", name: "vendorNotes", label: "Notes for vendors (optional)", hint: "Shown on this date's page in the vendor portal.", defaultValue: d?.vendorNotes },
  ];
}
