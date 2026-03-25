export type ResultReleasedPayload = {
  termId: string;
  recipients: string[];
  subject?: string;
  message: string;
};

export type LowPerformanceAlertPayload = {
  termId: string;
  recipients: string[];
  thresholdAverage: number;
};
