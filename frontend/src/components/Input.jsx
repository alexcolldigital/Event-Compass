// @ts-check
import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * @typedef {{
 *   label?: string;
 *   placeholder?: string;
 *   value?: string;
 *   onChangeText?: (text: string) => void;
 *   secureTextEntry?: boolean;
 *   keyboardType?: any;
 *   editable?: boolean;
 *   multiline?: boolean;
 *   numberOfLines?: number;
 *   error?: string | null;
 *   icon?: any;
 *   containerStyle?: any;
 *   inputStyle?: any;
 *   onFocus?: (() => void) | null;
 *   onBlur?: (() => void) | null;
 *   onSubmitEditing?: (() => void) | null;
 *   returnKeyType?: any;
 *   blurOnSubmit?: boolean;
 *   maxLength?: number | null;
 *   helperText?: string | null;
 * }} InputProps
 */

/** @param {InputProps} props */
export const Input = React.memo(({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  error = null,
  icon = null,
  containerStyle,
  inputStyle,
  onFocus = null,
  onBlur = null,
  onSubmitEditing = null,
  returnKeyType = 'done',
  blurOnSubmit,
  maxLength = null,
  helperText = null,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tint = error ? '#dc2626' : isFocused ? '#16a34a' : '#94a3b8';

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const togglePassword = useCallback(() => setIsPasswordVisible((v) => !v), []);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrap,
          isFocused && styles.inputWrapFocused,
          error ? styles.inputWrapError : null,
          !editable && styles.disabled,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons name={icon || 'circle'} size={22} color={tint} style={styles.leadingIcon} />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength || undefined}
          style={[styles.input, multiline && styles.multiline, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing || undefined}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit ?? !multiline}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={togglePassword} style={styles.passwordButton}>
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={22}
              color={tint}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {helperText && !error ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginLeft: 2,
    color: '#172017',
    fontSize: 14,
    fontWeight: '800',
  },
  inputWrap: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#dfe7df',
    backgroundColor: '#f8fbf7',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputWrapFocused: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  inputWrapError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  disabled: {
    opacity: 0.6,
  },
  leadingIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    minHeight: 48,
    color: '#172017',
    fontSize: 16,
    fontWeight: '600',
    outlineStyle: 'none',
  },
  multiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  passwordButton: {
    padding: 8,
    marginLeft: 6,
  },
  error: {
    marginTop: 7,
    marginLeft: 4,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  helper: {
    marginTop: 7,
    marginLeft: 4,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Input;
