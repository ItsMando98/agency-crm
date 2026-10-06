export type BacklinkSummary = {
  backlinks: number;
  referringDomains: number;
  brokenBacklinks: number | null;
  brokenPages: number | null;
  rank: number | null;
};
