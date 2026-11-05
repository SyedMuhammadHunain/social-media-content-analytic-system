// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Register Form Hook

import { useState, useRef, type FormEvent, type MouseEvent, type FormEventHandler } from 'react';
import { useAuth } from '../../context/useAuth';
import { validateField } from './authValidation.ts';

function extractFormValues(
  form: HTMLFormElement | null,
  current: { username: string; email: string; password: string }
) {
  const userEl = form?.querySelector<HTMLInputElement>('input[name="username"], input[placeholder*="username" i]');
  const emailEl = form?.querySelector<HTMLInputElement>('input[type="email"], input[placeholder*="email" i]');
  const passEl = form?.querySelector<HTMLInputElement>('input[type="password"]');
  return {
    username: userEl?.value ?? current.username,
    email: emailEl?.value ?? current.email,
    password: passEl?.value ?? current.password,
  };
}

export function useRegisterForm() {
  const { register, error, isLoading, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    username?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});

  const handleBlur = (field: 'username' | 'email' | 'password', val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleInput: FormEventHandler<HTMLFormElement> = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'password') {
      setPassword(target.value);
    } else if (target.type === 'email' || target.placeholder?.toLowerCase().includes('email')) {
      setEmail(target.value);
    } else {
      setUsername(target.value);
    }
  };

  const handleSubmit = async (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault();

    const { username: finalUsername, email: finalEmail, password: finalPassword } = extractFormValues(formRef.current, {
      username,
      email,
      password,
    });

    const uErr = validateField('username', finalUsername);
    const eErr = validateField('email', finalEmail);
    const pErr = validateField('password', finalPassword);

    const hasErrors = Boolean(uErr || eErr || pErr);
    if (hasErrors) {
      setErrors({ username: uErr, email: eErr, password: pErr });
      setTouched({ username: true, email: true, password: true });
      return;
    }

    await register(finalUsername, finalEmail, finalPassword);
  };

  return {
    formRef,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    touched,
    handleBlur,
    handleInput,
    handleSubmit,
    error,
    isLoading,
    clearError,
  };
}
