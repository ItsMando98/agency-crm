import { type CONNECTION_SERVICES } from 'src/constants/connection-services.const';

export type ConnectionService = (typeof CONNECTION_SERVICES)[number];

export type ConnectionTestResult = {
  status: 'OK' | 'NOT_CONFIGURED' | 'FAILED';
  message: string;
};
