export interface CheckInRecord {
  id: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string for check-out time
  duration: number; // Duration in seconds
  status: 'checked-in' | 'checked-out';
}

