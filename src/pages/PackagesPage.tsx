import { PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Segmented, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import type { PackageRecord, VisitRecord } from '../types';
import { groupByShop, packageRemaining } from '../utils/calculations';
import { toPascalWords } from '../utils/text';
import { toNumber } from '../utils/format';

interface PackagesPageProps {
  packages: PackageRecord[];
  visits: VisitRecord[];
  createPackage: (pkg: Omit<PackageRecord, 'id'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<PackageRecord>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  createVisit: (visit: Omit<VisitRecord, 'id'>) => Promise<void>;
  updateVisit: (id: string, visit: Partial<VisitRecord>) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
}

interface PackageFormValues {
  shopName: string;
  category: 'Beauty' | 'Gym' | 'Medical' | 'Car Wash' | 'Other';
  title: string;
  totalSessions: number;
  notes?: string;
}

interface VisitFormValues {
  packageIds: string[];
  visitedAt: dayjs.Dayjs;
  staff?: string;
  note?: string;
}

export function PackagesPage({
  packages,
  visits,
  createPackage,
  updatePackage,
  deletePackage,
  createVisit,
  updateVisit,
  deleteVisit,
}: PackagesPageProps) {
  const [tab, setTab] = useState<'packages' | 'visits'>('packages');
  const [editingPackage, setEditingPackage] = useState<PackageRecord | null>(null);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [packageForm] = Form.useForm<PackageFormValues>();
  const [visitForm] = Form.useForm<VisitFormValues>();

  const packageGroups = groupByShop(packages);
  const visitGroups = groupByShop(visits);

  function openPackageForm(pkg?: PackageRecord) {
    setEditingPackage(pkg ?? ({ id: '', shopName: '', category: 'Beauty', title: '', totalSessions: 1, notes: '' } as PackageRecord));
    packageForm.setFieldsValue(pkg ?? { shopName: 'Beauty Shop', category: 'Beauty', title: '', totalSessions: 1, notes: '' });
  }

  async function submitPackage(values: PackageFormValues) {
    const payload = {
      shopName: toPascalWords(values.shopName),
      category: values.category,
      title: toPascalWords(values.title),
      totalSessions: toNumber(values.totalSessions),
      notes: values.notes,
    };
    if (editingPackage?.id) await updatePackage(editingPackage.id, payload);
    else await createPackage(payload);
    setEditingPackage(null);
  }

  function openVisitForm(visit?: VisitRecord) {
    setEditingVisit(visit ?? ({ id: '', packageIds: [], shopName: '', packageTitles: [], visitedAt: dayjs().format('YYYY-MM-DDTHH:mm'), staff: '', note: '' } as VisitRecord));
    visitForm.setFieldsValue(
      visit
        ? { packageIds: visit.packageIds ?? [], visitedAt: dayjs(visit.visitedAt), staff: visit.staff, note: visit.note }
        : { packageIds: [], visitedAt: dayjs(), staff: '', note: '' },
    );
  }

  async function submitVisit(values: VisitFormValues) {
    const selected = packages.filter((pkg) => values.packageIds.includes(pkg.id));
    const shopNames = Array.from(new Set(selected.map((pkg) => pkg.shopName))).sort();
    const payload = {
      packageIds: selected.map((pkg) => pkg.id),
      shopName: shopNames.length > 0 ? shopNames.join(' & ') : 'Unknown Shop',
      packageTitles: selected.map((pkg) => pkg.title).sort(),
      visitedAt: values.visitedAt.toISOString(),
      staff: values.staff,
      note: values.note,
    };
    if (editingVisit?.id) await updateVisit(editingVisit.id, payload);
    else await createVisit(payload);
    setEditingVisit(null);
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Packages</Typography.Title>
        <Space>
          <Button icon={<SortAscendingOutlined />}>Shop</Button>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => (tab === 'packages' ? openPackageForm() : openVisitForm())} />
        </Space>
      </header>
      <Segmented
        block
        className="section-tabs"
        value={tab}
        options={[
          { value: 'packages', label: 'Packages' },
          { value: 'visits', label: 'Visit History' },
        ]}
        onChange={(value) => setTab(value as 'packages' | 'visits')}
      />

      {tab === 'packages' &&
        (packages.length === 0 ? (
          <EmptyState title="No Packages" description="Tap + to add your first beauty or wellness package." />
        ) : (
          Object.entries(packageGroups).map(([shop, records]) => (
            <div key={shop} className="shop-group">
              <div className="shop-banner">{shop}</div>
              {records.map((pkg) => (
                <Card className="record-card gradient-record" key={pkg.id} onClick={() => openPackageForm(pkg)}>
                  <div className="split-row">
                    <div>
                      <strong>{pkg.title}</strong>
                      <p>
                        {pkg.shopName} · {pkg.category ?? 'Beauty'}
                      </p>
                      <small>{packageRemaining(pkg, visits)} of {pkg.totalSessions} remaining</small>
                    </div>
                    <strong>
                      {packageRemaining(pkg, visits)}/{pkg.totalSessions}
                    </strong>
                  </div>
                </Card>
              ))}
            </div>
          ))
        ))}

      {tab === 'visits' &&
        (visits.length === 0 ? (
          <EmptyState title="No Visit History" description="Tap + whenever you visit your beauty shop." />
        ) : (
          Object.entries(visitGroups).map(([shop, records]) => (
            <div key={shop} className="shop-group">
              <div className="shop-banner">{shop}</div>
              {records
                .slice()
                .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
                .map((visit) => (
                  <Card className="record-card" key={visit.id} onClick={() => openVisitForm(visit)}>
                    <div>
                      <strong>{(visit.packageTitles ?? []).join(', ') || 'Visit'}</strong>
                      <p>{new Date(visit.visitedAt).toLocaleString('en-MY')}</p>
                      {visit.staff && <small>Staff: {visit.staff}</small>}
                      {visit.note && <small>{visit.note}</small>}
                    </div>
                  </Card>
                ))}
            </div>
          ))
        ))}

      <Modal title={editingPackage?.id ? 'Edit Package' : 'Add Package'} open={!!editingPackage} onCancel={() => setEditingPackage(null)} footer={null} destroyOnClose>
        <Form form={packageForm} layout="vertical" onFinish={submitPackage}>
          <Form.Item label="Shop Name" name="shopName" rules={[{ required: true }]}>
            <Input placeholder="Beauty Shop" />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select options={['Beauty', 'Gym', 'Medical', 'Car Wash', 'Other'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item label="Package Name" name="title" rules={[{ required: true }]}>
            <Input placeholder="Aqua Facial" />
          </Form.Item>
          <Form.Item label="Total Sessions" name="totalSessions" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea placeholder="Optional" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editingPackage?.id && (
            <Button danger type="primary" block size="large" className="danger-button" onClick={() => deletePackage(editingPackage.id).then(() => setEditingPackage(null))}>
              Delete Package
            </Button>
          )}
        </Form>
      </Modal>

      <Modal title={editingVisit?.id ? 'Edit Visit' : 'Add Visit'} open={!!editingVisit} onCancel={() => setEditingVisit(null)} footer={null} destroyOnClose>
        <Form form={visitForm} layout="vertical" onFinish={submitVisit}>
          <Form.Item label="Treatments" name="packageIds" rules={[{ required: true, type: 'array', min: 1 }]}>
            <Select
              mode="multiple"
              placeholder="Select package treatments"
              options={packages.map((pkg) => ({
                value: pkg.id,
                label: `${pkg.shopName} · ${pkg.title} (${packageRemaining(pkg, visits)} left)`,
                disabled: packageRemaining(pkg, visits) === 0 && !(editingVisit?.packageIds ?? []).includes(pkg.id),
              }))}
            />
          </Form.Item>
          <Form.Item label="Visit Date & Time" name="visitedAt" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Staff Member" name="staff">
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea placeholder="Optional" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editingVisit?.id && (
            <Button danger type="primary" block size="large" className="danger-button" onClick={() => deleteVisit(editingVisit.id).then(() => setEditingVisit(null))}>
              Delete Visit
            </Button>
          )}
        </Form>
      </Modal>
    </section>
  );
}
