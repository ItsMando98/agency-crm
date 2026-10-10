export type AssetRecord = {
  id: string;
  type: 'IMAGE' | 'VOICE' | 'VIDEO';
  prompt: string | null;
  script: string | null;
  durationSeconds: number | null;
  creatorId: string | null;
};
