export type SortDirection = 'asc' | 'desc';
export type CardIssuer = 'Maybank' | 'UOB';

export interface BaseRecord {
  id: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AssetRecord extends BaseRecord {
  name: string;
  category: string;
  amount: number;
  ownership?: 'Personal' | 'Company';
  notes?: string;
  bankName?: string;
  accountType?: 'Savings' | 'Current' | 'Fixed Deposit';
  goldWeight?: number;
  goldPurity?: '999' | '916' | '750' | 'Custom';
  goldPurchasePrice?: number;
  goldPurchaseDate?: string;
}

export interface RecurringItem {
  id: string;
  purpose: string;
  monthlyAmount: number;
  totalInstallments: number;
  startInstallment: number;
  startMonth: string;
  notes?: string;
  isOngoing?: boolean;
  isPaused?: boolean;
}

export interface CardRecord extends BaseRecord {
  issuer: CardIssuer;
  title: string;
  recurringItems: RecurringItem[];
}

export interface PlanRecord extends BaseRecord {
  name: string;
  category: string;
  budget: number;
  spent?: number;
  status?: 'Planning' | 'Active' | 'Done' | 'Paused';
  targetDate?: string;
  notes?: string;
}

export interface PackageRecord extends BaseRecord {
  shopName: string;
  category?: 'Beauty' | 'Gym' | 'Medical' | 'Car Wash' | 'Other';
  title: string;
  totalSessions: number;
  notes?: string;
}

export interface VisitRecord extends BaseRecord {
  packageIds: string[];
  shopName: string;
  packageTitles: string[];
  visitedAt: string;
  staff?: string;
  note?: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  assets: AssetRecord[];
  cards: CardRecord[];
  plans: PlanRecord[];
  packages: PackageRecord[];
  visits: VisitRecord[];
}
