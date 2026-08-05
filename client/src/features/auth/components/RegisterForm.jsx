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

const RegisterFields = ({ accountType, setAccountType, setMascotState = () => {} }) => {
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
    defaultValues: {
      fullName: '',
      companyName: '',
      phone: '',
      website: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMascotState('idle');
    try {
      if (accountType === 'candidate') {
        await authApi.registerCandidate({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          password: data.password,
        });
        toast.success('Candidate registered successfully! Logging in...');
        setMascotState('success');
        await loginCandidate(data.email, data.password);
        setTimeout(() => navigate('/candidate/dashboard'), 600);
      } else {
        await authApi.registerCompany({
          companyName: data.companyName,
          website: data.website,
          email: data.email,
          password: data.password,
        });
        toast.success('Employer company registered successfully! Logging in...');
        setMascotState('success');
        await loginCompany(data.email, data.password);
        setTimeout(() => navigate('/company/dashboard'), 600);
      }
    } catch (err) {
      setMascotState('failure');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nameProps = register('fullName');
  const companyProps = register('companyName');
  const phoneProps = register('phone');
  const websiteProps = register('website');
  const emailProps = register('email');
  const passwordProps = register('password');

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
            label="Full Name *"
            placeholder="John Doe"
            startIcon={User}
            error={errors.fullName?.message}
            {...nameProps}
            onFocus={() => setMascotState('looking')}
            onBlur={(e) => {
              nameProps.onBlur(e);
              setMascotState('idle');
            }}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            startIcon={Phone}
            error={errors.phone?.message}
            {...phoneProps}
            onFocus={() => setMascotState('looking')}
            onBlur={(e) => {
              phoneProps.onBlur(e);
              setMascotState('idle');
            }}
          />
        </>
      ) : (
        <>
          <Input
            label="Company Name *"
            placeholder="Acme AI Technologies"
            startIcon={Building}
            error={errors.companyName?.message}
            {...companyProps}
            onFocus={() => setMascotState('looking')}
            onBlur={(e) => {
              companyProps.onBlur(e);
              setMascotState('idle');
            }}
          />
          <Input
            label="Company Website"
            placeholder="https://acme.com"
            startIcon={Globe}
            error={errors.website?.message}
            {...websiteProps}
            onFocus={() => setMascotState('looking')}
            onBlur={(e) => {
              websiteProps.onBlur(e);
              setMascotState('idle');
            }}
          />
        </>
      )}

      <Input
        label="Work Email *"
        type="email"
        placeholder="user@domain.com"
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
        label="Password *"
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

      <Button type="submit" variant="primary" className="w-full h-11 text-sm font-semibold mt-2" isLoading={loading}>
        {accountType === 'candidate' ? 'Create Candidate Account' : 'Register Employer Account'}
      </Button>
    </form>
  );
};

export const RegisterForm = ({ setMascotState }) => {
  const [accountType, setAccountType] = useState('candidate');
  return <RegisterFields key={accountType} accountType={accountType} setAccountType={setAccountType} setMascotState={setMascotState} />;
};

