import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthResponse {
  token?: string;
  message?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur inconnue');
      } else {
        if (mode === 'login') {
          localStorage.setItem('token', data.token || '');
          setSuccess('Connexion réussie !');
          navigate('/dashboard');
        } else {
          setSuccess('Inscription réussie, vous pouvez vous connecter.');
          navigate('/login');
        }
      }
    } catch (err) {
      setError('Erreur serveur');
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
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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