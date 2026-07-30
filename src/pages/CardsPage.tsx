import { PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { MoneyText } from '../components/MoneyText';
import type { CardIssuer, CardRecord, RecurringItem } from '../types';
import { cardOutstanding, recurringLeft, recurringProgress } from '../utils/calculations';
import { monthEndLabel, todayMonthKey, toNumber } from '../utils/format';
import { makeId, toPascalWords } from '../utils/text';

interface CardsPageProps {
  cards: CardRecord[];
  valuesHidden: boolean;
  createCard: (card: Omit<CardRecord, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<CardRecord>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

interface CardFormValues {
  issuer: CardIssuer;
  title: string;
}

interface ItemFormValues {
  purpose: string;
  monthlyAmount: number;
  totalInstallments: number;
  startInstallment: number;
}

const issuers: CardIssuer[] = ['Maybank', 'UOB'];

export function CardsPage({ cards, valuesHidden, createCard, updateCard, deleteCard }: CardsPageProps) {
  const [issuer, setIssuer] = useState<CardIssuer>('Maybank');
  const [sort, setSort] = useState<'amount' | 'left'>('amount');
  const [editingCard, setEditingCard] = useState<CardRecord | null>(null);
  const [editingItem, setEditingItem] = useState<{ card: CardRecord; item?: RecurringItem } | null>(null);
  const [cardForm] = Form.useForm<CardFormValues>();
  const [itemForm] = Form.useForm<ItemFormValues>();

  const visibleCards = cards
    .filter((card) => card.issuer === issuer)
    .sort((a, b) => cardOutstanding(b) - cardOutstanding(a));
  const total = visibleCards.reduce((sum, card) => sum + cardOutstanding(card), 0);

  function openCardForm(card?: CardRecord) {
    setEditingCard(card ?? ({ id: '', issuer, title: issuer, recurringItems: [] } as CardRecord));
    cardForm.setFieldsValue(card ?? { issuer, title: issuer });
  }

  async function submitCard(values: CardFormValues) {
    const payload = {
      issuer: values.issuer,
      title: toPascalWords(values.title || values.issuer),
      recurringItems: editingCard?.recurringItems ?? [],
    };
    if (editingCard?.id) await updateCard(editingCard.id, payload);
    else await createCard(payload);
    setEditingCard(null);
  }

  function openItemForm(card: CardRecord, item?: RecurringItem) {
    setEditingItem({ card, item });
    itemForm.setFieldsValue(
      item ?? {
        purpose: '',
        monthlyAmount: 0,
        totalInstallments: 12,
        startInstallment: 1,
      },
    );
  }

  async function submitItem(values: ItemFormValues) {
    if (!editingItem) return;
    const nextItem: RecurringItem = {
      id: editingItem.item?.id ?? makeId(),
      purpose: toPascalWords(values.purpose),
      monthlyAmount: toNumber(values.monthlyAmount),
      totalInstallments: toNumber(values.totalInstallments),
      startInstallment: toNumber(values.startInstallment),
      startMonth: editingItem.item?.startMonth ?? todayMonthKey(),
    };
    const recurringItems = editingItem.item
      ? editingItem.card.recurringItems.map((item) => (item.id === nextItem.id ? nextItem : item))
      : [...editingItem.card.recurringItems, nextItem];
    await updateCard(editingItem.card.id, { recurringItems });
    setEditingCard((card) => (card?.id === editingItem.card.id ? { ...card, recurringItems } : card));
    setEditingItem(null);
  }

  async function deleteItem() {
    if (!editingItem?.item) return;
    const recurringItems = editingItem.card.recurringItems.filter((item) => item.id !== editingItem.item?.id);
    await updateCard(editingItem.card.id, { recurringItems });
    setEditingCard((card) => (card?.id === editingItem.card.id ? { ...card, recurringItems } : card));
    setEditingItem(null);
  }

  return (
    <section className="page">
      <header className="page-header">
        <Typography.Title>Cards</Typography.Title>
        <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => openCardForm()} />
      </header>

      <Tabs
        activeKey={issuer}
        centered
        items={issuers.map((item) => ({ key: item, label: item }))}
        onChange={(key) => setIssuer(key as CardIssuer)}
      />

      {visibleCards.length === 0 ? (
        <EmptyState title={`No ${issuer} Cards`} description="Tap + to create a card record." />
      ) : (
        <>
          <Typography.Title level={4}>{issuer} Cards</Typography.Title>
          {visibleCards.map((card) => (
            <Card className="bank-card" key={card.id} onClick={() => openCardForm(card)}>
              <div className="bank-card-top">
                <strong>{card.title}</strong>
                <span>{card.issuer}</span>
              </div>
              <div className="bank-card-bottom">
                <span>Outstanding</span>
                <strong>
                  <MoneyText value={cardOutstanding(card)} hidden={valuesHidden} />
                </strong>
              </div>
            </Card>
          ))}
          <Card className="plain-total-card">
            <span>Total Outstanding</span>
            <strong>
              <MoneyText value={total} hidden={valuesHidden} />
            </strong>
          </Card>
        </>
      )}

      <Modal title={editingCard?.id ? 'Edit Card' : 'Add Card'} open={!!editingCard} onCancel={() => setEditingCard(null)} footer={null} destroyOnClose>
        <Form form={cardForm} layout="vertical" onFinish={submitCard}>
          <Form.Item label="Bank" name="issuer" rules={[{ required: true }]}>
            <Select options={issuers.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Maybank 1" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editingCard?.id && (
            <>
              <div className="modal-section-title">
                <strong>Monthly Recurring</strong>
                <Space>
                  <Button icon={<SortAscendingOutlined />} onClick={() => setSort(sort === 'amount' ? 'left' : 'amount')}>
                    Sort
                  </Button>
                  <Button icon={<PlusOutlined />} onClick={() => openItemForm(editingCard)}>
                    Add
                  </Button>
                </Space>
              </div>
              <div className="simple-list">
                <div className="split-row active-total">
                  <span>Active monthly total</span>
                  <strong>
                    <MoneyText value={cardOutstanding(editingCard)} hidden={valuesHidden} />
                  </strong>
                </div>
                {editingCard.recurringItems
                  .slice()
                  .sort((a, b) => (sort === 'amount' ? b.monthlyAmount - a.monthlyAmount : recurringLeft(a) - recurringLeft(b)))
                  .map((item) => (
                    <button className="list-button" key={item.id} type="button" onClick={() => openItemForm(editingCard, item)}>
                      <span>
                        <strong>{item.purpose}</strong>
                        <small>
                          {recurringProgress(item)}/{item.totalInstallments} · {recurringLeft(item)} left
                        </small>
                        <small>Next charge: {monthEndLabel()}</small>
                      </span>
                      <strong>
                        <MoneyText value={item.monthlyAmount} hidden={valuesHidden} />
                      </strong>
                    </button>
                  ))}
              </div>
              <Button danger type="primary" block size="large" className="danger-button" onClick={() => deleteCard(editingCard.id).then(() => setEditingCard(null))}>
                Delete Card
              </Button>
            </>
          )}
        </Form>
      </Modal>

      <Modal title={editingItem?.item ? 'Edit Recurring Item' : 'Add Recurring Item'} open={!!editingItem} onCancel={() => setEditingItem(null)} footer={null} destroyOnClose>
        <Form form={itemForm} layout="vertical" onFinish={submitItem}>
          <Form.Item label="Purpose" name="purpose" rules={[{ required: true }]}>
            <Input placeholder="Balance Transfer Plan G" />
          </Form.Item>
          <Form.Item label="Monthly Amount" name="monthlyAmount" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="RM" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Total Installments" name="totalInstallments" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Current Progress" name="startInstallment" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Save
          </Button>
          {editingItem?.item && (
            <Button danger type="primary" block size="large" className="danger-button" onClick={deleteItem}>
              Delete Recurring Item
            </Button>
          )}
        </Form>
      </Modal>
    </section>
  );
}
