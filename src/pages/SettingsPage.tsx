import { DownloadOutlined, LogoutOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Typography, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import type { AssetRecord, BackupPayload, CardRecord, PackageRecord, PlanRecord, VisitRecord } from '../types';

interface SettingsPageProps {
  email?: string | null;
  assets: AssetRecord[];
  cards: CardRecord[];
  plans: PlanRecord[];
  packages: PackageRecord[];
  visits: VisitRecord[];
  replaceAssets: (records: AssetRecord[]) => Promise<void>;
  replaceCards: (records: CardRecord[]) => Promise<void>;
  replacePlans: (records: PlanRecord[]) => Promise<void>;
  replacePackages: (records: PackageRecord[]) => Promise<void>;
  replaceVisits: (records: VisitRecord[]) => Promise<void>;
  logout: () => Promise<void>;
}

export function SettingsPage({
  email,
  assets,
  cards,
  plans,
  packages,
  visits,
  replaceAssets,
  replaceCards,
  replacePlans,
  replacePackages,
  replaceVisits,
  logout,
}: SettingsPageProps) {
  function exportJson() {
    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      assets,
      cards,
      plans,
      packages,
      visits,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myworth-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: RcFile) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as BackupPayload;
      if (payload.version !== 1) throw new Error('Unsupported backup version.');
      await Promise.all([
        replaceAssets(payload.assets ?? []),
        replaceCards(payload.cards ?? []),
        replacePlans(payload.plans ?? []),
        replacePackages(payload.packages ?? []),
        replaceVisits(payload.visits ?? []),
      ]);
      message.success('Backup imported.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unable to import backup.';
      message.error(detail);
    }
    return false;
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Settings</Typography.Title>
      </header>

      <Card className="record-card">
        <Typography.Text type="secondary">Signed in as</Typography.Text>
        <Typography.Title level={4}>{email}</Typography.Title>
      </Card>

      <Card className="record-card">
        <Typography.Title level={4}>Backup</Typography.Title>
        <Typography.Paragraph type="secondary">
          Export creates a JSON file with all latest fields. Import restores assets, cards, plans, packages, and visit history.
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block size="large" icon={<DownloadOutlined />} onClick={exportJson}>
            Export JSON
          </Button>
          <Upload accept="application/json" maxCount={1} beforeUpload={importJson} showUploadList={false}>
            <Button block size="large" icon={<UploadOutlined />}>
              Import JSON
            </Button>
          </Upload>
        </Space>
      </Card>

      <Alert
        type="info"
        showIcon
        message="Firebase cloud storage"
        description="Your app records are saved in Firestore under your own login account. If you reinstall or open on another device, login again to see the same data."
      />

      <Button danger type="primary" block size="large" icon={<LogoutOutlined />} className="danger-button" onClick={logout}>
        Logout
      </Button>
    </section>
  );
}
