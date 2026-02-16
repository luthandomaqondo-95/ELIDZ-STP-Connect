import React from 'react';
import { View, Pressable, Linking, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { getCenterById } from '@/services/center.service';

// Import center images
const analyticalLabImage = require('../../assets/images/tenants/analytical-lab.png');
const renewableEnergyImage = require('../../assets/images/renewable-energy.png');
const designCentreImage = require('../../assets/images/design-centre.png');
const connectSolveImage = require('../../assets/images/connect-solve.png');
const innospaceImage = require('../../assets/images/innospace.png');

// Import incubator logos
const cheminLogo = require('../../assets/images/tenants/chemin-logo.png');
const cortexHubLogo = require('../../assets/images/tenants/cortex-hub-logo.png');
const ecitiLogo = require('../../assets/images/tenants/eciti-logo.png');
const ecngocLogo = require('../../assets/images/tenants/ecngoc-logo.png');

type ThemeColors = ReturnType<typeof useTheme>['colors'];

function CenterDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '1';
  const name = Array.isArray(params.name) ? params.name[0] : params.name;
  const { colors } = useTheme();
  const data = getCenterById(id);
  if (!data) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-muted-foreground text-center">Center not found.</Text>
      </View>
    );
  }

  const handlePhoneCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleWebsite = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Parse service text to extract incubator name and website for center ID '8'
  const parseIncubatorService = (service: string) => {
    if (id !== '8') return null;
    
    // Match website after "Website:" - can be www.domain.com, domain.com, or https://domain.com
    const websiteMatch = service.match(/Website:\s*([^\s,]+)/i);
    if (!websiteMatch) return null;
    
    const website = websiteMatch[1];
    const nameMatch = service.match(/^([^-]+)\s*-/);
    const name = nameMatch ? nameMatch[1].trim() : '';
    
    return { name, website };
  };

  return (
    <View className="flex-1 bg-background">
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
          <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
            {name || 'Center Details'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-3 rounded-xl mb-5 bg-card shadow-sm">
          <Text className="text-base text-foreground">
            {data.description}
          </Text>
        </View>

        <View className="flex-row mb-5">
        <View className={`flex-1 ${(id === '1' || id === '2' || id === '5' || id === '6' || id === '7' || id === '8') ? 'mr-3' : ''}`}>
        <Text className="text-lg font-bold text-foreground mb-3">Services & Capabilities</Text>
          {data.services.map((service: string, index: number) => {
            const incubatorInfo = parseIncubatorService(service);
            return (
              <ServiceRow
                key={index}
                service={service}
                incubatorInfo={incubatorInfo}
                colors={colors}
                onOpenWebsite={handleWebsite}
              />
            );
          })}
        </View>
        {/* Show image on the right for specific centers */}
        {id === '1' && (
          <View className="w-[300px] h-[400px] rounded-xl overflow-hidden self-start">
            <Image source={analyticalLabImage} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
        {id === '2' && (
          <View className="w-[300px] h-[490px] rounded-xl overflow-hidden self-start">
            <Image source={designCentreImage} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
        {id === '5' && (
          <View className="w-[300px] h-[450px] rounded-xl overflow-hidden self-start">
            <Image source={renewableEnergyImage} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
        {id === '6' && (
          <View className="w-[300px] h-[490px] rounded-xl overflow-hidden self-start">
            <Image source={connectSolveImage} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
        {id === '7' && (
          <View className="w-[300px] h-[490px] rounded-xl overflow-hidden self-start">
            <Image source={innospaceImage} className="w-full h-full" resizeMode="cover" />
          </View>
        )}
        {id === '8' && (
          <View className="w-[300px] self-start">
            <View className="flex-col">
              <View className="w-full mb-3 p-2.5 items-center justify-center min-h-[120px]">
                <Image source={cheminLogo} className="w-full h-[100px]" resizeMode="contain" />
              </View>
              <View className="w-full mb-3 p-2.5 items-center justify-center min-h-[120px]">
                <Image source={ecitiLogo} className="w-full h-[100px]" resizeMode="contain" />
              </View>
              <View className="w-full mb-3 p-2.5 items-center justify-center min-h-[120px]">
                <Image source={cortexHubLogo} className="w-full h-[100px]" resizeMode="contain" />
              </View>
              <View className="w-full p-2.5 items-center justify-center min-h-[120px]">
                <Image source={ecngocLogo} className="w-full h-[100px]" resizeMode="contain" />
              </View>
            </View>
          </View>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-lg font-bold text-foreground mb-3">Equipment & Facilities</Text>
        {data.equipment.map((item: string, index: number) => (
          <EquipmentRow
            key={index}
            item={item}
            colors={colors}
          />
        ))}
      </View>

      {data.contact && (
        <View className="p-3 rounded-xl mb-5 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">Contact Information</Text>
          <View className="flex-row items-center">
            <Feather name="user" size={18} color={colors.primary} />
            <Text className="text-base text-foreground ml-2.5 flex-1">
              {data.contact.name}
            </Text>
          </View>
          <Pressable
            onPress={() => handlePhoneCall(data.contact.phone)}
            className="flex-row items-center mt-2.5 active:opacity-70"
          >
            <Feather name="phone" size={18} color={colors.primary} />
            <Text className="text-base text-primary ml-2.5 flex-1">Tel: {data.contact.phone}</Text>
          </Pressable>
          {data.contact.cell && (
            <Pressable
              onPress={() => handlePhoneCall(data.contact.cell)}
              className="flex-row items-center mt-2.5 active:opacity-70"
            >
              <Feather name="smartphone" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2.5 flex-1">Cell: {data.contact.cell}</Text>
            </Pressable>
          )}
          {data.contact.email && (
            <Pressable
              onPress={() => handleEmail(data.contact.email)}
              className="flex-row items-center mt-2.5 active:opacity-70"
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2.5 flex-1">{data.contact.email}</Text>
            </Pressable>
          )}
          {data.contact.website && (
            <Pressable
              onPress={() => handleWebsite('https://www.connectandsolve.co.za')}
              className="flex-row items-center mt-2.5 active:opacity-70"
            >
              <Feather name="globe" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2.5 flex-1">{data.contact.website}</Text>
            </Pressable>
          )}
        </View>
      )}

      {data.additionalInfo && (
        <View className="p-3 rounded-xl mb-5 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">Intellectual Property</Text>
          <Text className="text-base text-foreground leading-[22px]">
            {data.additionalInfo}
          </Text>
        </View>
      )}

      <View className="p-5 rounded-xl mb-5 bg-primary shadow-sm">
        <Text className="text-lg font-bold text-white mb-2">
          Get in Touch
        </Text>
        <Text className="text-sm text-white/90 mb-3">
          {data.contact
            ? `Contact ${data.contact.name} to learn more about how this center can support your innovation`
            : 'Contact us to learn more about how this center can support your innovation'}
        </Text>
        {data.contact && (
          <Pressable
            className="flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-white active:opacity-80"
            onPress={() => handlePhoneCall(data.contact.phone)}
          >
            <Feather name="phone" size={18} color={colors.primary} />
            <Text className="text-base text-primary ml-2 font-semibold">Request a Quote</Text>
          </Pressable>
        )}
      </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(CenterDetailScreen);

type ServiceRowProps = {
  service: string;
  incubatorInfo: { name: string; website: string } | null;
  colors: ThemeColors;
  onOpenWebsite: (url: string) => void;
};

const ServiceRow: React.FC<ServiceRowProps> = ({ service, incubatorInfo, colors, onOpenWebsite }) => (
  <View className="flex-row items-start mb-2.5">
    <Feather name="check-circle" size={20} color={colors.secondary} />
    <View className="ml-2.5 flex-1">
      {incubatorInfo ? (
        <View className="flex-row flex-wrap">
          <Pressable onPress={() => onOpenWebsite(incubatorInfo.website)}>
            <Text className="text-base text-primary underline">{incubatorInfo.name}</Text>
          </Pressable>
          <Text className="text-base text-foreground">
            {service.replace(new RegExp(`^${incubatorInfo.name}\\s*-`), ' -').replace(/Website:\s*www\.\S+/i, '')}
          </Text>
        </View>
      ) : (
        <Text className="text-base text-foreground">{service}</Text>
      )}
    </View>
  </View>
);

type EquipmentRowProps = {
  item: string;
  colors: ThemeColors;
};

const EquipmentRow: React.FC<EquipmentRowProps> = ({ item, colors }) => (
  <View className="flex-row items-start mb-2.5">
    <Feather name="settings" size={20} color={colors.primary} />
    <Text className="text-base text-foreground ml-2.5 flex-1">{item}</Text>
  </View>
);
