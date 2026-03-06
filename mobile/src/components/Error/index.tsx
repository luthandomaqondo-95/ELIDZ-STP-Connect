import React, { useEffect, useState } from 'react';
import { View, Pressable, Modal, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';

export interface ErrorAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  severity?: 'error' | 'warning' | 'info';
  autoDismissMs?: number;
}

export function ErrorAlert({
  visible,
  title,
  message,
  onDismiss,
  severity = 'error',
  autoDismissMs,
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const slideAnim = new Animated.Value(0);
  const colors = COLORS.light;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoDismissMs && autoDismissMs > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissMs);

        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, autoDismissMs]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss();
    });
  };

  if (!isVisible) {
    return null;
  }

  const getSeverityStyles = () => {
    switch (severity) {
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#FBBF24',
          iconColor: '#F59E0B',
          textColor: '#92400E',
        };
      case 'info':
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#93C5FD',
          iconColor: '#3B82F6',
          textColor: '#1E40AF',
        };
      case 'error':
      default:
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#FECACA',
          iconColor: '#EF4444',
          textColor: '#991B1B',
        };
    }
  };

  const severityStyles = getSeverityStyles();

  const getIconName = () => {
    switch (severity) {
      case 'warning':
        return 'alert-circle';
      case 'info':
        return 'info';
      case 'error':
      default:
        return 'x-circle';
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
    ],
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" pointerEvents="box-none">
      <View className="absolute top-0 left-0 right-0 z-50 px-4 pt-4">
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: severityStyles.backgroundColor,
              borderColor: severityStyles.borderColor,
              borderWidth: 1,
            },
          ]}
          className="rounded-lg border p-4 flex-row items-start gap-3"
          pointerEvents="auto"
        >
          <Feather
            name={getIconName()}
            size={20}
            color={severityStyles.iconColor}
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <View className="flex-1 gap-1">
            <Text
              style={{ color: severityStyles.textColor }}
              className="font-semibold text-sm"
            >
              {title}
            </Text>
            <Text
              style={{ color: severityStyles.textColor }}
              className="text-xs opacity-90"
            >
              {message}
            </Text>
          </View>
          <Pressable
            onPress={handleDismiss}
            hitSlop={8}
            className="flex-shrink-0"
          >
            <Feather
              name="x"
              size={18}
              color={severityStyles.iconColor}
            />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
