import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';

type TermsAndPrivacyNoticeProps = {
  accepted: boolean;
  onToggle: () => void;
};

export function TermsAndPrivacyNotice({ accepted, onToggle }: TermsAndPrivacyNoticeProps) {
  return (
    <View className="flex-row items-start mb-4">
      <TouchableOpacity
        activeOpacity={0.8}
        className="mt-1 mr-3"
        onPress={onToggle}
      >
        <Checkbox checked={accepted} onCheckedChange={onToggle} />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">
          By signing in, you confirm that you have read and agree to ELIDZ-STP&apos;s{' '}
          <Text
            className="text-accent font-semibold"
          >
            Terms of Use
          </Text>{' '}
          and{' '}
          <Text
            className="text-accent font-semibold"
          >
            Privacy Notice
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

