import React, { useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '../../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const premiumPlans = [
  {
    id: 'monthly',
    title: 'Monthly',
    price: 'R149',
    period: 'per month',
    features: [
      'Priority opportunity alerts',
      'Direct messaging with tenants',
      'Advanced search filters',
      'Featured profile placement',
      'Premium support',
    ],
  },
  {
    id: 'yearly',
    title: 'Yearly',
    price: 'R1,499',
    period: 'per year',
    originalPrice: 'R1,788',
    savings: 'Save R289',
    features: [
      'All monthly features',
      'Exclusive networking events',
      'VIP event invitations',
      'Custom profile branding',
      'Priority tenant matching',
    ],
  },
];

export default function PremiumUpgradeScreen() {
  const { profile: user } = useAuthContext();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to upgrade to premium');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement premium upgrade with payment processing
      // For now, simulate a successful upgrade
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Success!',
        'Welcome to ELIDZ-STP Premium! Your account has been upgraded.',
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to upgrade. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary pt-12 pb-6 px-6 items-center">
        <View className="w-15 h-15 rounded-full bg-yellow-400 justify-center items-center mb-4">
          <Feather name="star" size={30} color="rgb(var(--primary))" />
        </View>

        <Text className="text-primary-foreground mb-2 text-2xl font-semibold">
          Upgrade to Premium
        </Text>

        <Text className="text-white/90 text-center text-base">
          Unlock exclusive features and accelerate your growth at ELIDZ-STP
        </Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Plans */}
        {premiumPlans.map((plan) => (
          <Pressable
            key={plan.id}
            className={`rounded-xl p-4 mb-4 ${
              selectedPlan === plan.id 
                ? 'bg-primary border-0' 
                : 'bg-card border border-border'
            } active:opacity-90 shadow-sm`}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className={`text-xl font-semibold mb-1 ${
                  selectedPlan === plan.id ? 'text-white' : 'text-foreground'
                }`}>
                  {plan.title}
                </Text>
                <View className="flex-row items-center">
                  <Text className={`text-3xl font-bold ${
                    selectedPlan === plan.id ? 'text-white' : 'text-primary'
                  }`}>
                    {plan.price}
                  </Text>
                  <Text className={`text-sm ml-2 mt-1 ${
                    selectedPlan === plan.id ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                    {plan.period}
                  </Text>
                </View>
                {plan.savings && (
                  <Text className="text-green-500 font-semibold text-xs mt-1">
                    {plan.savings}
                  </Text>
                )}
              </View>

              <View className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                selectedPlan === plan.id 
                  ? 'border-white bg-white' 
                  : 'border-primary bg-transparent'
              }`}>
                {selectedPlan === plan.id && (
                  <View 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'rgb(var(--primary))' }}
                  />
                )}
              </View>
            </View>

            {/* Features */}
            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <View className="mr-2">
                  <Feather
                    name="check"
                    size={16}
                    color={selectedPlan === plan.id ? '#FFFFFF' : 'rgb(var(--green))'}
                  />
                </View>
                <Text className={`text-sm flex-1 ${
                  selectedPlan === plan.id ? 'text-white/90' : 'text-muted-foreground'
                }`}>
                  {feature}
                </Text>
              </View>
            ))}
          </Pressable>
        ))}

        {/* Benefits */}
        <View className="rounded-xl bg-card p-4 mb-6 shadow-sm">
          <Text className="text-xl font-semibold mb-4 text-foreground">
            Why Go Premium?
          </Text>

          {[
            { icon: 'trending-up', title: 'Priority Access', desc: 'Get first access to new opportunities and funding' },
            { icon: 'users', title: 'Direct Networking', desc: 'Message tenants and partners directly' },
            { icon: 'search', title: 'Advanced Search', desc: 'Filter and find exactly what you need' },
            { icon: 'star', title: 'Featured Placement', desc: 'Stand out with premium profile placement' },
            { icon: 'headphones', title: 'Premium Support', desc: 'Get priority help from our team' },
          ].map((benefit, index) => (
            <View key={index} className="flex-row items-start mb-4">
              <View className="w-8 h-8 rounded-full bg-primary justify-center items-center mr-3">
                <Feather name={benefit.icon as any} size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-1 text-foreground">
                  {benefit.title}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {benefit.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        <Pressable
          className="bg-primary py-4 rounded-lg items-center mb-6 active:opacity-90"
          style={{ opacity: isProcessing ? 0.7 : 1 }}
          onPress={handleUpgrade}
          disabled={isProcessing}
        >
          <Text className="text-primary-foreground font-semibold text-base">
            {isProcessing ? 'Processing...' : `Upgrade to ${premiumPlans.find(p => p.id === selectedPlan)?.title} Plan`}
          </Text>
        </Pressable>

        {/* Close Button */}
        <Pressable
          className="py-3 items-center active:opacity-70"
          onPress={() => router.back()}
        >
          <Text className="text-muted-foreground text-sm">
            Maybe Later
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
