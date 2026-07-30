import {
  BankOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { Layout, Segmented } from 'antd';
import type { ReactNode } from 'react';

export type TabKey = 'dashboard' | 'assets' | 'cards' | 'plans' | 'packages';

interface AppShellProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
}

const tabs = [
  { value: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { value: 'assets', label: 'Assets', icon: <BankOutlined /> },
  { value: 'cards', label: 'Cards', icon: <CreditCardOutlined /> },
  { value: 'plans', label: 'Plans', icon: <CalendarOutlined /> },
  { value: 'packages', label: 'Packages', icon: <GiftOutlined /> },
];

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <Layout className="app-shell">
      <main className="app-content">{children}</main>
      <nav className="bottom-nav">
        <Segmented
          block
          value={activeTab}
          options={tabs.map((tab) => ({
            value: tab.value,
            label: (
              <span className="tab-label">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            ),
          }))}
          onChange={(value) => onTabChange(value as TabKey)}
        />
      </nav>
    </Layout>
  );
}
