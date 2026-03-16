import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

export type PasswordFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  accentColor: string;
  placeholderColor?: string;
  editable?: boolean;
  autoComplete?: 'password' | 'password-new' | 'password-new-password';
  className?: string;
  containerClassName?: string;
};

const AUTOCOMPLETE_MAP: Record<PasswordFieldProps['autoComplete'] & string, React.ComponentProps<typeof TextInput>['autoComplete']> = {
  'password': 'password',
  'password-new': 'password-new',
  'password-new-password': 'password-new',
};

export function PasswordField({
  value,
  onChangeText,
  onBlur,
  placeholder = 'Password',
  accentColor,
  placeholderColor,
  editable = true,
  autoComplete = 'password',
  containerClassName,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  const mappedAutoComplete = (autoComplete && AUTOCOMPLETE_MAP[autoComplete]) ?? 'password';
  return (
    <View className={containerClassName ?? 'flex-row items-center bg-input rounded-xl mb-4 px-4 h-14 border border-border overflow-hidden'}>
      <View className="mr-3">
        <Ionicons name="lock-closed-outline" size={20} color={accentColor} />
      </View>
      <TextInput
        className="flex-1 min-h-0 py-0 text-base text-foreground"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete={mappedAutoComplete}
        editable={editable}
      />
      <Pressable className="p-1" onPress={() => setShow((s) => !s)}>
        <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={accentColor} />
      </Pressable>
    </View>
  );
}
