import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../utils/validationSchemas';
import { Input, Button, Radio } from '../../../components/common';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [accountType, setAccountType] = useState('candidate');
  const { loginCandidate, loginCompany, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAccountTypeChange = (val) => {
    setAccountType(val);
    if (val === 'admin') {
      setValue('email', 'admin@skillbridge.ai');
      setValue('password', 'admin123');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (accountType === 'candidate') {
        await loginCandidate(data.email, data.password);
        navigate('/candidate/dashboard');
      } else if (accountType === 'company') {
        await loginCompany(data.email, data.password);
        navigate('/company/dashboard');
      } else {
        await loginAdmin(data.email, data.password);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      // Error handled in AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Radio
        label="Account Type"
        name="accountType"
        value={accountType}
        onChange={handleAccountTypeChange}
        direction="horizontal"
        options={[
          { label: 'Candidate', value: 'candidate' },
          { label: 'Company', value: 'company' },
          { label: 'System Admin', value: 'admin' },
        ]}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@company.com"
        startIcon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        startIcon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" variant="primary" className="w-full py-3 text-sm font-semibold" isLoading={loading}>
        Sign In to SkillBridge AI
      </Button>
    </form>
  );
};
