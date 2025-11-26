import React, { useState } from 'react';
import { View, Pressable, TextInput, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useAuthContext } from '../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TenantsScreen() {
  const auth = useAuthContext();
  const { profile: user } = auth || {};
  const isGuest = !user;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Facilities
  const facilities = [
    {
      id: 'food-water-lab',
      name: 'Food & Water Testing Lab',
      type: 'Facility',
      sector: 'Food & Agriculture',
      location: 'Analytical Laboratory',
      description: 'Advanced testing facilities for food safety and water quality analysis',
      image: require('../../assets/images/connect-solve.png'),
      featured: true,
    },
    {
      id: 'design-centre',
      name: 'Design Centre',
      type: 'Facility',
      sector: 'Design & Innovation',
      location: 'Design Centre',
      description: 'Innovation hub for product design and prototyping',
      image: require('../../assets/images/design-centre.png'),
      featured: true,
    },
    {
      id: 'digital-hub',
      name: 'Digital Hub',
      type: 'Facility',
      sector: 'Technology',
      location: 'Digital Hub',
      description: 'Technology acceleration and digital transformation center',
      image: require('../../assets/images/innospace.png'),
      featured: true,
    },
    {
      id: 'automotive-incubator',
      name: 'Automotive & Manufacturing Incubator',
      type: 'Facility',
      sector: 'Manufacturing',
      location: 'Incubators',
      description: 'Advanced manufacturing and automotive innovation incubator',
      image: require('../../assets/images/renewable-energy.png'),
      featured: true,
    },
    {
      id: 'renewable-energy',
      name: 'Renewable Energy Centre',
      type: 'Facility',
      sector: 'Energy',
      location: 'Renewable Energy Centre',
      description: 'Clean energy solutions and sustainability projects',
      image: require('../../assets/images/renewable-energy.png'),
      featured: true,
    },
  ];

  // Tenants
  const tenants = [
    { id: '1', name: 'SAMRC', industry: 'Medical Research', sector: 'Healthcare', location: 'Digital Hub', description: 'Advancing life through medical research and innovation', logo: require('../../assets/images/tenants/samrc-logo.png'), featured: false, bbbee: 'Level 1' },
    { id: '2', name: 'Phokophela Investment Holdings', industry: 'Investment', sector: 'Finance', location: 'Digital Hub', description: 'Investment holding company', logo: require('../../assets/images/tenants/phokophela-logo.png'), featured: true, bbbee: 'Level 2' },
    { id: '3', name: 'ECNGOC', industry: 'NGO Services', sector: 'Social Services', location: 'Incubators', description: 'Advocating for socio-economic transformation', logo: require('../../assets/images/tenants/ecngoc-logo.png'), featured: false, bbbee: 'Level 1' },
    { id: '4', name: 'MSC Artisan Academy', industry: 'Education & Training', sector: 'Education', location: 'Renewable Energy Centre', description: 'Education for Industry - Partner for Renewable Energy training', logo: require('../../assets/images/tenants/msc-artisan-logo.png'), featured: false, bbbee: 'Level 3' },
    { id: '5', name: 'MFURAA Projects', industry: 'Consulting', sector: 'Professional Services', location: 'Digital Hub', description: 'Talent that is being inspired for you', logo: require('../../assets/images/tenants/mfuraa-logo.png'), featured: false, bbbee: 'Level 2' },
    { id: '6', name: 'Long Life ABET Consulting', industry: 'Education & Training', sector: 'Education', location: 'Digital Hub', description: 'Adult education and training services', logo: require('../../assets/images/tenants/longlife-logo.png'), featured: false, bbbee: 'Level 1' },
    { id: '7', name: 'KGI BPO', industry: 'Business Process Outsourcing', sector: 'Technology', location: 'Digital Hub', description: 'Optimum Ministerium Process Optimization', logo: require('../../assets/images/tenants/kgi-bpo-logo.png'), featured: true, bbbee: 'Level 2' },
    { id: '8', name: 'ECSA', industry: 'Professional Services', sector: 'Engineering', location: 'Digital Hub', description: 'Engineering professional body and regulatory authority', logo: require('../../assets/images/tenants/ecsa-logo.png'), featured: false, bbbee: 'Level 1' },
    { id: '9', name: 'Cortex Hub', industry: 'Technology Incubator', sector: 'Technology', location: 'Incubators', description: 'Technology incubator and accelerator for young entrepreneurs', logo: require('../../assets/images/tenants/cortex-hub-logo.png'), featured: false, bbbee: 'Level 3' },
    { id: '10', name: 'Chemin', industry: 'Chemical Technology', sector: 'Manufacturing', location: 'Incubators', description: 'The South African Chemical Technology Incubator', logo: require('../../assets/images/tenants/chemin-logo.png'), featured: false, bbbee: 'Level 1' },
  ];

  // Filter options
  const categories = ['All', 'Facilities', 'Tenants'];

  // Combine and filter items
  const allItems = [...facilities, ...tenants];
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
                           (selectedCategory === 'Facilities' && 'type' in item && item.type === 'Facility') ||
                           (selectedCategory === 'Tenants' && 'type' in item && item.type !== 'Facility');
    return matchesSearch && matchesCategory;
  });

  // Sort: featured first for premium users, then alphabetically
  const sortedItems = filteredItems.sort((a, b) => {
    if (user && !isGuest) {
      // Premium users see featured items first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  function renderItem(item: any) {
    const isFacility = item.type === 'Facility';
    const isFeatured = item.featured && user && !isGuest;

    return (
      <Pressable
        key={item.id}
        className={`flex-row items-center p-4 rounded-xl mb-3 bg-card active:opacity-90 shadow-sm ${
          isFeatured ? 'border-2 border-primary' : ''
        }`}
        onPress={() => {
          if (isFacility) {
            router.push(`/center-detail?name=${encodeURIComponent(item.name)}`);
          } else {
            router.push(`/tenant-detail?name=${encodeURIComponent(item.name)}`);
          }
        }}
      >
        {/* Featured badge for premium users */}
        {isFeatured && (
          <View className="absolute top-2 right-2 flex-row items-center bg-yellow-400 px-2 py-1 rounded-lg z-10">
            <Feather name="star" size={12} color="#FFFFFF" />
            <Text className="text-white text-xs ml-1">
              Featured
            </Text>
          </View>
        )}

        <View className="w-14 h-14 rounded-xl justify-center items-center overflow-hidden">
          {item.logo || item.image ? (
            <Image source={item.logo || item.image} className="w-full h-full" resizeMode="contain" />
          ) : (
            <View className="w-full h-full bg-primary justify-center items-center">
              <Text className="text-white text-xl font-bold">
                {item.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold flex-1 text-foreground" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="px-2 py-1 rounded-lg bg-primary/10">
              <Text className="text-primary text-xs">
                {item.type || 'Tenant'}
              </Text>
            </View>
          </View>

          <Text className="text-muted-foreground text-sm mt-1">
            {item.industry || item.sector} • {item.location}
          </Text>

          {item.bbbee && (
            <Text className="text-accent text-xs mt-1">
              B-BBEE {item.bbbee}
            </Text>
          )}

          <Text className="text-muted-foreground text-xs mt-1" numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color="rgb(var(--muted-foreground))" />
      </Pressable>
    );
  }

  return (
    <ScreenScrollView>
      {/* Header */}
      <View className="p-6 pb-4">
        <Text className="text-3xl font-bold text-foreground">Explore</Text>
        <Text className="text-muted-foreground text-base mt-2">
          Discover facilities, tenants, and opportunities at ELIDZ-STP
        </Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center px-4 h-12 rounded-lg border border-border mx-6 mb-4 bg-card">
        <Feather name="search" size={20} color="rgb(var(--muted-foreground))" />
        <TextInput
          className="flex-1 ml-3 text-base text-foreground"
          placeholder="Search facilities and tenants..."
          placeholderTextColor="rgb(var(--muted-foreground))"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View className="mb-6">
        <Text className="text-muted-foreground text-sm mb-2 ml-6">
          Category
        </Text>
        <View className="flex-row px-6">
          {categories.map((category) => (
            <Pressable
              key={category}
              className={`px-4 py-2 rounded-lg mr-3 active:opacity-70 ${
                selectedCategory === category
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text className={`text-sm ${
                selectedCategory === category ? 'text-white' : 'text-foreground'
              }`}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-semibold mb-4 text-foreground">
          {sortedItems.length} Result{sortedItems.length !== 1 ? 's' : ''}
        </Text>

        {sortedItems.map((item) => renderItem(item))}

        {sortedItems.length === 0 && (
          <View className="items-center py-12">
            <Feather name="search" size={48} color="rgb(var(--muted-foreground))" />
            <Text className="text-muted-foreground text-base mt-4 text-center">
              No results found for your search criteria
            </Text>
            <Pressable
              className="mt-4 active:opacity-70"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              <Text className="text-primary text-base">
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}

