import React from 'react';
import AuthForm from '../components/AuthForm/AuthForm';

const Register: React.FC = () => {
  return (
    <div className="auth-page">
      <h1>Inscription</h1>
      <AuthForm mode="register" />
    </div>
  );
};

export default Register; 