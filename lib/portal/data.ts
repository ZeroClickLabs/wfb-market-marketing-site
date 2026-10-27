// Everything the vendor portal, partner area and admin read and change. In the development preview
// (lib/portal/demo.ts) it's the sample data; otherwise Supabase, as the signed-in user with row-level
// security applying. The screens don't need to know which.

import { isPortalDemo } from "./demo";
import * as demo from "./data-demo";
import * as live from "./data-live";

// Typed as the preview's module, so the live one must offer every function with the same signature.
const impl = (): typeof demo => (isPortalDemo() ? demo : live);

export type { VendorFilter, MarketSummary, DateTemplate, Logistics } from "./data-demo";

export const getVendor = (...args: Parameters<typeof demo.getVendor>) => impl().getVendor(...args);
export const listMembers = (...args: Parameters<typeof demo.listMembers>) => impl().listMembers(...args);
export const listDates = (...args: Parameters<typeof demo.listDates>) => impl().listDates(...args);
export const getDate = (...args: Parameters<typeof demo.getDate>) => impl().getDate(...args);
export const respond = (...args: Parameters<typeof demo.respond>) => impl().respond(...args);
export const listUpdates = (...args: Parameters<typeof demo.listUpdates>) => impl().listUpdates(...args);
export const getUpdate = (...args: Parameters<typeof demo.getUpdate>) => impl().getUpdate(...args);
export const markUpdateRead = (...args: Parameters<typeof demo.markUpdateRead>) => impl().markUpdateRead(...args);
export const listGuides = (...args: Parameters<typeof demo.listGuides>) => impl().listGuides(...args);
export const listAssets = (...args: Parameters<typeof demo.listAssets>) => impl().listAssets(...args);
export const updateProfile = (...args: Parameters<typeof demo.updateProfile>) => impl().updateProfile(...args);
export const setEmailUpdates = (...args: Parameters<typeof demo.setEmailUpdates>) => impl().setEmailUpdates(...args);
export const listVendors = (...args: Parameters<typeof demo.listVendors>) => impl().listVendors(...args);
export const getAdminVendor = (...args: Parameters<typeof demo.getAdminVendor>) => impl().getAdminVendor(...args);
export const createVendor = (...args: Parameters<typeof demo.createVendor>) => impl().createVendor(...args);
export const setVendorStatus = (...args: Parameters<typeof demo.setVendorStatus>) => impl().setVendorStatus(...args);
export const addVendorNote = (...args: Parameters<typeof demo.addVendorNote>) => impl().addVendorNote(...args);
export const addContact = (...args: Parameters<typeof demo.addContact>) => impl().addContact(...args);
export const inviteContact = (...args: Parameters<typeof demo.inviteContact>) => impl().inviteContact(...args);
export const publishProfile = (...args: Parameters<typeof demo.publishProfile>) => impl().publishProfile(...args);
export const listApplications = (...args: Parameters<typeof demo.listApplications>) => impl().listApplications(...args);
export const getApplication = (...args: Parameters<typeof demo.getApplication>) => impl().getApplication(...args);
export const decideApplication = (...args: Parameters<typeof demo.decideApplication>) => impl().decideApplication(...args);
export const listMarkets = (...args: Parameters<typeof demo.listMarkets>) => impl().listMarkets(...args);
export const getMarket = (...args: Parameters<typeof demo.getMarket>) => impl().getMarket(...args);
export const createMarket = (...args: Parameters<typeof demo.createMarket>) => impl().createMarket(...args);
export const addDates = (...args: Parameters<typeof demo.addDates>) => impl().addDates(...args);
export const inviteToMarket = (...args: Parameters<typeof demo.inviteToMarket>) => impl().inviteToMarket(...args);
export const getRoster = (...args: Parameters<typeof demo.getRoster>) => impl().getRoster(...args);
export const setStall = (...args: Parameters<typeof demo.setStall>) => impl().setStall(...args);
export const setDateStatus = (...args: Parameters<typeof demo.setDateStatus>) => impl().setDateStatus(...args);
export const remindNonResponders = (...args: Parameters<typeof demo.remindNonResponders>) => impl().remindNonResponders(...args);
export const audienceSize = (...args: Parameters<typeof demo.audienceSize>) => impl().audienceSize(...args);
export const listAdminUpdates = (...args: Parameters<typeof demo.listAdminUpdates>) => impl().listAdminUpdates(...args);
export const createUpdate = (...args: Parameters<typeof demo.createUpdate>) => impl().createUpdate(...args);
export const setUpdatePinned = (...args: Parameters<typeof demo.setUpdatePinned>) => impl().setUpdatePinned(...args);
export const deleteUpdate = (...args: Parameters<typeof demo.deleteUpdate>) => impl().deleteUpdate(...args);
export const getGuide = (...args: Parameters<typeof demo.getGuide>) => impl().getGuide(...args);
export const saveGuide = (...args: Parameters<typeof demo.saveGuide>) => impl().saveGuide(...args);
export const deleteGuide = (...args: Parameters<typeof demo.deleteGuide>) => impl().deleteGuide(...args);
export const addAsset = (...args: Parameters<typeof demo.addAsset>) => impl().addAsset(...args);
export const deleteAsset = (...args: Parameters<typeof demo.deleteAsset>) => impl().deleteAsset(...args);
export const listAllMarkets = (...args: Parameters<typeof demo.listAllMarkets>) => impl().listAllMarkets(...args);
export const dashboard = (...args: Parameters<typeof demo.dashboard>) => impl().dashboard(...args);
export const getMarketById = (...args: Parameters<typeof demo.getMarketById>) => impl().getMarketById(...args);
export const listMarketsByIds = (...args: Parameters<typeof demo.listMarketsByIds>) => impl().listMarketsByIds(...args);
export const getMarketDate = (...args: Parameters<typeof demo.getMarketDate>) => impl().getMarketDate(...args);
export const listMarketDates = (...args: Parameters<typeof demo.listMarketDates>) => impl().listMarketDates(...args);
export const getPartnerRoster = (...args: Parameters<typeof demo.getPartnerRoster>) => impl().getPartnerRoster(...args);
export const updateDateLogistics = (...args: Parameters<typeof demo.updateDateLogistics>) => impl().updateDateLogistics(...args);
export const setMarketStall = (...args: Parameters<typeof demo.setMarketStall>) => impl().setMarketStall(...args);
export const listMarketUpdates = (...args: Parameters<typeof demo.listMarketUpdates>) => impl().listMarketUpdates(...args);
export const listMarketAssets = (...args: Parameters<typeof demo.listMarketAssets>) => impl().listMarketAssets(...args);
export const deleteMarketAsset = (...args: Parameters<typeof demo.deleteMarketAsset>) => impl().deleteMarketAsset(...args);
export const listMarketGuides = (...args: Parameters<typeof demo.listMarketGuides>) => impl().listMarketGuides(...args);
export const listTasks = (...args: Parameters<typeof demo.listTasks>) => impl().listTasks(...args);
export const listTasksDue = (...args: Parameters<typeof demo.listTasksDue>) => impl().listTasksDue(...args);
export const addTask = (...args: Parameters<typeof demo.addTask>) => impl().addTask(...args);
export const setTaskDone = (...args: Parameters<typeof demo.setTaskDone>) => impl().setTaskDone(...args);
export const deleteTask = (...args: Parameters<typeof demo.deleteTask>) => impl().deleteTask(...args);
export const listEventNotes = (...args: Parameters<typeof demo.listEventNotes>) => impl().listEventNotes(...args);
export const addEventNote = (...args: Parameters<typeof demo.addEventNote>) => impl().addEventNote(...args);
export const listMarketPartners = (...args: Parameters<typeof demo.listMarketPartners>) => impl().listMarketPartners(...args);
export const getPartnerFor = (...args: Parameters<typeof demo.getPartnerFor>) => impl().getPartnerFor(...args);
export const addMarketPartner = (...args: Parameters<typeof demo.addMarketPartner>) => impl().addMarketPartner(...args);
export const invitePartner = (...args: Parameters<typeof demo.invitePartner>) => impl().invitePartner(...args);
export const removeMarketPartner = (...args: Parameters<typeof demo.removeMarketPartner>) => impl().removeMarketPartner(...args);
export const emailTargets = (...args: Parameters<typeof demo.emailTargets>) => impl().emailTargets(...args);
