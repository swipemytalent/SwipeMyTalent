import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthResponse {
  token?: string;
  message?: string;
}

interface AuthData {
  email: string;
  password: string;
}

const API_ENDPOINTS = {
  login: '/api/login',
  register: '/api/register'
} as const;

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState<AuthData>({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSuccess = (data: AuthResponse) => {
    if (mode === 'login') {
      localStorage.setItem('token', data.token || '');
      setSuccess('Connexion réussie !');
      navigate('/dashboard');
    } else {
      setSuccess('Inscription réussie.');
      navigate('/login');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = API_ENDPOINTS[mode];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data: AuthResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur inconnue');
      }

      handleAuthSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
      </button>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
    </form>
  );
};

export default AuthForm; 