import { ConfigProvider, Spin } from 'antd';
import { useState } from 'react';
import { AppShell, type TabKey } from './components/AppShell';
import { isFirebaseConfigured } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useUserCollection } from './hooks/useUserCollection';
import { AuthPage } from './pages/AuthPage';
import { AssetsPage } from './pages/AssetsPage';
import { CardsPage } from './pages/CardsPage';
import { DashboardPage } from './pages/DashboardPage';
import { PackagesPage } from './pages/PackagesPage';
import { PlansPage } from './pages/PlansPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AssetRecord, CardRecord, PackageRecord, PlanRecord, VisitRecord } from './types';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [valuesHidden, setValuesHidden] = useState(false);
  const [showDashboardDetails, setShowDashboardDetails] = useState(false);

  const assets = useUserCollection<AssetRecord>(user?.uid, 'assets');
  const cards = useUserCollection<CardRecord>(user?.uid, 'cards');
  const plans = useUserCollection<PlanRecord>(user?.uid, 'plans');
  const packages = useUserCollection<PackageRecord>(user?.uid, 'packages');
  const visits = useUserCollection<VisitRecord>(user?.uid, 'visits');

  if (loading) {
    return (
      <div className="loading-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1769e8',
          borderRadius: 10,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      {!user || !isFirebaseConfigured ? (
        <AuthPage />
      ) : (
        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          {showSettings ? (
            <SettingsPage
              email={user.email}
              assets={assets.items}
              cards={cards.items}
              plans={plans.items}
              packages={packages.items}
              visits={visits.items}
              replaceAssets={assets.replaceAll}
              replaceCards={cards.replaceAll}
              replacePlans={plans.replaceAll}
              replacePackages={packages.replaceAll}
              replaceVisits={visits.replaceAll}
              logout={logout}
              onBack={() => setShowSettings(false)}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardPage
              assets={assets.items}
              cards={cards.items}
              plans={plans.items}
              valuesHidden={valuesHidden}
              showDetails={showDashboardDetails}
              onToggleValues={() => setValuesHidden((value) => !value)}
              onToggleDetails={() => setShowDashboardDetails((value) => !value)}
              onOpenSettings={() => setShowSettings(true)}
            />
          ) : activeTab === 'assets' ? (
            <AssetsPage
              assets={assets.items}
              valuesHidden={valuesHidden}
              createAsset={assets.create}
              updateAsset={assets.update}
              deleteAsset={assets.remove}
            />
          ) : activeTab === 'cards' ? (
            <CardsPage
              cards={cards.items}
              valuesHidden={valuesHidden}
              createCard={cards.create}
              updateCard={cards.update}
              deleteCard={cards.remove}
            />
          ) : activeTab === 'plans' ? (
            <PlansPage
              plans={plans.items}
              valuesHidden={valuesHidden}
              createPlan={plans.create}
              updatePlan={plans.update}
              deletePlan={plans.remove}
            />
          ) : (
            <PackagesPage
              packages={packages.items}
              visits={visits.items}
              createPackage={packages.create}
              updatePackage={packages.update}
              deletePackage={packages.remove}
              createVisit={visits.create}
              updateVisit={visits.update}
              deleteVisit={visits.remove}
            />
          )}
        </AppShell>
      )}
    </ConfigProvider>
  );
}
