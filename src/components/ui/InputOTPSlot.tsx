import { useRef } from 'react';

export interface InputOTPSlotProps {
  index: number;
  value?: string;
  onChange?: (val: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InputOTPSlot({
  value = '',
  onChange,
  autoFocus,
  disabled,
  className = '',
}: InputOTPSlotProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (onChange) onChange(val);
        if (val && ref.current && ref.current.nextElementSibling) {
          (ref.current.nextElementSibling as HTMLInputElement).focus();
        }
      }}
      autoFocus={autoFocus}
      disabled={disabled}
      className={`text-center border rounded text-lg w-12 h-14 bg-secondary border-gray-300 ${className}`}
    />
  );
}
