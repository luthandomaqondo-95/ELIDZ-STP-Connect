import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { NewsService, News } from '@/services/news.service';

function NewsDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      if (!id) {
        setError('News ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const newsItem = await NewsService.getNewsById(id);
        if (newsItem) {
          setNews(newsItem);
        } else {
          setError('News article not found');
        }
      } catch (err: any) {
        console.error('Error loading news:', err);
        setError(err.message || 'Failed to load news article');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [id]);

  if (loading) {
    return (
      <ScreenScrollView>
        <View style={{ padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
            Loading news article...
          </Text>
        </View>
      </ScreenScrollView>
    );
  }

  if (error || !news) {
    return (
      <ScreenScrollView>
        <View style={{ padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <Feather name="alert-circle" size={48} color={colors.error || '#EF4444'} />
          <Text style={[Typography.h3, { color: colors.error || '#EF4444', marginTop: Spacing.lg, textAlign: 'center' }]}>
            {error || 'News article not found'}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' }]}>
            Please try again later
          </Text>
        </View>
      </ScreenScrollView>
    );
  }

  // Fallback category mapping (can be removed when category is added to DB)
  const getCategoryFromTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('agm') || titleLower.includes('performance') || titleLower.includes('financial')) {
      return 'Corporate';
    }
    if (titleLower.includes('audit') || titleLower.includes('achievement') || titleLower.includes('elected') || titleLower.includes('president')) {
      return 'Achievements';
    }
    if (titleLower.includes('training') || titleLower.includes('workshop') || titleLower.includes('certificate')) {
      return 'Training';
    }
    if (titleLower.includes('community') || titleLower.includes('school') || titleLower.includes('laboratory')) {
      return 'Community';
    }
    if (titleLower.includes('partnership') || titleLower.includes('unisa') || titleLower.includes('challenge')) {
      return 'Partnership';
    }
    return 'News';
  };

  const category = news.category || getCategoryFromTitle(news.title);

  // Legacy news data for backward compatibility (can be removed once all news is in DB)
  const legacyNewsItems: Record<string, any> = {
    '1': {
      id: '1',
      title: 'ELIDZ AGM Reflects on 2024/25 Performance and Reaffirms Commitment to Vision 2030',
      category: 'Corporate',
      date: 'November 13, 2025',
      author: 'ELIDZ Communications',
      image: 'trending-up',
      content: `Today, 13 November 2025, the East London Industrial Development Zone (ELIDZ) held its Annual General Meeting (AGM), it presented its 2024/25 financial year performance highlights and strategic developments driving industrial growth and investment in the Eastern Cape.

The AGM marked the conclusion of ELIDZ's Vision 2025 strategy, a five-year programme that has strengthened the Zone's role as a hub of industrial growth, innovation, and socio-economic development in the Eastern Cape.

Financial year 2024/25 demonstrated ELIDZ's resilience and strategic maturity, achieving 78% of its annual performance targets, maintaining a BBBEE Level 3 rating, and securing its 10th consecutive clean audit. The Zone has attracted R4.6 billion in new private sector investments, significantly exceeding the annual target of R500 million. These investments include key sectors such as ICT, automotive, agro-processing, and renewable energy, creating over 5,000 operational jobs and contributing to an 11.7% growth in industrial turnover and export-oriented production, well above the target.

Through its Science and Technology Park (STP), ELIDZ developed four prototypes and commercialised two innovations, reinforcing technology transfer and integration of SMEs into regional value chains. The Zone maintained five active incubators, nurturing start-ups and small businesses to strengthen their industrial participation. Over 300 beneficiaries received skills training in emerging fields such as ICT, renewable energy, and advanced manufacturing, equipping local talent for future industrial demands.

In the 2024/25 financial year, ELIDZ strengthened its commitment to inclusive growth and socio-economic transformation through 20 Corporate Social Investment (CSI) initiatives. These projects directly supported education, youth empowerment, and the growth of local enterprises, ensuring that the benefits of industrial development reach the wider Eastern Cape community.

Through its SMME Development Programme, ELIDZ upgraded 11 emerging businesses by at least two CIDB levels, equipping them with the technical and operational capacity to participate in larger industrial projects. ELIDZ's commitment to nurturing future talent is demonstrated through its internship and bursary programmes, which supported over 55 interns and 13 students from the Eastern Cape during the year.

As ELIDZ execute the Vision 2030 strategy, the Zone will deepen its commitment to environmental, social, and governance (ESG) excellence, embedding sustainability across all operations.`,
    },
    '2': {
      id: '2',
      title: 'ELIDZ Marks 10 Years of Clean Audits – A Decade of Excellence, Integrity, and Impact',
      category: 'Achievements',
      date: 'August 15, 2025',
      author: 'ELIDZ Communications',
      image: 'award',
      content: `The East London Industrial Development Zone (ELIDZ) is proud to announce its 10th consecutive clean audit opinion from the Auditor General of South Africa for the 2024/25 financial year. This achievement reflects a decade of unwavering discipline to sound financial management, compliance with legislation, governance and operational transparency, and a deep commitment to public accountability.

This means ELIDZ received a financially unqualified audit with no material findings, as confirmed by the Auditor-General.

Clean audits are a powerful indicator of institutional integrity and compliance with public sector financial regulations. Achieving this level of consistency over ten years is a rare accomplishment and positions ELIDZ as a national benchmark for good governance in the economic development space.

"This milestone is not just a reflection of our financial discipline," said Tembela Zweni, Chief Executive Officer of ELIDZ. "It speaks to the culture of accountability and professionalism that underpins everything we do, from strategic planning to implementation. It also affirms our readiness to support high-impact investment with credibility and confidence."

Echoing this sentiment, ELIDZ Chief Financial Officer Gift Matengambiri added, "Ten clean audits in a row is no small accomplishment. It is the result of robust internal controls, a committed finance team and a shared organisational culture of doing things right. This achievement reinforces our reputation as a reliable and transparent institution."

As a catalyst for industrial development and investment attraction in the Eastern Cape, ELIDZ continues to deliver on its mandate with credibility and impact. The organisation's ability to maintain clean audits year after year strengthens investor confidence and affirms its role in driving economic transformation.

This milestone comes as ELIDZ expands its strategic focus across targeted high growth areas: Automotive, Agri-Industry, Digital Economy, Sustainable Energy, Advanced Manufacturing, Logistics, and Aquaculture. It also aligns with the organisation's Vision 2030, which aims to drive inclusive growth, sustainability and innovation across the region.`,
    },
    '3': {
      id: '3',
      title: 'ELIDZ-STP Hosts an Innovative Training Workshop on Electric Vehicle Fundamentals',
      category: 'Training',
      date: 'March 27, 2025',
      author: 'ELIDZ Communications',
      image: 'zap',
      content: `The East London Industrial Development Zone, Science and Technology Park (ELIDZ-STP) recently hosted a five-day Professional Certificate of Competency in Fundamentals of Electric Vehicles (EV) training workshop. The programme is designed to upskill professionals, entrepreneurs, and the unemployed in the automotive sector by providing in-depth knowledge and practical experience in EV technology.

The workshop took place from 10 – 14 March 2025 at the ELIDZ-STP, drawing significant interest from across the Eastern Cape. Out of over 800 applications, 30 carefully selected participants were chosen to attend, ensuring a focused and impactful training experience.

These participants included engineers, mechanics, auto-electricians, and other professionals and entrepreneurs already working in or looking to transition into the EV sector. Their enthusiasm reflected a growing interest in electric mobility and the need for specialised skills in this rapidly evolving industry.

The workshop ensured that participants gain a well-rounded understanding of electric vehicles. Training was conducted by an industry expert from the Engineering Institute of Technology (EIT), an Australian-based organisation recognised by the South African Qualifications Authority (SAQA).

The training covered a broad spectrum of EV technology fundamentals, including:
• Introduction to EVs: Understanding electric, hybrid, and fuel cell vehicles
• Vehicle Components: EV layouts, power electronics, batteries, and charging infrastructure
• Electric Propulsion Systems: Motors, energy consumption, and performance
• Hybrid Drive Trains: Electrical coupling, control strategies, and design principles
• Safety & Hazard Management: High-voltage precautions, safe work procedures, and hazard mitigation

Participants engaged in interactive learning exercises, applying their newly acquired knowledge to real-world scenarios. Participants in due course will be issued with industry-recognised professional certificates. This certification is a critical step in preparing South Africa's workforce to meet the increasing demand for electric vehicles and the infrastructure needed to support them.

The initiative aligns with the South African Automotive Masterplan (SAAM) 2035, which highlights skills development as a key strategic pillar in achieving the country's long-term objectives for the automotive industry. Developing expertise in EV technology is essential as South Africa moves toward a sustainable, low-carbon economy.

With more than 120 automotive manufacturers operating in the Eastern Cape, the sector plays a pivotal role in the region's economy. The province is home to four major automotive manufacturers, with three based in Nelson Mandela Metropolitan Municipality and one in Buffalo City Metropolitan Municipality. As the industry shifts toward electric mobility, the ELIDZ-STP aims to ensure that local professionals and entrepreneurs remain competitive and well-equipped for emerging opportunities.`,
    },
    '4': {
      id: '4',
      title: 'THE ELIDZ Science and Technology Park Head Elected as IASP Africa Division President',
      category: 'Achievements',
      date: 'December 3, 2024',
      author: 'ELIDZ Communications',
      image: 'star',
      content: `Ludwe Macingwane, the Head of the East London Industrial Development Zone (ELIDZ) Science and Technology Park has been elected as the new Africa Division President of the International Association of Science Parks (IASP).

Macingwane is the second South African to be elected and the first black woman in the country to occupy this important office. She will officially assume her role on the 11 December 2024, taking over from the outgoing President, Eng. John Tanui from Kenya. Over the next two years, Macingwane will represent the African region on the IASP International Board of Directors on the various platforms of the IASP.

This achievement highlights the growing recognition of Africa's role in global innovation, a cause championed by IASP since its establishment in 1984. Today, IASP connects 350 members across 77 countries, representing over 115,000 companies. The organisation has hosted 42 world conferences and 186 regional events, maintaining a strong presence through its six regional divisions: African, Asia Pacific, European, Latin American, North American, and West Asia North Africa (WANA). With offices in Málaga, Spain, and Beijing, China, IASP continues to serve as a hub for global innovation leadership.

Macingwane is the ideal candidate to lead the Africa Division of the IASP as she has been instrumental in propelling the ELIDZ Science and Technology Park to greater heights. For instance, under her leadership, the ELIDZ Science and Technology Park has achieved international recognition, notably as South Africa's sole finalist in the 2024 Inspiring Solutions Awards held during the IASP World Conference in Nairobi, Kenya. This recognition underscores the ELIDZ Science and Technology Park's commitment to innovation, collaboration, and global benchmarking.

"I am truly honoured to be elected. The election demonstrates my colleagues' confidence in my ability to lead a diverse group of passionate professionals. I am truly humbled by the honour and promise to do my very best to achieve the goals of the African division as they relate to innovation," Macingwane said.

Join us in congratulating Macingwane on this remarkable achievement. Her appointment reflects her visionary leadership, dedication, and pivotal role in advancing innovation across Africa and beyond.`,
    },
    '5': {
      id: '5',
      title: 'MEC FOR DEDEAT UNVEILS NEW 4IR COMPUTER LABORATORY AT UMTIZA HIGH SCHOOL',
      category: 'Community',
      date: 'October 31, 2024',
      author: 'ELIDZ Communications',
      image: 'monitor',
      content: `Today marked a significant milestone as the MEC for the Department of Economic Development, Environmental Affairs, and Tourism (DEDEAT), Ms Nonkqubela Ntomboxolo Pieters, joined key stakeholders, educators, and learners at Umtiza High School in Santa Settlement, East London, to unveil a state-of-the-art Community-Based Digital (4IR) Computer Laboratory. This pioneering initiative, facilitated through the office of the Eastern Cape Premier Lubabalo Oscar Mabuyane and led by the East London Industrial Development Zone (ELIDZ) in partnership with Microsoft South Africa and Deviare, an ICT small business, aims to boost digital literacy, bridge the digital divide, and empower youth in the Eastern Cape.

This project represents the first phase of a five-year Corporate Social Investment (CSI) initiative, with a total investment of R550,000, aimed at supporting five selected schools in the region. The ELIDZ contributed R200,000 to the project, with Microsoft South Africa covering the remaining R350,000. Housed in a repurposed shipping container, this innovative digital lab is fully equipped with 30 laptops, internet connectivity, and backup power, creating a hub of technological advancement and educational opportunity for Umtiza High School and the surrounding community.

"The ELIDZ is proud to partner with Umtiza High School as we work towards equipping young people with the skills to actively participate in technology-driven industries," stated Professor Mlungisi Makhalima, Chairperson of the ELIDZ Board of Directors. He emphasised that this initiative would help reduce the digital skills gap in the Eastern Cape, aligning with ELIDZ's industrial development focus and growing investment in the automotive sector.

Speaking on behalf of Microsoft South Africa, Mr Asif Valley, a key donor and partner, expressed Microsoft's commitment to driving digital inclusion in underserved communities. "This partnership represents a step forward in empowering youth with digital skills that are critical for todays and tomorrow's workforce. By investing in digital education, Microsoft South Africa is helping to lay the foundation for a technology-savvy generation that will drive the South African economy forward."

During her keynote address, the MEC for DEDEAT, Ms Pieters, emphasised the importance of safeguarding this new resource, stating, "I urge the community members to safeguard this state-of-the-art facility." She highlighted that, "this significant project is part of implementing the pillars of the Eastern Cape economy".

The programme will provide digital literacy training to 90 Grade 11 students in three cohorts, each session spanning three months. Upon successful completion, each student will receive a digital literacy certificate, fostering their career readiness and strengthening the local talent pipeline for technology-driven industries, including the automotive sector.

This project also supports long-term community development goals. A Memorandum of Understanding (MOU) signed by all parties ensures sustainability and operational continuity, marking a milestone in the Eastern Cape's socio-economic growth strategy. In addition to empowering learners, the project includes accredited training opportunities for Umtiza High School's educators to improve teaching quality through technology integration.`,
    },
  };

  const categoryColors: Record<string, string> = {
    Corporate: colors.primary,
    Achievements: colors.accent,
    Training: colors.secondary,
    Community: colors.primary,
    Partnership: colors.secondary,
    Events: colors.accent,
    News: colors.primary,
  };

  const getCategoryIcon = (cat?: string): keyof typeof Feather.glyphMap => {
    switch (cat) {
      case 'Corporate':
        return 'trending-up';
      case 'Achievements':
        return 'award';
      case 'Training':
        return 'zap';
      case 'Community':
        return 'monitor';
      case 'Partnership':
        return 'users';
      case 'Events':
        return 'calendar';
      default:
        return 'file-text';
    }
  };

  return (
    <ScreenScrollView>
      <View style={{
        padding: Spacing.xl,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: categoryColors[category] || colors.primary,
      }}>
        {category && (
          <View style={{
            alignSelf: 'flex-start',
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.xs,
            borderRadius: BorderRadius.button,
            backgroundColor: colors.buttonText,
          }}>
            <Text style={[Typography.small, { color: categoryColors[category] || colors.primary }]}>
              {category}
            </Text>
          </View>
        )}
        <View style={{
          marginTop: Spacing.lg,
          alignItems: 'center',
        }}>
          {news.image_url ? (
            <Image
              source={{ uri: news.image_url }}
              style={{ width: 120, height: 120, borderRadius: BorderRadius.card }}
              resizeMode="cover"
            />
          ) : (
            <Feather name={getCategoryIcon(category)} size={48} color={colors.buttonText} />
          )}
        </View>
        <Text style={[Typography.h2, { color: colors.buttonText, marginTop: Spacing.lg }]}>
          {news.title}
        </Text>
      </View>

      <View style={{
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: colors.backgroundDefault,
        ...Shadow.card,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: Spacing.sm,
          }}>
            <Feather name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.xs }]}>
              {news.formattedDate || new Date(news.published_at).toLocaleDateString()}
            </Text>
          </View>
          {news.author && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: Spacing.sm,
            }}>
              <Feather name="user" size={16} color={colors.textSecondary} />
              <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.xs }]}>
                {news.author.name || 'ELIDZ Communications'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: colors.backgroundDefault,
        ...Shadow.card,
      }}>
        <Text style={[Typography.body, { color: colors.text, lineHeight: 24 }]}>
          {news.content}
        </Text>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(NewsDetailScreen);

