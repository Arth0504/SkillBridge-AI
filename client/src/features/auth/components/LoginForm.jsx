import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../utils/validationSchemas';
import { Input, Button, Radio } from '../../../components/common';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm = ({ setMascotState = () => {} }) => {
  const [accountType, setAccountType] = useState('candidate');
  const { loginCandidate, loginCompany, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
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
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMascotState('idle');
    try {
      if (accountType === 'candidate') {
        await loginCandidate(data.email, data.password);
        setMascotState('success');
        setTimeout(() => navigate('/candidate/dashboard'), 500);
      } else if (accountType === 'company') {
        await loginCompany(data.email, data.password);
        setMascotState('success');
        setTimeout(() => navigate('/company/dashboard'), 500);
      } else {
        await loginAdmin(data.email, data.password);
        setMascotState('success');
        setTimeout(() => navigate('/admin/dashboard'), 500);
      }
    } catch (err) {
      setMascotState('failure');
    } finally {
      setLoading(false);
    }
  };

  const emailProps = register('email');
  const passwordProps = register('password');

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
        {...emailProps}
        onFocus={() => setMascotState('looking')}
        onBlur={(e) => {
          emailProps.onBlur(e);
          setMascotState('idle');
        }}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        startIcon={Lock}
        error={errors.password?.message}
        {...passwordProps}
        onFocus={() => setMascotState('covering')}
        onBlur={(e) => {
          passwordProps.onBlur(e);
          setMascotState('idle');
        }}
      />

      <Button type="submit" variant="primary" className="w-full h-11 text-sm font-semibold" isLoading={loading}>
        Sign In to SkillBridge AI
      </Button>
    </form>
  );
};

