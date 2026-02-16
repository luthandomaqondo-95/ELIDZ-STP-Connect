import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { analyticsService } from '@/services/analytics.service';
import { getCenters } from '@/services/center.service';

export default function ProductLinesScreen() {
  const productLines = getCenters();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#002147', '#003366']}
        className="pt-12 pb-6 px-4 rounded-b-[30px] shadow-lg z-10"
      >
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="p-2 bg-white/10 rounded-full mr-4"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold flex-1">
            Centers of Excellence
          </Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-muted-foreground text-base mb-6">
          Explore our specialized centers designed to support innovation and growth
        </Text>

        {productLines.map((line, index) => (
            <View className="mb-4" key={index}>
              <Pressable
                className="flex-row items-center p-4 rounded-xl bg-card active:opacity-70 mb-2 shadow-sm"
                onPress={() => {
                  analyticsService.recordVisit('lab', line.id, line.name);
                  router.push({ pathname: '/center-detail', params: { id: line.id, name: line.name } });
                }}
              >
                <View className={`w-14 h-14 rounded-xl justify-center items-center ${line.colorClass}`}>
                  <Feather name={line.icon} size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-bold mb-2 text-foreground">{line.name}</Text>
                  <Text className="text-muted-foreground text-sm">
                    {line.description}
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color="rgb(var(--muted-foreground))" />
              </Pressable>
              <Pressable
                className={`flex-row items-center justify-center py-3 rounded-xl mx-1 ${line.colorClass} active:opacity-70`}
                onPress={() => router.push({ pathname: '/vr-tour', params: { id: line.id, name: line.name } })}
              >
                <Feather name="eye" size={18} color="#FFFFFF" />
                <Text className="text-white text-sm ml-2 font-semibold">
                  VR Tour
                </Text>
              </Pressable>
            </View>
        ))}
        {/* Bottom spacer for safe area */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

