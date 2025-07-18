import { useState, FormEvent, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import type { UserState } from '../../redux/userSlice';
import { login, register } from '../../api/authApi';
import { fetchUserProfile } from '../../api/userApi';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthResponse {
  token?: string;
  message?: string;
  user?: UserState;
}

interface AuthData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  avatar?: string;
  bio?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState<AuthData>({ 
    email: '', 
    password: '',
    firstName: '',
    lastName: '',
    title: '',
    avatar: '',
    bio: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAuthSuccess = async (data: AuthResponse) => {
    if (mode === 'login') {
      try {
        const userData = await fetchUserProfile();
        dispatch(setUser(userData));
      } catch (e) {}
      setSuccess('Connexion réussie !');
      navigate('/');
    } else {
      if (data.user) {
        dispatch(setUser(data.user));
      } else {
        dispatch(setUser({
          id: '',
          email: formData.email,
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          title: formData.title || '',
          avatar: formData.avatar || '',
          bio: formData.bio || ''
        }));
      }
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
    <form onSubmit={handleSubmit} className="auth-form">
      {mode === 'register' && (
        <>
        <div className="auth-form__avatar-group">
            <div className="auth-form__avatar-preview" onClick={handleAvatarClick}>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" />
              ) : (
                <span className="auth-form__avatar-placeholder">+</span>
              )}
            </div>  
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              name="avatar"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Métier</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      )}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
      </button>
      {mode === 'login' && (
        <div className="auth-form__register-link">
          <p>Pas encore inscrit ? <a href="/register">Inscrivez-vous</a></p>
        </div>
      )}
    </form>
  );
};

export default AuthForm; 