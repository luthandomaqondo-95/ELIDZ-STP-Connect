import React from 'react';
import { View, ScrollView, Image, Pressable, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function AboutScreen() {
  const handleContact = () => {
    Linking.openURL('mailto:info@elidz.co.za');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.elidz.co.za');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
            colors={['#002147', '#003366']}
            className="pt-12 pb-10 px-6 rounded-b-[30px] shadow-lg"
        >
            <Pressable 
                onPress={() => router.back()}
                className="absolute top-12 left-6 p-2 bg-white/10 rounded-full z-10"
            >
                <Feather name="arrow-left" size={20} color="white" />
            </Pressable>
            
            <View className="items-center mt-4">
                <View className="w-24 h-24 bg-white rounded-3xl justify-center items-center shadow-lg mb-4">
                    {/* Replace with actual logo if available, using text as placeholder */}
                    <Text className="text-[#002147] font-bold text-center text-xs px-2">
                        ELIDZ
                        Science &
                        Tech Park
                    </Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center">ELIDZ-STP Connect</Text>
                <Text className="text-white/70 text-sm font-medium mt-1">Version 1.0.0</Text>
            </View>
        </LinearGradient>

        <View className="px-6 -mt-6">
            {/* Mission Card */}
            <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-[#002147]/5 rounded-full items-center justify-center mr-3">
                        <Feather name="target" size={20} color="#002147" />
                    </View>
                    <Text className="text-lg font-bold text-[#002147]">Our Mission</Text>
                </View>
                <Text className="text-gray-600 leading-relaxed text-sm">
                    To be a world-class Science and Technology Park that fosters innovation, entrepreneurship, and economic growth in the Eastern Cape region. We connect innovators, researchers, and businesses to create sustainable solutions for the future.
                </Text>
            </View>

            {/* Features Grid */}
            <Text className="text-[#002147] font-bold text-lg mb-4 ml-1">Key Features</Text>
            <View className="flex-row flex-wrap justify-between mb-6">
                {[
                    { icon: 'users', title: 'Networking', desc: 'Connect with industry leaders' },
                    { icon: 'zap', title: 'Innovation', desc: 'Access labs & facilities' },
                    { icon: 'briefcase', title: 'Support', desc: 'Business incubation' },
                    { icon: 'globe', title: 'Growth', desc: 'Global market access' },
                ].map((item, index) => (
                    <View key={index} className="w-[48%] bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
                        <Feather name={item.icon as any} size={24} color="#FF6600" className="mb-2" />
                        <Text className="font-bold text-[#002147] mb-1">{item.title}</Text>
                        <Text className="text-xs text-gray-500">{item.desc}</Text>
                    </View>
                ))}
            </View>

            {/* Contact & Info */}
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Pressable 
                    onPress={handleWebsite}
                    className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
                >
                    <Feather name="globe" size={20} color="#002147" />
                    <Text className="flex-1 ml-3 text-gray-700 font-medium">Visit Website</Text>
                    <Feather name="external-link" size={16} color="#9CA3AF" />
                </Pressable>
                <Pressable 
                    onPress={handleContact}
                    className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
                >
                    <Feather name="mail" size={20} color="#002147" />
                    <Text className="flex-1 ml-3 text-gray-700 font-medium">Contact Us</Text>
                    <Feather name="chevron-right" size={16} color="#9CA3AF" />
                </Pressable>
                <View className="flex-row items-center p-4 bg-gray-50">
                    <Feather name="shield" size={20} color="#002147" />
                    <Text className="flex-1 ml-3 text-gray-700 font-medium">Privacy Policy</Text>
                </View>
            </View>

            <Text className="text-center text-gray-400 text-xs mt-8">
                © 2025 East London Industrial Development Zone SOC Ltd. All rights reserved.
            </Text>
        </View>
      </ScrollView>
    </View>
  );
}
