import React from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from '@/components/ui/text';
import type { Scene } from '@/lib/scenes';
import { cn } from '@/lib/utils';

type ScenePickerPanelProps = {
  scenes: Scene[];
  currentSceneId: string;
  onSelect: (scene: Scene) => void;
  onClose: () => void;
  /** Bottom offset for the card (safe area, etc.) */
  style?: StyleProp<ViewStyle>;
};

/** Simple, professional scene switcher for 360° tours. */
export function ScenePickerPanel({
  scenes,
  currentSceneId,
  onSelect,
  onClose,
  style,
}: ScenePickerPanelProps) {
  return (
    <View className="absolute inset-0 z-50">
      {/* Tap the video / empty area to dismiss */}
      <Pressable className="absolute inset-0" onPress={onClose} />

      <View className="absolute left-4 right-4" style={style}>
        <View
          className="rounded-xl overflow-hidden border border-white/10"
          style={{ backgroundColor: '#0A1628' }}
        >
          <View className="px-4 py-3 border-b border-white/10">
            <Text className="text-white text-sm font-semibold">Spaces</Text>
          </View>

          <ScrollView
            style={{ maxHeight: 240 }}
            showsVerticalScrollIndicator={false}
          >
            {scenes.map((scene) => {
              const isActive = scene.id === currentSceneId;

              return (
                <Pressable
                  key={scene.id}
                  onPress={() => onSelect(scene)}
                  className={cn(
                    'flex-row items-center px-4 py-3.5 border-b border-white/5 active:opacity-80',
                    isActive && 'bg-white/5'
                  )}
                >
                  <Text
                    className={cn(
                      'flex-1 text-[15px]',
                      isActive ? 'text-white font-semibold' : 'text-white/70'
                    )}
                    numberOfLines={1}
                  >
                    {scene.title}
                  </Text>
                  {isActive && (
                    <View className="w-1.5 h-1.5 rounded-full bg-[#F38C1E] ml-3" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
