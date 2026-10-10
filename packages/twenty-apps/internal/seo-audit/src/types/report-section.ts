export type ReportSection = {
  id: string;
  eyebrow: string;
  plain: string;
  accent: string;
  lead?: string;
  // Trusted HTML built by the report builders. Every value in it is escaped there.
  body: string;
  source?: string;
};
