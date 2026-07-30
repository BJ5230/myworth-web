import { PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { MoneyText } from '../components/MoneyText';
import type { AssetRecord, SortDirection } from '../types';
import { toNumber } from '../utils/format';
import { toPascalWords } from '../utils/text';

interface AssetsPageProps {
  assets: AssetRecord[];
  valuesHidden: boolean;
  createAsset: (asset: Omit<AssetRecord, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<AssetRecord>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

interface AssetFormValues {
  name: string;
  category: string;
  amount: number;
}

const categories = ['Bank', 'Fixed Deposit', 'Company', 'Gold', 'ASNB', 'Stock', 'Ewallet', 'Cash', 'Other'];

export function AssetsPage({ assets, valuesHidden, createAsset, updateAsset, deleteAsset }: AssetsPageProps) {
  const [sort, setSort] = useState<SortDirection>('desc');
  const [editing, setEditing] = useState<AssetRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AssetFormValues>();

  const sorted = assets.slice().sort((a, b) => (sort === 'desc' ? b.amount - a.amount : a.amount - b.amount));

  function openForm(asset?: AssetRecord) {
    setEditing(asset ?? null);
    form.setFieldsValue(asset ?? { name: '', category: 'Bank', amount: 0 });
    setOpen(true);
  }

  async function submit(values: AssetFormValues) {
    const payload = {
      name: toPascalWords(values.name),
      category: values.category,
      amount: toNumber(values.amount),
    };
    if (editing) await updateAsset(editing.id, payload);
    else await createAsset(payload);
    setOpen(false);
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Assets</Typography.Title>
        <Space>
          <Button icon={<SortAscendingOutlined />} onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}>
            {sort === 'desc' ? 'High' : 'Low'}
          </Button>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => openForm()} />
        </Space>
      </header>

      {sorted.length === 0 ? (
        <EmptyState title="No Assets" description="Tap + to add your first asset." />
      ) : (
        sorted.map((asset) => (
          <Card className="record-card" key={asset.id} onClick={() => openForm(asset)}>
            <div className="split-row">
              <div>
                <strong>{asset.name}</strong>
                <p>{asset.category}</p>
              </div>
              <strong>
                <MoneyText value={asset.amount} hidden={valuesHidden} />
              </strong>
            </div>
          </Card>
        ))
      )}

      <Modal title={editing ? 'Edit Asset' : 'Add Asset'} open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Maybank Tabung" />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select options={categories.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="RM" style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editing && (
            <Button danger type="primary" block size="large" className="danger-button" onClick={() => deleteAsset(editing.id).then(() => setOpen(false))}>
              Delete Asset
            </Button>
          )}
        </Form>
      </Modal>
    </section>
  );
}
