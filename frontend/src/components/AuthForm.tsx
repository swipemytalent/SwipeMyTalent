import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { login, register } from '../api/authApi';
import { fetchUserProfile } from '../api/userApi';

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
  firstName?: string;
  lastName?: string;
  title?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState<AuthData>({ 
    email: '', 
    password: '',
    firstName: '',
    lastName: '',
    title: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSuccess = async (data: AuthResponse) => {
    if (mode === 'login') {
      localStorage.setItem('token', data.token || '');
      try {
        const userData = await fetchUserProfile(data.token!);
        dispatch(setUser(userData));
      } catch (e) {}
      setSuccess('Connexion réussie !');
      navigate('/dashboard');
    } else {
      dispatch(setUser({
        email: formData.email,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        title: formData.title || '',
        avatar: ''
      }));
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
      let data: AuthResponse;
      if (mode === 'login') {
        data = await login(formData);
      } else {
        data = await register(formData);
      }

      if (!data || (mode === 'login' && !data.token)) {
        throw new Error(data?.message || 'Erreur inconnue');
      }

      await handleAuthSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === 'register' && (
        <>
          <label>
            Prénom
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Nom
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Métier
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </label>
        </>
      )}
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