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
}

export interface RecurringItem {
  id: string;
  purpose: string;
  monthlyAmount: number;
  totalInstallments: number;
  startInstallment: number;
  startMonth: string;
}

export interface CardRecord extends BaseRecord {
  issuer: CardIssuer;
  title: string;
  recurringItems: RecurringItem[];
}

export interface PlanRecord extends BaseRecord {
  name: string;
  category: string;
  amount: number;
  targetDate?: string;
}

export interface PackageRecord extends BaseRecord {
  shopName: string;
  title: string;
  totalSessions: number;
}

export interface VisitRecord extends BaseRecord {
  packageId: string;
  shopName: string;
  packageTitle: string;
  visitedAt: string;
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
