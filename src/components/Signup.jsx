import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import signupData from '../data/signupForm.json';
import '../styles/Signup.scss';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cgu: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = signupData.firstNameRequired;
    if (!formData.lastName) newErrors.lastName = signupData.lastNameRequired;
    if (!formData.email) newErrors.email = signupData.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = signupData.emailInvalid;
    if (!formData.password) newErrors.password = signupData.passwordRequired;
    else if (formData.password.length < 8) newErrors.password = signupData.passwordShort;
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(formData.password)) newErrors.password = signupData.passwordWeak;
    if (!formData.confirmPassword) newErrors.confirmPassword = signupData.confirmPasswordRequired;
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = signupData.passwordsNotMatch;
    if (!formData.cgu) newErrors.cgu = signupData.cguRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const ok = register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      if (!ok) {
        setErrors({ email: "Cet email est déjà utilisé." });
        setIsLoading(false);
        return;
      }
      navigate('/login');
    } catch {
      setErrors({ submit: signupData.submitError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1>
          <span className="logo-blue">SwipM</span><span className="logo-orange">yTalent</span>
        </h1>
        <div className="form-group">
          <label htmlFor="firstName">{signupData.firstNameLabel}</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={signupData.firstNamePlaceholder}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">{signupData.lastNameLabel}</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={signupData.lastNamePlaceholder}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">{signupData.emailLabel}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={signupData.emailPlaceholder}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">{signupData.passwordLabel}</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={signupData.passwordPlaceholder}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">{signupData.confirmPasswordLabel}</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={signupData.confirmPasswordPlaceholder}
              className={errors.confirmPassword ? 'error' : ''}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>
        <div className="form-group cgu-group">
          <input
            type="checkbox"
            id="cgu"
            name="cgu"
            checked={formData.cgu}
            onChange={handleChange}
          />
          <label htmlFor="cgu">{signupData.cguLabel}</label>
          {errors.cgu && <span className="error-message">{errors.cgu}</span>}
        </div>
        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? signupData.loading : signupData.submit}
        </button>
      </form>
    </div>
  );
};

export default Signup; 