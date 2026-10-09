import { type DataForSeoErrorKind } from 'src/dataforseo-client/dataforseo-error';

type DescribeDataForSeoFailureParams = {
  kind: DataForSeoErrorKind;
  code: number | undefined;
  message: string | null | undefined;
};

const BALANCE_USED_UP_CODE = 40200;
const UNINFORMATIVE_MESSAGE_PATTERN = /^\s*ok\.?\s*$/i;

// DataForSEO sometimes answers a failure with the message "Ok.", and a used up
// balance with nothing more than "Payment Required.". Say what it means.
export const describeDataForSeoFailure = ({
  kind,
  code,
  message,
}: DescribeDataForSeoFailureParams): string => {
  // Other 402xx codes, such as 40204 for a missing subscription, keep their own message.
  if (kind === 'PAYMENT' && (code === BALANCE_USED_UP_CODE || code === 402)) {
    return `The DataForSEO balance is used up (Payment Required, code ${BALANCE_USED_UP_CODE}). Top up the account.`;
  }

  const hasUsefulMessage =
    typeof message === 'string' &&
    message.trim() !== '' &&
    !UNINFORMATIVE_MESSAGE_PATTERN.test(message);

  if (hasUsefulMessage) {
    return message;
  }

  return code === undefined
    ? 'DataForSEO returned no task for this request. The account balance may be used up.'
    : `DataForSEO error code ${code}`;
};
