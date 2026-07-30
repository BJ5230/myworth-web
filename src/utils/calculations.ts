import type { AssetRecord, CardRecord, PackageRecord, PlanRecord, RecurringItem, VisitRecord } from '../types';
import { todayMonthKey } from './format';

export function monthsBetween(startMonth: string, currentMonth = todayMonthKey()): number {
  const [startYear, start] = startMonth.split('-').map(Number);
  const [currentYear, current] = currentMonth.split('-').map(Number);
  if (!startYear || !start || !currentYear || !current) return 0;
  return (currentYear - startYear) * 12 + (current - start);
}

function recurringRawProgress(item: RecurringItem, currentMonth = todayMonthKey()): number {
  return item.startInstallment + monthsBetween(item.startMonth, currentMonth);
}

export function recurringProgress(item: RecurringItem, currentMonth = todayMonthKey()): number {
  const progress = recurringRawProgress(item, currentMonth);
  return Math.min(Math.max(progress, 1), item.totalInstallments);
}

export function recurringLeft(item: RecurringItem, currentMonth = todayMonthKey()): number {
  return Math.max(item.totalInstallments - recurringProgress(item, currentMonth), 0);
}

export function isRecurringActive(item: RecurringItem, currentMonth = todayMonthKey()): boolean {
  if (item.isPaused) return false;
  if (item.isOngoing) return true;
  const rawProgress = recurringRawProgress(item, currentMonth);
  return item.totalInstallments > 0 && rawProgress >= 1 && rawProgress <= item.totalInstallments;
}

export function cardOutstanding(card: CardRecord, currentMonth = todayMonthKey()): number {
  return card.recurringItems
    .filter((item) => isRecurringActive(item, currentMonth))
    .reduce((total, item) => total + item.monthlyAmount, 0);
}

export function totalCardOutstanding(cards: CardRecord[], currentMonth = todayMonthKey()): number {
  return cards.reduce((total, card) => total + cardOutstanding(card, currentMonth), 0);
}

export function totalAssets(assets: AssetRecord[]): number {
  return assets.reduce((total, asset) => total + asset.amount, 0);
}

export function totalPlans(plans: PlanRecord[]): number {
  return plans
    .filter((plan) => plan.status === undefined || plan.status === 'Planning' || plan.status === 'Active')
    .reduce((total, plan) => total + Math.max(plan.budget - (plan.spent ?? 0), 0), 0);
}

export function dashboardTotals(
  assets: AssetRecord[],
  cards: CardRecord[],
  plans: PlanRecord[],
  currentMonth = todayMonthKey(),
) {
  const assetsTotal = totalAssets(assets);
  const cardsTotal = totalCardOutstanding(cards, currentMonth);
  const plansTotal = totalPlans(plans);

  return {
    assetsTotal,
    cardsTotal,
    plansTotal,
    afterCards: assetsTotal - cardsTotal,
    afterPlans: assetsTotal - cardsTotal - plansTotal,
  };
}

export function usedPackageSessions(packageId: string, visits: VisitRecord[]): number {
  return visits.reduce((total, visit) => {
    if (visit.usages) {
      return total + visit.usages.filter((usage) => usage.packageId === packageId).reduce((sum, usage) => sum + usage.quantity, 0);
    }
    return total + (visit.packageIds?.filter((id) => id === packageId).length ?? 0);
  }, 0);
}

export function packageRemaining(pkg: PackageRecord, visits: VisitRecord[]): number {
  return Math.max(pkg.totalSessions - usedPackageSessions(pkg.id, visits), 0);
}

export function groupByShop<T extends { shopName: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const shop = item.shopName || 'Unknown Shop';
    groups[shop] = [...(groups[shop] ?? []), item];
    return groups;
  }, {});
}
