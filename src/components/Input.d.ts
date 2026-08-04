import * as React from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string | null;
  icon?: string | null;
  containerStyle?: any;
  inputStyle?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength?: number | null;
  helperText?: string | null;
}

declare const Input: React.ComponentType<InputProps>;

export default Input;
