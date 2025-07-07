import AuthForm from '../components/AuthForm/AuthForm';

const Login: React.FC = () => {
  return (
    <div className="auth-page">
      <h1>Connexion</h1>
      <AuthForm mode="login" />
    </div>
  );
};

export default Login; 