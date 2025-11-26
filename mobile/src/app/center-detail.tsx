import React from 'react';
import { View, Pressable, Linking, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { colors } = useTheme();

  const centerData: Record<string, any> = {
    '1': {
      description: 'The East London Industrial Development Zone (ELIDZ) Consulting and Analytical Services (CAS) Laboratory is an accredited laboratory by the South African National Accreditation System (SANAS), accreditation No T 0626. The ELIDZ CAS Laboratory, boasting state of the art equipment, enhances the analytical testing capabilities for water, food, and soil. The laboratory adheres to government and industry regulations, which establish guidelines for acceptable pathogenic and non-pathogenic micro-organisms in specific samples and food groups. It also ensures compliance by following green drop specifications and adhering to SANAS 241, which serves as a benchmark for environmental testing. The ELIDZ CAS Laboratory is staffed with skilled chemists, biochemists, and microbiologists, offering a wide spectrum of chemical and microbiological analysis services.',
      services: [
        'Surface water analysis (Rivers, lakes, dams, pools)',
        'Groundwater analysis (Boreholes, wells, spring water)',
        'Drinking water analysis (Tap water, Bottled water, treated surface or ground water)',
        'Waste water analysis',
        'Inorganic analysis – major cations/anions',
        'Physico chemical analysis',
        'Organic analysis',
        'Microbiological analysis',
        'Borehole water quality testing and analysis',
        'Metal Scan',
        'Chemical Analysis',
        'Microbiology Analysis',
      ],
      equipment: [
        'State-of-the-art analytical equipment',
        'SANAS accredited testing facilities (Accreditation No T 0626)',
        'Equipment compliant with SANAS 241 standards',
        'Green drop specification compliant systems',
        'Advanced chemical and microbiological analysis instruments',
      ],
      contact: {
        name: 'Kaylene Bell',
        phone: '+27 43 702 8217',
      },
    },
    '2': {
      description: 'The Science and Technology Park (STP), a component of the East London Industrial Development Zone (EL IDZ), has established the Design Centre to assist entrepreneurs, researchers and industry in rapid prototyping. The facility offers prototype support services through laser cutting and engraving, 3D printing, and machine milling (desktop and CNC Lathe). Whether you are looking for a faster way of producing your ideas into reality or you are just wanting to get creative and 3D print, laser cut or laser engrave onto wood, metals, and plastics for your next assignment – we are here to help.',
      services: [
        '3D Printing - Additive manufacturing for parts and tools at rates much lower than traditional machining',
        'Laser Cutting / Engraving - Intricate detail on wood, acrylic, plastics and metals for single items to large production runs',
        'CNC Lathe Machining - Shaping of metal and other solid materials from solid blocks, pre-machined parts, castings or forgings',
        'Training Programs - AutoCAD, 3D Printing, Laser Cutting, and Machining (desktop milling and CNC Lathe)',
      ],
      equipment: [
        'Multiple 3D printers with expertise to ensure desired end results',
        'Laser cutter / engraver for wood, acrylic, plastics and metals',
        'CNC Lathe machines with expert machine operator support',
        'Desktop machining equipment (desktop milling)',
      ],
      contact: {
        name: 'Mqondisi Goba',
        phone: '+27 43 101 0195',
      },
    },
    '5': {
      description: 'In response to the current and expected future demand and growth within the "Green Economy" of South Africa, the Renewable Energy Centre of Excellence was set up within the East London Industrial Development Zone Science and Technology Park (ELIDZ) in partnership with Master Artisan Academy (SA). The centre will be a catalyst and leader in the development and growth of skills within the sector, not only within the Eastern Cape, but also South Africa and into Africa. The Renewable Energy Centre of Excellence is based at the ELIDZ within the STP unit.',
      services: [
        'Training for qualified artisans wanting to up-skill towards renewable energy',
        'Career preparation programs for school leavers entering renewable energy',
        'Up-skilling for skilled workers to participate in construction and maintenance phases of renewable projects',
        'Training and development for management and decision-makers in public and private sector',
        'Support for current RIPPP providers and potential investors',
        'Prototyping services and facilities',
      ],
      equipment: [
        'Renewable energy training facilities',
        'Prototyping equipment and laboratories',
        'State-of-the-art training infrastructure',
        'Partnership resources with Master Artisan Academy (SA)',
        'Skills development and certification facilities',
      ],
    },
    '6': {
      description: 'In today\'s globalised knowledge economy, access to the best ideas, capabilities and technologies has become crucial for organisations around the world. Initially, innovation and technology advancement within various organisations (private & public) has traditionally depended on a small network of individuals and researchers within their network. This has restricted the supply chain to the usual solution providers and subsequently limited the potential for accessing new ideas for addressing persistent challenges or exploiting opportunities to increase efficiency, growth and in essence the level of early-stage entrepreneurial activity in Southern Africa. Piloted by the ELIDZ Science and Technology Park in 2013, Connect + Solve is a trusted online open innovation platform that enables private and public organisations to solve business needs by accessing a wider and more \'open\' network of innovative solutions in the Eastern Cape, South Africa and beyond. With Connect + Solve, the innovation process within government departments and private companies is accelerated while creating a channel for innovative small enterprises to break into the supply chain of large organisations.',
      services: [
        'Solve Challenges - Post business needs as challenges to attract solution providers from multiple industries outside traditional networks',
        'Showcase Technology - Display unique and innovative ideas/concepts/products as technology demonstrators to attract customers, solution seekers, venture capitalists and research partners',
        'Inbound Open Innovation - Collaborate with suppliers and customers by integrating external knowledge, monitoring the external environment for existing solutions',
        'Outbound Open Innovation - Seek external organisations with suitable business models to commercialise technology, especially when technology is a spin-off or when businesses cannot realise sufficient revenue in their own market',
        'Intellectual Property Management - Secure IP before submission, with clear ownership retention for registered users',
      ],
      equipment: [
        'Online open innovation platform',
        'Challenge posting and response system',
        'Technology showcase capabilities',
        'Knowledge flow management tools',
        'IP protection and management systems',
      ],
      contact: {
        name: 'Kaylene Bell',
        phone: '+27 43 702 8217',
        website: 'Visit our website',
      },
      additionalInfo: 'By submitting a response to a Challenge or a Technology Offer, you acknowledge that the submission does not and will not be deemed to contain any confidential information. ELIDZ STP requires that any submission via this platform does not contain proprietary, confidential, or enabling information unless your Intellectual Property has been secured appropriately. Registered users responding to Challenges or submitting Technology Offers retain ownership of all intellectual property rights that were held prior to their submission.',
    },
    '7': {
      description: 'The Science & Technology Park is an innovation driven entity within the East London IDZ. The aim of this park is to nurture new innovative companies thus enhancing industrial development, further improving economic development. ELIDZ STP provides high quality hot desk space to knowledge-based enterprises through the INNOSPACE services. The INNOSPACE is a collaborative workspace that involves multiple workers using a single physical workstation or surface during different times. Communal facilities such as a reception and meeting rooms are available for all residents to use. This workspace is designed to stimulate creativity and allow for effective and efficient exchange of ideas. We have seven (7) available hot desk spaces available for booking at all times.',
      services: [
        'Hot Desk Spaces - Seven (7) available hot desk spaces for booking, collaborative workspace for knowledge-based enterprises',
        'Boardroom - Maximum seating of 14 people, 40.2 m², available for hire on per hour basis, suitable for media interviews or business engagements',
        'Project Room - Six (6)-seater boardroom, 26.1 m², available for hire on per hour basis, perfect for mid-sized meetings',
        'STP Meeting Lounge - Accommodates up to five (5) people, 26-33 m², ideal for small discussions with modern soft seating',
        'Informal Lounge - Bright and comfortable space for unstructured sessions, lunch area, includes pool table and play station',
      ],
      equipment: [
        'Projector and presentation equipment',
        'Presentation clipboard with markers',
        'ISDN line',
        'White board',
        'Telephone',
        'Video conferencing facilities',
        'Wireless connection',
      ],
      contact: {
        name: 'Kaylene Bell',
        phone: '+27 43 702 8217',
        cell: '+27 76 511 5931',
        email: 'kaylene@elidz.co.za',
      },
      additionalInfo: 'Value Added Features & Benefits: 24/7 security access and CCTV cameras, secure parking, dedicated STP Management Team, outdoor chess set. Location: Situated in Lower Chester Road, in the beautiful and leafy suburb of Sunnyridge, East London. The STP is only about five (5) minute drive from the East London Airport, away from the crowded CBD and its heavy traffic.',
    },
    '8': {
      description: 'Tenants Chemin, ECITI and the Cortex Hub have well established reputations for offering start-ups the assistance they need to become fully fledged businesses. Should your business not fall within the services offered by these incubators, the ELIDZ STP will endeavor to find the right incubation support for your start-up.',
      services: [
        'Chemin - Business incubator specialising in downstream chemicals industry. Provides lab space, testing facilities, manufacturing equipment, office space, access to seed finance and collaboration with universities, industrial experts, financing agencies and government departments. Website: www.chemin.co.za',
        'ECITI - Business incubator specialising in Information Communications Technology (ICT) and Film sector. Assists early stage development through infrastructure, mentorship and training, linkages to industry and academic networks. Established as a non-profit organisation by the ECDC in 2004. Website: www.eciti.co.za',
        'The Cortex Hub - Technology incubator and accelerator that helps young entrepreneurs build something that people want and build great teams and businesses. Provides early stage funding for startups and offers both Incubation and Acceleration programmes. Website: www.thecortexhub.com',
        'ECNGOC - The Eastern Cape NGO Coalition is a representative structure of Civil Society organisations supporting NGOs and CBOs throughout the Eastern Cape Province. Services include NGO Legislation & Compliance, Asset Based Community Driven Development (ABCD), and sustainability of the NGO Sector. Website: ecngoc.co.za',
      ],
      equipment: [
        'Incubation infrastructure and facilities',
        'Mentorship and training programs',
        'Access to seed finance and funding',
        'Industry and academic network linkages',
        'Lab space and testing facilities (Chemin)',
        'Office space and manufacturing equipment',
        'Early stage funding programs (Cortex Hub)',
      ],
      additionalInfo: 'Each incubator specializes in different sectors: Chemin focuses on chemical technology, ECITI on ICT and film, Cortex Hub on technology startups, and ECNGOC on NGO support and community development. The ELIDZ STP works to match startups with the appropriate incubator based on their business needs and sector focus.',
    },
    '9': {
      description: 'The Regional Innovation Networking Platform (RINP) is an initiative of the Department of Science & Innovation (DSI) in support of Eastern Cape innovation community. ELIDZ Science and Technology Park is acting as an agency that coordinates, supports and maintains, the development of RINP facilitating the meeting and the working together of the Multiple Helix members of the Eastern Cape province from different institutions. The steering committee members are led by ELIDZ Science and Technology Park as Lead Facilitator.',
      services: [
        'STIMULATE - Bridging the gap between research and industry, highlighting comparative and competitive advantages, identifying gaps and opportunities, creating synergies through networking',
        'SUPPORT - Creating linkages between role players, facilitating an enabling environment, hosting relevant workshops, assisting with access to finance, lobbying for innovation seed funding',
        'PROMOTE - Providing a united voice and approach to innovation, publicising success stories, publicising opportunities and gaps, organising relevant networking events and training events',
        'Eastern Cape Innovation Challenge (ECIC) - Cultivating high-impact, responsible, competent, and confident young entrepreneurs with innovative solutions for local service delivery or societal challenges',
        'Networking Events - Regular networking events and calendar to facilitate collaboration',
        'Training Programs - 3D printing and Laser Engraving/cutting, Solar Energy PV Rooftop Installation (SAPVIA Accredited), Tooling manufacturing',
      ],
      equipment: [
        'Regional innovation networking infrastructure',
        'Workshop and training facilities',
        'Networking event coordination systems',
        'Innovation challenge program management',
        'Multiple Helix collaboration platforms',
      ],
      additionalInfo: 'RINP Focus Areas: Automotive and related component manufacturing (including tooling and composites), Energy (with emphasis on renewable and alternative sources), Agriculture (Aquaculture, Agro-Processing, indigenous medicines/pharmaceuticals, wastewater treatment), Advanced Manufacturing, and ICT. RINP programs fall into three main areas: Fostering a culture of innovation; Lobbying and facilitating increased investment in R&D and Innovation; Supporting and facilitating the linking of knowledge generators to regional socio-economic development efforts.',
    },
  };

  const data = centerData[id] || centerData['1'];

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
          <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
            {name || 'Center Details'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.xl,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.body, { color: colors.text }]}>
            {data.description}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          marginBottom: Spacing.xl,
        }}>
        <View style={{ flex: 1, marginRight: (id === '1' || id === '2' || id === '5' || id === '6' || id === '7' || id === '8') ? Spacing.lg : 0 }}>
        <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>Services & Capabilities</Text>
          {React.Children.toArray(data.services.map((service: string) => {
            const incubatorInfo = parseIncubatorService(service);
            return (
              <ServiceRow
                service={service}
                incubatorInfo={incubatorInfo}
                colors={colors}
                onOpenWebsite={handleWebsite}
              />
            );
          }))}
        </View>
        {/* Show image on the right for specific centers */}
        {id === '1' && (
          <View style={{
            width: 300,
            height: 400,
            borderRadius: BorderRadius.card,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}>
            <Image
              source={analyticalLabImage}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
        )}
        {id === '2' && (
          <View style={{
            width: 300,
            height: 490,
            borderRadius: BorderRadius.card,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}>
            <Image
              source={designCentreImage}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
        )}
        {id === '5' && (
          <View style={{
            width: 300,
            height: 450,
            borderRadius: BorderRadius.card,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}>
            <Image
              source={renewableEnergyImage}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
        )}
        {id === '6' && (
          <View style={{
            width: 300,
            height: 490,
            borderRadius: BorderRadius.card,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}>
            <Image
              source={connectSolveImage}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
        )}
        {id === '7' && (
          <View style={{
            width: 300,
            height: 490,
            borderRadius: BorderRadius.card,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}>
            <Image
              source={innospaceImage}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
        )}
        {id === '8' && (
          <View style={{
            width: 300,
            alignSelf: 'flex-start',
          }}>
            <View style={{
              flexDirection: 'column',
            }}>
              <View style={{
                width: '100%',
                marginBottom: Spacing.lg,
                padding: Spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}>
                <Image
                  source={cheminLogo}
                  style={{
                    width: '100%',
                    height: 100,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View style={{
                width: '100%',
                marginBottom: Spacing.lg,
                padding: Spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}>
                <Image
                  source={ecitiLogo}
                  style={{
                    width: '100%',
                    height: 100,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View style={{
                width: '100%',
                marginBottom: Spacing.lg,
                padding: Spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}>
                <Image
                  source={cortexHubLogo}
                  style={{
                    width: '100%',
                    height: 100,
                    resizeMode: 'contain',
                  }}
                />
              </View>
              <View style={{
                width: '100%',
                padding: Spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
              }}>
                <Image
                  source={ecngocLogo}
                  style={{
                    width: '100%',
                    height: 100,
                    resizeMode: 'contain',
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ marginBottom: Spacing.xl }}>
        <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>Equipment & Facilities</Text>
        {React.Children.toArray(data.equipment.map((item: string) => (
          <EquipmentRow
            item={item}
            colors={colors}
          />
        )))}
      </View>

      {data.contact && (
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.xl,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Contact Information</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Feather name="user" size={18} color={colors.primary} />
            <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>
              {data.contact.name}
            </Text>
          </View>
          <Pressable
            onPress={() => handlePhoneCall(data.contact.phone)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Spacing.md,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="phone" size={18} color={colors.primary} />
            <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1 }]}>
              Tel: {data.contact.phone}
            </Text>
          </Pressable>
          {data.contact.cell && (
            <Pressable
              onPress={() => handlePhoneCall(data.contact.cell)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="smartphone" size={18} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1 }]}>
                Cell: {data.contact.cell}
              </Text>
            </Pressable>
          )}
          {data.contact.email && (
            <Pressable
              onPress={() => handleEmail(data.contact.email)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1 }]}>
                {data.contact.email}
              </Text>
            </Pressable>
          )}
          {data.contact.website && (
            <Pressable
              onPress={() => handleWebsite('https://www.connectandsolve.co.za')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="globe" size={18} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md, flex: 1 }]}>
                {data.contact.website}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {data.additionalInfo && (
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.xl,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Intellectual Property</Text>
          <Text style={[Typography.body, { color: colors.text, lineHeight: 22 }]}>
            {data.additionalInfo}
          </Text>
        </View>
      )}

      <View style={{
        padding: Spacing.xl,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.xl,
        backgroundColor: colors.primary,
        ...Shadow.card,
      }}>
        <Text style={[Typography.h3, { color: '#FFFFFF', marginBottom: Spacing.sm }]}>
          Get in Touch
        </Text>
        <Text style={[Typography.caption, { color: '#FFFFFF', opacity: 0.9, marginBottom: Spacing.lg }]}>
          {data.contact 
            ? `Contact ${data.contact.name} to learn more about how this center can support your innovation`
            : 'Contact us to learn more about how this center can support your innovation'}
        </Text>
        {data.contact && (
          <Pressable
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderRadius: BorderRadius.button,
              backgroundColor: '#FFFFFF',
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => handlePhoneCall(data.contact.phone)}
          >
            <Feather name="phone" size={18} color={colors.primary} />
            <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.sm, fontWeight: '600' }]}>
              Request a Quote
            </Text>
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
  <View style={{
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  }}>
    <Feather name="check-circle" size={20} color={colors.secondary} />
    <View style={{ marginLeft: Spacing.md, flex: 1 }}>
      {incubatorInfo ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Pressable onPress={() => onOpenWebsite(incubatorInfo.website)}>
            <Text style={[Typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
              {incubatorInfo.name}
            </Text>
          </Pressable>
          <Text style={[Typography.body]}>
            {service.replace(new RegExp(`^${incubatorInfo.name}\\s*-`), ' -').replace(/Website:\s*www\.\S+/i, '')}
          </Text>
        </View>
      ) : (
        <Text style={[Typography.body]}>
          {service}
        </Text>
      )}
    </View>
  </View>
);

type EquipmentRowProps = {
  item: string;
  colors: ThemeColors;
};

const EquipmentRow: React.FC<EquipmentRowProps> = ({ item, colors }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  }}>
    <Feather name="settings" size={20} color={colors.primary} />
    <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>
      {item}
    </Text>
  </View>
);
