import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean; // For indicating selection, like a toggle button
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  active = false,
  ...props
}) => {
  const baseStyle = 'font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all ease-in-out duration-150 transform active:scale-95';
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = active 
        ? 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 text-white ring-2 ring-sky-400' 
        : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500 text-white';
      break;
    case 'secondary':
      variantStyle = active
        ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 text-white ring-2 ring-slate-400'
        : 'bg-slate-500 hover:bg-slate-600 focus:ring-slate-500 text-white';
      break;
    case 'danger':
      variantStyle = 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white';
      break;
    case 'success':
      variantStyle = 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white';
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-xs';
      break;
    case 'md':
      sizeStyle = 'px-4 py-2 text-sm';
      break;
    case 'lg':
      sizeStyle = 'px-6 py-3 text-base';
      break;
  }

  return (
    <button
      type="button" // Default to type="button" to prevent form submissions if used in a form
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
