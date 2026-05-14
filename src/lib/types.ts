import { Timestamp } from 'firebase/firestore';

export interface CarbonActivity {
  id: string;
  userId: string;
  activityName: string;
  category: string;
  details: Record<string, any>;
  rawInput: string;
  activityDate: Timestamp | Date;
  createdAt: Timestamp;
  status: 'Pending' | 'Committed';
  txHash?: string;
  co2e: number;
}
