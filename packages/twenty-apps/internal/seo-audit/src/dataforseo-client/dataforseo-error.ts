export type DataForSeoErrorKind =
  | 'AUTHENTICATION'
  | 'PAYMENT'
  | 'ACCESS'
  | 'OTHER';

export class DataForSeoError extends Error {
  readonly kind: DataForSeoErrorKind;

  constructor(kind: DataForSeoErrorKind, message: string) {
    super(message);
    this.name = 'DataForSeoError';
    this.kind = kind;
  }
}
