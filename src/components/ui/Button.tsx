import type React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  text?: string;
  type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonProps> = ({
  className,
  text,
  type = 'submit',
  ...rest
}: ButtonProps) => {
  return (
    <button className={className} type={type} {...rest}>
      {text}
    </button>
  );
};

export default Button;
