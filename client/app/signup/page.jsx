'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFingerprint, IconLoader2, IconCircleCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import api from '@/lib/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/signup', { email, password });
      
      if (response.data.message.includes('check your email')) {
        setSuccess(true);
      } else {
        router.push('/login?message=Account created successfully');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 font-sans transition-colors duration-300">
        <Card className="w-full max-w-md shadow-lg border-muted text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconCircleCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl mb-2">Check your email</CardTitle>
          <CardDescription className="text-lg">
            We've sent a verification link to <span className="font-medium text-foreground">{email}</span>. 
            Please verify your account to continue.
          </CardDescription>
          <Button 
            className="w-full mt-8"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 font-sans transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <IconFingerprint className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight uppercase">Cortex</span>
          </Link>
          <p className="text-muted-foreground font-medium text-sm italic">Begin your neural transition</p>
        </div>

        <Card className="shadow-lg border-muted">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email and password to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </Field>
                {error && (
                  <p className="text-sm text-destructive font-medium">{error}</p>
                )}
                <Field className="mt-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <IconLoader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                  <FieldDescription className="text-center mt-4">
                    Already have an account?{' '}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary font-medium">
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
