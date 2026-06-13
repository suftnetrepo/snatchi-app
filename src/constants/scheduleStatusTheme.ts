export type ScheduleStatusThemeEntry = {
  bg: string;
  text: string;
  border: string;
  icon: string;
};

export const SCHEDULE_STATUS_THEME: Record<string, ScheduleStatusThemeEntry> = {
  Pending: {
    bg: '#EEF2FF',
    text: '#4F46E5',
    border: '#C7D2FE',
    icon: 'schedule',
  },
  Accepted: {
    bg: '#ECFDF5',
    text: '#059669',
    border: '#A7F3D0',
    icon: 'check-circle',
  },
  Approved: {
    bg: '#EFF6FF',
    text: '#2563EB',
    border: '#BFDBFE',
    icon: 'verified',
  },
  AwaitingPayment: {
    bg: '#FFF7ED',
    text: '#EA580C',
    border: '#FED7AA',
    icon: 'payments',
  },
  ReadyToStart: {
    bg: '#ECFDF5',
    text: '#16A34A',
    border: '#BBF7D0',
    icon: 'play-circle-filled',
  },
  InProgress: {
    bg: '#FEFCE8',
    text: '#CA8A04',
    border: '#FDE68A',
    icon: 'autorenew',
  },
  Completed: {
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
    icon: 'task-alt',
  },
  Cancelled: {
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FECACA',
    icon: 'cancel',
  },
  PaymentFailed: {
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FCA5A5',
    icon: 'error',
  },
  Declined: {
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FECACA',
    icon: 'thumb-down',
  },
  Paid: {
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
    icon: 'payments',
  },
  Unknown: {
    bg: '#F3F4F6',
    text: '#4B5563',
    border: '#D1D5DB',
    icon: 'help-outline',
  },
};

const STATUS_ALIASES: Record<string, string> = {
  progress: 'InProgress',
  'in progress': 'InProgress',
  inprogress: 'InProgress',
  ready: 'ReadyToStart',
  readytostart: 'ReadyToStart',
  canceled: 'Cancelled',
  cancelled: 'Cancelled',
  awaitingpayment: 'AwaitingPayment',
  paymentfailed: 'PaymentFailed',
};

export const normalizeScheduleStatus = (status?: string | null) => {
  if (!status) {
    return 'Unknown';
  }

  const trimmed = String(status).trim();
  if (!trimmed) {
    return 'Unknown';
  }

  const collapsed = trimmed.replace(/[\s_-]+/g, '').toLowerCase();
  const direct = SCHEDULE_STATUS_THEME[trimmed]
    ? trimmed
    : STATUS_ALIASES[trimmed.toLowerCase()] || STATUS_ALIASES[collapsed];

  return direct || trimmed;
};

export const getScheduleStatusTheme = (status?: string | null) => {
  const normalizedStatus = normalizeScheduleStatus(status);
  return SCHEDULE_STATUS_THEME[normalizedStatus] || SCHEDULE_STATUS_THEME.Unknown;
};

export const getScheduleStatusLabel = (status?: string | null) => {
  const normalizedStatus = normalizeScheduleStatus(status);
  if (normalizedStatus === 'ReadyToStart') {
    return 'Ready to Start';
  }
  if (normalizedStatus === 'InProgress') {
    return 'In Progress';
  }
  if (normalizedStatus === 'AwaitingPayment') {
    return 'Awaiting Payment';
  }
  if (normalizedStatus === 'PaymentFailed') {
    return 'Payment Failed';
  }
  return normalizedStatus.replace(/([a-z])([A-Z])/g, '$1 $2');
};

export const getScheduleTimelineColors = (status?: string | null) => {
  const statusTheme = getScheduleStatusTheme(status);
  return {
    dot: statusTheme.text,
    line: statusTheme.border,
    dotBorder: '#FFFFFF',
  };
};

