import React, { type ReactElement } from 'react';

export interface InputOTPProps {
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  onSlotChange?: (slots: string[]) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function InputOTP({
  maxLength = 6,
  value,
  onChange,
  onSlotChange,
  disabled,
  children,
}: InputOTPProps) {
  const flattenChildren = React.Children.toArray(children).flatMap((child) => {
    if (React.isValidElement(child) && child.props != null) {
      const props = child.props as { children?: React.ReactNode };
      if (props.children) {
        return React.Children.toArray(props.children);
      }
    }
    return [child];
  });

  const slots = flattenChildren.map((child, idx) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as ReactElement<any>, {
        value: value[idx] || '',
        onChange: (val: string) => {
          const newValueArr = value.split('');
          newValueArr[idx] = val;
          const trimmedValue = newValueArr.join('').slice(0, maxLength);
          const slotValues = trimmedValue
            .split('')
            .concat(
              Array(Math.max(0, maxLength - trimmedValue.length)).fill(''),
            );
          onChange(trimmedValue);
          if (onSlotChange) onSlotChange(slotValues);
        },
        autoFocus: idx === value.length,
        disabled,
      });
    }
    return child;
  });
  return <div className="flex gap-2">{slots}</div>;
}
