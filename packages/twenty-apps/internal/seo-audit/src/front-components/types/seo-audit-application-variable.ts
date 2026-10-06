export type SeoAuditApplicationVariable = {
  key: string;
  value: string;
  label: string;
  description: string;
  isSecret: boolean;
  isDeprecated: boolean;
  type: string;
  options: { label: string; value: string }[] | null;
};
