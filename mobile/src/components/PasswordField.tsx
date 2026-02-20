import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

export type PasswordFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accentColor: string;
  placeholderColor?: string;
  editable?: boolean;
  autoComplete?: 'password' | 'password-new' | 'password-new-password';
  className?: string;
  containerClassName?: string;
};

export function PasswordField({
  value,
  onChangeText,
  placeholder = 'Password',
  accentColor,
  placeholderColor,
  editable = true,
  autoComplete = 'password',
  containerClassName,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  return (
    <View className={containerClassName ?? 'flex-row items-center bg-input rounded-xl mb-4 px-4 h-14 border border-border'}>
      <Ionicons name="lock-closed-outline" size={20} color={accentColor} style={{ marginRight: 12 }} />
      <TextInput
        className="flex-1 text-base text-foreground"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete={autoComplete}
        editable={editable}
      />
      <Pressable className="p-1" onPress={() => setShow((s) => !s)}>
        <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={accentColor} />
      </Pressable>
    </View>
  );
}
