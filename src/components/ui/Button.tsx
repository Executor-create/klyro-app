import type React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  text?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

const Button: React.FC<ButtonProps> = ({
  className,
  text,
  children,
  type = 'submit',
  variant = 'primary',
  ...rest
}: ButtonProps) => {
  return (
    <button className={className} type={type} {...rest}>
      {text ?? children}
    </button>
  );
};

export default Button;
