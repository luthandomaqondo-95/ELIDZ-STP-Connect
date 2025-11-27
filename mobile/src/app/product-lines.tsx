import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProductLinesScreen() {
  const productLines = [
    {
      id: '1',
      name: 'Analytical Laboratory',
      icon: 'droplet' as const,
      description: 'SANAS accredited CAS Laboratory for water, food, and soil analysis',
      colorClass: 'bg-primary',
    },
    {
      id: '2',
      name: 'Design Centre',
      icon: 'pen-tool' as const,
      description: 'Rapid prototyping services: 3D printing, laser cutting, CNC machining, and training',
      colorClass: 'bg-secondary',
    },
    {
      id: '5',
      name: 'Renewable Energy Centre of Excellence',
      icon: 'zap' as const,
      description: 'Training facility for skills development in the Green Economy sector',
      colorClass: 'bg-primary',
    },
    {
      id: '6',
      name: 'Connect + Solve',
      icon: 'globe' as const,
      description: 'Open innovation platform connecting solution seekers with innovative providers',
      colorClass: 'bg-secondary',
    },
    {
      id: '7',
      name: 'Innospace',
      icon: 'home' as const,
      description: 'Collaborative workspace with hot desks, meeting rooms, and modern facilities',
      colorClass: 'bg-accent',
    },
    {
      id: '8',
      name: 'Incubators',
      icon: 'trending-up' as const,
      description: 'Startup incubation support: Chemin, ECITI, Cortex Hub, and ECNGOC',
      colorClass: 'bg-primary',
    },
    {
      id: '9',
      name: 'Regional Innovation Networking Platform (RINP)',
      icon: 'users' as const,
      description: 'DSI initiative coordinating innovation community networking and collaboration',
      colorClass: 'bg-secondary',
    },
  ];

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
                onPress={() => router.push({ pathname: '/center-detail', params: { id: line.id, name: line.name } })}
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

