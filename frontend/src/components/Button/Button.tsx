import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className = '',
  title
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const combinedClass = `${baseClass} ${variantClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button; 