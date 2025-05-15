import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import formDataJson from '../data/loginForm.json';
import '../styles/Login.scss';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = formDataJson.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = formDataJson.emailInvalid;
    }
    if (!formData.password) {
      newErrors.password = formDataJson.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = formDataJson.passwordShort;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrors({ submit: "Email ou mot de passe incorrect." });
      }
    } catch {
      setErrors({ submit: formDataJson.submitError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>
          <span className="logo-blue">SwipM</span><span className="logo-orange">yTalent</span>
        </h1>
        <div className="form-group">
          <label htmlFor="email">{formDataJson.emailLabel}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={formDataJson.emailPlaceholder}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">{formDataJson.passwordLabel}</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={formDataJson.passwordPlaceholder}
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        <div className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">{formDataJson.rememberMe}</label>
        </div>
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? formDataJson.loading : formDataJson.submit}
        </button>
        <div className="forgot-password">
          <a href="/forgot-password">{formDataJson.forgotPassword}</a>
        </div>
        <div className="signup-link">
          <span>Pas encore de compte ? </span>
          <Link to="/signup">Créer un compte</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 