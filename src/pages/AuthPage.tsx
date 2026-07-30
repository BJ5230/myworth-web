import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Segmented, Typography, message } from 'antd';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';

interface AuthForm {
  email: string;
  password: string;
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);

  async function submit(values: AuthForm) {
    if (!auth) return;
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unable to sign in.';
      message.error(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Typography.Title level={1}>MyWorth</Typography.Title>
        <Typography.Paragraph type="secondary">Your assets, cards, future plans, and packages in one private place.</Typography.Paragraph>

        {!isFirebaseConfigured && (
          <Alert
            type="warning"
            showIcon
            message="Firebase setup needed"
            description="For local run, create .env from .env.example. For the deployed website, add the same VITE_FIREBASE_* values as GitHub Actions secrets, then push again."
          />
        )}

        <Segmented
          block
          className="auth-switch"
          value={mode}
          options={[
            { label: 'Login', value: 'login' },
            { label: 'Create Account', value: 'signup' },
          ]}
          onChange={(value) => setMode(value as 'login' | 'signup')}
        />

        <Form layout="vertical" onFinish={submit} disabled={!isFirebaseConfigured}>
          <Form.Item label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} inputMode="email" autoComplete="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
