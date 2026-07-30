import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type DocumentData,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import type { BaseRecord } from '../types';

function removeUndefined(value: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined));
}

export function useUserCollection<T extends BaseRecord>(uid: string | undefined, collectionName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const path = useMemo(() => (uid ? `users/${uid}/${collectionName}` : ''), [collectionName, uid]);

  useEffect(() => {
    if (!db || !uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, path);
    const q = query(ref, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((snap) => ({
          id: snap.id,
          ...(snap.data() as DocumentData),
        })) as T[],
      );
      setLoading(false);
    });
  }, [path, uid]);

  async function create(data: Omit<T, 'id'>) {
    if (!db || !uid) throw new Error('Firebase is not ready.');
    const now = Date.now();
    await addDoc(collection(db, path), removeUndefined({ ...data, createdAt: now, updatedAt: now }));
  }

  async function update(id: string, data: Partial<T>) {
    if (!db || !uid) throw new Error('Firebase is not ready.');
    await setDoc(doc(db, path, id), removeUndefined({ ...data, updatedAt: Date.now() }), { merge: true });
  }

  async function remove(id: string) {
    if (!db || !uid) throw new Error('Firebase is not ready.');
    await deleteDoc(doc(db, path, id));
  }

  async function replaceAll(records: T[]) {
    if (!db || !uid) throw new Error('Firebase is not ready.');
    const firestore = db;
    const now = Date.now();
    await Promise.all(items.map((item) => deleteDoc(doc(firestore, path, item.id))));
    await Promise.all(
      records.map(({ id, ...record }) =>
        setDoc(doc(firestore, path, id), removeUndefined({ ...record, createdAt: record.createdAt ?? now, updatedAt: now })),
      ),
    );
  }

  return { items, loading, create, update, remove, replaceAll };
}
