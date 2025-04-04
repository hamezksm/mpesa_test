import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  const baseStyles = 'rounded-full px-4 py-2 font-medium transition-colors';
  const variantStyles = variant === 'primary' 
    ? 'bg-green-500 text-white hover:bg-green-600' 
    : 'bg-gray-200 text-black hover:bg-gray-300';

  return (
    <button className={`${baseStyles} ${variantStyles}`} {...props}>
      {children}
    </button>
  );
};

export default Button;