import AuthForm from '../components/AuthForm';

const Register = () => {
  return (
    <div className="auth-page">
      <h1>Inscription</h1>
      <AuthForm mode="register" />
    </div>
  );
};

export default Register; 