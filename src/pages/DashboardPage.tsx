import { DownOutlined, EyeInvisibleOutlined, EyeOutlined, SettingOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography } from 'antd';
import type { AssetRecord, CardRecord, PlanRecord } from '../types';
import { MoneyText } from '../components/MoneyText';
import { cardOutstanding, dashboardTotals } from '../utils/calculations';

interface DashboardPageProps {
  assets: AssetRecord[];
  cards: CardRecord[];
  plans: PlanRecord[];
  valuesHidden: boolean;
  showDetails: boolean;
  onToggleValues: () => void;
  onToggleDetails: () => void;
  onOpenSettings: () => void;
}

export function DashboardPage({
  assets,
  cards,
  plans,
  valuesHidden,
  showDetails,
  onToggleValues,
  onToggleDetails,
  onOpenSettings,
}: DashboardPageProps) {
  const totals = dashboardTotals(assets, cards, plans);
  const cardRows = cards
    .map((card) => ({ label: card.issuer, amount: cardOutstanding(card) }))
    .filter((row) => row.amount > 0);
  const planRows = plans
    .filter((plan) => plan.status === undefined || plan.status === 'Planning' || plan.status === 'Active')
    .map((plan) => ({ ...plan, remaining: Math.max(plan.budget - (plan.spent ?? 0), 0) }))
    .filter((plan) => plan.remaining > 0);

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>MyWorth</Typography.Title>
        <Space>
          <Button shape="circle" icon={valuesHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={onToggleValues} />
          <Button shape="circle" icon={showDetails ? <UpOutlined /> : <DownOutlined />} onClick={onToggleDetails} />
          <Button shape="circle" icon={<SettingOutlined />} onClick={onOpenSettings} />
        </Space>
      </header>

      <Card className="gradient-card hero-card">
        <span>Total Assets</span>
        <strong>
          <MoneyText value={totals.assetsTotal} hidden={valuesHidden} />
        </strong>
      </Card>

      {showDetails && (
        <>
          <Card className="gradient-card hero-card">
            <span>After Total Outstanding</span>
            <strong>
              <MoneyText value={totals.afterCards} hidden={valuesHidden} />
            </strong>
          </Card>
          <Card className="gradient-card hero-card">
            <span>After Future Plans</span>
            <strong>
              <MoneyText value={totals.afterPlans} hidden={valuesHidden} />
            </strong>
          </Card>
          {cardRows.length > 0 && (
            <Card className="gradient-card mini-list-card" title="Credit Cards">
              {cardRows.map((row) => (
                <div className="split-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>
                    <MoneyText value={row.amount} hidden={valuesHidden} />
                  </strong>
                </div>
              ))}
            </Card>
          )}
          {planRows.length > 0 && (
            <Card className="gradient-card mini-list-card" title="Future Plans">
              {planRows.map((plan) => (
                <div className="split-row" key={plan.id}>
                  <span>{plan.name}</span>
                  <strong>
                    <MoneyText value={plan.remaining} hidden={valuesHidden} />
                  </strong>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </section>
  );
}
