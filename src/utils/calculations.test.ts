import { describe, expect, it } from 'vitest';
import { cardOutstanding, dashboardTotals, packageRemaining, recurringProgress } from './calculations';
import type { CardRecord, PackageRecord, VisitRecord } from '../types';

describe('MyWorth calculations', () => {
  it('includes the final installment month in card outstanding', () => {
    const card: CardRecord = {
      id: 'card-1',
      issuer: 'Maybank',
      title: 'Maybank',
      recurringItems: [
        {
          id: 'item-1',
          purpose: 'Balance Transfer',
          monthlyAmount: 150,
          totalInstallments: 12,
          startInstallment: 11,
          startMonth: '2026-06',
        },
      ],
    };

    expect(recurringProgress(card.recurringItems[0], '2026-07')).toBe(12);
    expect(cardOutstanding(card, '2026-07')).toBe(150);
    expect(cardOutstanding(card, '2026-08')).toBe(0);
  });

  it('calculates dashboard totals from assets, cards, and plans', () => {
    const totals = dashboardTotals(
      [{ id: 'asset-1', name: 'ASNB', category: 'Investment', amount: 1000 }],
      [
        {
          id: 'card-1',
          issuer: 'UOB',
          title: 'UOB',
          recurringItems: [
            {
              id: 'item-1',
              purpose: 'Phone',
              monthlyAmount: 200,
              totalInstallments: 6,
              startInstallment: 1,
              startMonth: '2026-07',
            },
          ],
        },
      ],
      [{ id: 'plan-1', name: 'Travel', category: 'Travel', budget: 300, spent: 50, status: 'Planning' }],
      '2026-07',
    );

    expect(totals.assetsTotal).toBe(1000);
    expect(totals.afterCards).toBe(800);
    expect(totals.afterPlans).toBe(550);
  });

  it('calculates package remaining from visit history', () => {
    const pkg: PackageRecord = {
      id: 'pkg-1',
      shopName: 'Beauty Shop',
      title: 'Aqua Facial',
      totalSessions: 15,
    };
    const visits: VisitRecord[] = [
      { id: 'visit-1', usages: [{ packageId: 'pkg-1', quantity: 2 }], packageIds: ['pkg-1'], shopName: 'Beauty Shop', packageTitles: ['Aqua Facial x2'], visitedAt: '2026-07-01' },
      { id: 'visit-2', usages: [{ packageId: 'pkg-1', quantity: 1 }], packageIds: ['pkg-1'], shopName: 'Beauty Shop', packageTitles: ['Aqua Facial'], visitedAt: '2026-07-08' },
    ];

    expect(packageRemaining(pkg, visits)).toBe(12);
  });
});
