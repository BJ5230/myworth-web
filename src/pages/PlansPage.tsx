import { PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { MoneyText } from '../components/MoneyText';
import type { PlanRecord, SortDirection } from '../types';
import { toNumber } from '../utils/format';
import { toPascalWords } from '../utils/text';

interface PlansPageProps {
  plans: PlanRecord[];
  valuesHidden: boolean;
  createPlan: (plan: Omit<PlanRecord, 'id'>) => Promise<void>;
  updatePlan: (id: string, plan: Partial<PlanRecord>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

interface PlanFormValues {
  name: string;
  category: string;
  budget: number;
  spent?: number;
  status: 'Planning' | 'Active' | 'Done' | 'Paused';
  targetDate?: dayjs.Dayjs;
  notes?: string;
}

export function PlansPage({ plans, valuesHidden, createPlan, updatePlan, deletePlan }: PlansPageProps) {
  const [sort, setSort] = useState<'amount' | 'name'>('amount');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [editing, setEditing] = useState<PlanRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<PlanFormValues>();

    const sorted = plans.slice().sort((a, b) => {
    if (sort === 'name') return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    const aRemaining = Math.max(a.budget - (a.spent ?? 0), 0);
    const bRemaining = Math.max(b.budget - (b.spent ?? 0), 0);
    return direction === 'asc' ? aRemaining - bRemaining : bRemaining - aRemaining;
  });

  function openForm(plan?: PlanRecord) {
    setEditing(plan ?? null);
    form.setFieldsValue(
      plan
        ? { ...plan, targetDate: plan.targetDate ? dayjs(plan.targetDate) : undefined }
        : { name: '', category: 'House', budget: 0, spent: 0, status: 'Planning', notes: '' },
    );
    setOpen(true);
  }

  async function submit(values: PlanFormValues) {
    const payload = {
      name: toPascalWords(values.name),
      category: toPascalWords(values.category),
      budget: toNumber(values.budget),
      spent: toNumber(values.spent),
      status: values.status,
      targetDate: values.targetDate?.format('YYYY-MM-DD'),
      notes: values.notes,
    };
    if (editing) await updatePlan(editing.id, payload);
    else await createPlan(payload);
    setOpen(false);
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Plans</Typography.Title>
        <Space>
          <Button icon={<SortAscendingOutlined />} onClick={() => setDirection(direction === 'desc' ? 'asc' : 'desc')}>
            {direction === 'desc' ? 'High' : 'Low'}
          </Button>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => openForm()} />
        </Space>
      </header>
      <Select
        className="full-control"
        value={sort}
        options={[
          { value: 'amount', label: 'Sort by amount' },
          { value: 'name', label: 'Sort by name' },
        ]}
        onChange={setSort}
      />

      {sorted.length === 0 ? (
        <EmptyState title="No Future Plans" description="Tap + to add renovation, travel, or other future expenses." />
      ) : (
        sorted.map((plan) => (
          <Card className="record-card" key={plan.id} onClick={() => openForm(plan)}>
            <div className="split-row">
              <div>
                <strong>{plan.name}</strong>
                <p>
                  {plan.category} · {plan.status ?? 'Planning'}
                  {plan.targetDate ? ` · ${plan.targetDate}` : ''}
                </p>
                <small>Spent <MoneyText value={plan.spent ?? 0} hidden={valuesHidden} /></small>
              </div>
              <strong>
                <MoneyText value={Math.max(plan.budget - (plan.spent ?? 0), 0)} hidden={valuesHidden} />
              </strong>
            </div>
          </Card>
        ))
      )}

      <Modal title={editing ? 'Edit Plan' : 'Add Plan'} open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Renovation" />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Input placeholder="House" />
          </Form.Item>
          <Form.Item label="Budget" name="budget" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="RM" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Spent" name="spent">
            <InputNumber min={0} precision={2} prefix="RM" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={['Planning', 'Active', 'Done', 'Paused'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item label="Target Date" name="targetDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea placeholder="Optional" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editing && (
            <Button danger type="primary" block size="large" className="danger-button" onClick={() => deletePlan(editing.id).then(() => setOpen(false))}>
              Delete Plan
            </Button>
          )}
        </Form>
      </Modal>
    </section>
  );
}
