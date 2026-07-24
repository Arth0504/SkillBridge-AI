import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateRegisterSchema, companyRegisterSchema } from '../../../utils/validationSchemas';
import { Input, Button, Radio } from '../../../components/common';
import { Mail, Lock, User, Building, Phone, Globe } from 'lucide-react';
import { authApi } from '../../../api/authApi';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const RegisterForm = () => {
  const [accountType, setAccountType] = useState('candidate');
  const { loginCandidate, loginCompany } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const schema = accountType === 'candidate' ? candidateRegisterSchema : companyRegisterSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (accountType === 'candidate') {
        await authApi.registerCandidate(data);
        toast.success('Registration successful! Logging in...');
        await loginCandidate(data.email, data.password);
        navigate('/candidate/dashboard');
      } else {
        await authApi.registerCompany(data);
        toast.success('Company registered successfully! Logging in...');
        await loginCompany(data.email, data.password);
        navigate('/company/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Radio
        label="Account Type"
        name="accountType"
        value={accountType}
        onChange={setAccountType}
        direction="horizontal"
        options={[
          { label: 'Candidate Profile', value: 'candidate' },
          { label: 'Company Employer', value: 'company' },
        ]}
      />

      {accountType === 'candidate' ? (
        <>
          <Input
            label="Full Name"
            placeholder="John Doe"
            startIcon={User}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            startIcon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </>
      ) : (
        <>
          <Input
            label="Company Name"
            placeholder="Acme Corp AI"
            startIcon={Building}
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          <Input
            label="Company Website"
            placeholder="https://acme.com"
            startIcon={Globe}
            error={errors.website?.message}
            {...register('website')}
          />
        </>
      )}

      <Input
        label="Work Email"
        type="email"
        placeholder="user@domain.com"
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
        Create Free Account
      </Button>
    </form>
  );
};
