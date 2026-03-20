import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';

type TermsAndPrivacyNoticeProps = {
  accepted: boolean;
  onToggle: () => void;
  showCheckbox?: boolean;
  context?: 'signin' | 'signup';
};

export function TermsAndPrivacyNotice({
  accepted,
  onToggle,
  showCheckbox = true,
  context = 'signin',
}: TermsAndPrivacyNoticeProps) {
  return (
    <View className="flex-row items-start mb-4">
      {showCheckbox ? (
        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-1 mr-3"
          onPress={onToggle}
        >
          <Checkbox checked={accepted} onCheckedChange={onToggle} />
        </TouchableOpacity>
      ) : (
        // Keep spacing consistent when the checkbox is hidden.
        <View className="mt-1 mr-3" style={{ width: 24, height: 24 }} />
      )}

      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">
          {showCheckbox
            ? context === 'signup'
              ? "By creating your account, you confirm that you have read and agree to ELIDZ-STP's "
              : "By signing in, you confirm that you have read and agree to ELIDZ-STP's "
            : "Please review ELIDZ-STP's "}

          <Text className="text-accent font-semibold">
            Terms of Use
          </Text>
          {' '}
          and{' '}
          <Text className="text-accent font-semibold">
            Privacy Notice
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

