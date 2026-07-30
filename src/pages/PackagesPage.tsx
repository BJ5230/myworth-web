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
  usageQuantities: Record<string, number>;
  visitDate: dayjs.Dayjs;
  visitTime: string;
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
  const [packageSort, setPackageSort] = useState<'shop' | 'remaining' | 'total'>('shop');
  const [editingPackage, setEditingPackage] = useState<PackageRecord | null>(null);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [packageForm] = Form.useForm<PackageFormValues>();
  const [visitForm] = Form.useForm<VisitFormValues>();

  const sortedPackages = packages.slice().sort((a, b) => {
    if (packageSort === 'remaining') return packageRemaining(b, visits) - packageRemaining(a, visits) || a.title.localeCompare(b.title);
    if (packageSort === 'total') return b.totalSessions - a.totalSessions || a.title.localeCompare(b.title);
    return a.shopName.localeCompare(b.shopName) || a.title.localeCompare(b.title);
  });
  const packageGroups = groupByShop(sortedPackages);
  const visitGroups = groupByShop(
    visits.slice().sort((a, b) => a.shopName.localeCompare(b.shopName) || b.visitedAt.localeCompare(a.visitedAt)),
  );

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
    const now = dayjs();
    const usageQuantities =
      visit?.usages?.reduce<Record<string, number>>((values, usage) => {
        values[usage.packageId] = usage.quantity;
        return values;
      }, {}) ??
      visit?.packageIds?.reduce<Record<string, number>>((values, id) => {
        values[id] = (values[id] ?? 0) + 1;
        return values;
      }, {}) ??
      {};
    const visitedAt = visit ? dayjs(visit.visitedAt) : now;
    setEditingVisit(visit ?? ({ id: '', usages: [], packageIds: [], shopName: '', packageTitles: [], visitedAt: now.toISOString(), staff: '', note: '' } as VisitRecord));
    visitForm.resetFields();
    visitForm.setFieldsValue({
      usageQuantities,
      visitDate: visitedAt,
      visitTime: visitedAt.format('HH:mm'),
      staff: visit?.staff ?? '',
      note: visit?.note ?? '',
    });
  }

  async function submitVisit(values: VisitFormValues) {
    const usageQuantities = values.usageQuantities ?? {};
    const usages = Object.entries(usageQuantities)
      .map(([packageId, quantity]) => ({ packageId, quantity: Math.max(0, toNumber(quantity)) }))
      .filter((usage) => usage.quantity > 0);
    const selected = packages.filter((pkg) => usages.some((usage) => usage.packageId === pkg.id));
    const shopNames = Array.from(new Set(selected.map((pkg) => pkg.shopName))).sort();
    const [hour, minute] = (values.visitTime || '00:00').split(':').map(Number);
    const selectedAt = values.visitDate
      .hour(Number.isFinite(hour) ? hour : 0)
      .minute(Number.isFinite(minute) ? minute : 0)
      .second(0)
      .millisecond(0);
    const payload = {
      usages,
      packageIds: selected.map((pkg) => pkg.id),
      shopName: shopNames.length > 0 ? shopNames.join(' & ') : 'Unknown Shop',
      packageTitles: selected
        .map((pkg) => {
          const quantity = usages.find((usage) => usage.packageId === pkg.id)?.quantity ?? 1;
          return quantity > 1 ? `${pkg.title} x${quantity}` : pkg.title;
        })
        .sort(),
      visitedAt: selectedAt.toISOString(),
      staff: values.staff,
      note: values.note,
    };
    if (editingVisit?.id) await updateVisit(editingVisit.id, payload);
    else await createVisit(payload);
    visitForm.resetFields();
    setEditingVisit(null);
  }

  function closeVisitForm() {
    visitForm.resetFields();
    setEditingVisit(null);
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Packages</Typography.Title>
        <Space>
          {tab === 'packages' && (
            <Select
              value={packageSort}
              suffixIcon={<SortAscendingOutlined />}
              style={{ width: 132 }}
              options={[
                { value: 'shop', label: 'Shop' },
                { value: 'remaining', label: 'Remaining' },
                { value: 'total', label: 'Total' },
              ]}
              onChange={setPackageSort}
            />
          )}
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

      <Modal title={editingVisit?.id ? 'Edit Visit' : 'Add Visit'} open={!!editingVisit} onCancel={closeVisitForm} footer={null} destroyOnClose>
        <Form form={visitForm} layout="vertical" onFinish={submitVisit}>
          <Typography.Title level={5}>Treatments</Typography.Title>
          {packages.map((pkg) => {
            const existingQuantity = editingVisit?.usages?.find((usage) => usage.packageId === pkg.id)?.quantity ?? 0;
            const maxQuantity = packageRemaining(pkg, visits) + existingQuantity;
            return (
              <Form.Item
                key={pkg.id}
                label={`${pkg.shopName} · ${pkg.title} (${maxQuantity} left)`}
                name={['usageQuantities', pkg.id]}
              >
                <InputNumber min={0} max={maxQuantity} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            );
          })}
          <div className="two-column-fields">
            <Form.Item label="Visit Date" name="visitDate" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Visit Time"
              name="visitTime"
              rules={[
                { required: true },
                { pattern: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Use 24-hour time, eg 14:30' },
              ]}
            >
              <Input placeholder="14:30" inputMode="numeric" />
            </Form.Item>
          </div>
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
