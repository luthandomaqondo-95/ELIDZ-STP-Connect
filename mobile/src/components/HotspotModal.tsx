import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

interface HotspotModalProps {
  visible: boolean;
  text: string;
  onClose: () => void;
}

export default function HotspotModal({ visible, text, onClose }: HotspotModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center p-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-slate-900/98 rounded-2xl p-5 max-w-[320px] border border-cyan-500/20"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-white text-base leading-6">{text}</Text>
          <Pressable
            onPress={onClose}
            className="mt-4 py-2.5 px-4 rounded-xl bg-cyan-500/20 self-end active:opacity-80"
          >
            <Text className="text-viewer-cyan font-semibold text-sm">Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
