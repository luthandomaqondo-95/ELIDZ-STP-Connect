import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NewsScreen() {
  const news = [
    {
      id: '1',
      title: 'ELIDZ AGM Reflects on 2024/25 Performance and Reaffirms Commitment to Vision 2030',
      category: 'Corporate',
      date: 'November 13, 2025',
      excerpt: 'ELIDZ held its Annual General Meeting, presenting 2024/25 financial year performance highlights and strategic developments driving industrial growth.',
      image: 'trending-up',
    },
    {
      id: '2',
      title: 'ELIDZ Marks 10 Years of Clean Audits – A Decade of Excellence, Integrity, and Impact',
      category: 'Achievements',
      date: 'August 15, 2025',
      excerpt: 'ELIDZ announces its 10th consecutive clean audit opinion from the Auditor General of South Africa for the 2024/25 financial year.',
      image: 'award',
    },
    {
      id: '3',
      title: 'ELIDZ-STP Hosts an Innovative Training Workshop on Electric Vehicle Fundamentals',
      category: 'Training',
      date: 'March 27, 2025',
      excerpt: 'ELIDZ-STP hosted a five-day Professional Certificate of Competency in Fundamentals of Electric Vehicles training workshop.',
      image: 'zap',
    },
    {
      id: '4',
      title: 'THE ELIDZ Science and Technology Park Head Elected as IASP Africa Division President',
      category: 'Achievements',
      date: 'December 3, 2024',
      excerpt: 'Ludwe Macingwane, Head of ELIDZ-STP, has been elected as the new Africa Division President of the International Association of Science Parks.',
      image: 'star',
    },
    {
      id: '5',
      title: 'MEC FOR DEDEAT UNVEILS NEW 4IR COMPUTER LABORATORY AT UMTIZA HIGH SCHOOL',
      category: 'Community',
      date: 'October 31, 2024',
      excerpt: 'MEC for DEDEAT unveiled a state-of-the-art Community-Based Digital (4IR) Computer Laboratory at Umtiza High School in partnership with Microsoft South Africa.',
      image: 'monitor',
    },
    {
      id: '6',
      title: 'East London IDZ STP in partnership with UNISA launches Eastern Cape Innovation Challenge 2025',
      category: 'Partnership',
      date: 'Recent',
      excerpt: 'ELIDZ-STP in partnership with UNISA launched the Eastern Cape Innovation Challenge 2025, a province-wide initiative to drive socio-economic innovation.',
      image: 'users',
    },
  ];

  const getCategoryColorClass = (category: string): string => {
    switch (category) {
      case 'Corporate':
        return 'bg-primary';
      case 'Achievements':
        return 'bg-accent';
      case 'Training':
        return 'bg-secondary';
      case 'Community':
        return 'bg-primary';
      case 'Partnership':
        return 'bg-secondary';
      case 'Events':
        return 'bg-accent';
      default:
        return 'bg-primary';
    }
  };

  return (
    <ScreenScrollView>
      <Text className="text-muted-foreground text-base mb-6">
        Stay updated with the latest news and announcements from ELIDZ-STP
      </Text>

      {news.map((item) => (
        <Pressable
          key={item.id}
          className="flex-row p-4 rounded-xl mb-3 bg-card active:opacity-90 shadow-sm"
          onPress={() => router.push(`/news-detail?id=${item.id}`)}
        >
          <View className={`w-14 h-14 rounded-xl justify-center items-center ${getCategoryColorClass(item.category)}`}>
            <Feather name={item.image as any} size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-center">
              <View className={`px-3 py-1 rounded-lg ${getCategoryColorClass(item.category)}`}>
                <Text className="text-white text-xs">{item.category}</Text>
              </View>
              <Text className="text-muted-foreground text-xs">
                {item.date}
              </Text>
            </View>
            <Text className="text-base font-semibold mt-2 text-foreground">
              {item.title}
            </Text>
            <Text className="text-muted-foreground text-sm mt-2" numberOfLines={2}>
              {item.excerpt}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScreenScrollView>
  );
}

