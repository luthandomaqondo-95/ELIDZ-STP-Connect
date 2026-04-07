import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Linking, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { TenantLogo } from '@/components/TenantLogo';
import { tenantService } from '@/services/tenant.service';
import { Tenant } from '@/types';
import { TabsLayoutHeader } from '@/components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// ── Small reusable info row ────────────────────────────────────────────────────
function InfoRow({ icon, label, value, accent }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label?: string;
  value: string;
  accent: string;
}) {
  return (
    <View className="flex-row items-start">
      <Feather name={icon} size={17} color={accent} style={{ marginTop: 2 }} />
      <View className="ml-2.5 flex-1">
        {label ? <Text className="text-xs text-muted-foreground mb-0.5">{label}</Text> : null}
        <Text className="text-sm text-foreground leading-[20px]">{value}</Text>
      </View>
    </View>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, accent, children }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <View className="p-4 rounded-2xl mb-3 bg-card border border-border shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
          <Feather name={icon} size={16} color={accent} />
        </View>
        <Text className="text-base font-bold text-foreground ml-2.5">{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function TenantDetailScreen() {
  const { colors } = useTheme();
  const accent = colors.accent;
  const params = useLocalSearchParams<{ tenant?: string; name?: string; id?: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      if (params.id) {
        try {
          setLoading(true);
          const data = await tenantService.getTenantById(String(params.id));
          if (data) setTenant(data);
        } catch (e) {
          console.error('Error loading tenant:', e);
        } finally {
          setLoading(false);
        }
      } else if (params.tenant) {
        try {
          setTenant(JSON.parse(params.tenant as string) as Tenant);
        } catch (e) {
          console.error('Error parsing tenant params:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadTenant();
  }, [params.id, params.tenant]);

  const name     = tenant?.name     || params.name || 'Tenant';
  const industry = tenant?.industry || 'Technology';
  const location = tenant?.location || 'ELIDZ-STP';
  const description = tenant?.description
    || `${name} is a leading organisation in the ${industry} sector, dedicated to innovation and excellence.`;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openLink = async (url: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Error', `Cannot open: ${url}`);
    } catch {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleContactEmail = () => {
    const to = tenant?.contact_email || tenant?.additional_contact_email || '';
    const subject = `Enquiry – ${name}`;
    const body = [
      `Dear ${name} Team,`,
      ``,
      `I am reaching out via the ELIDZ-STP Connect app to enquire about your services${industry ? ` in the ${industry} sector` : ''}.`,
      ``,
      `Could you please provide more information about the following:`,
      ``,
      `• Your available services and how to access them`,
      `• Any current opportunities or programmes`,
      `• How to schedule a visit or consultation`,
      ``,
      `[Feel free to add any additional details or questions here]`,
      ``,
      `I look forward to hearing from you.`,
      ``,
      `Kind regards,`,
      `[Your Name]`,
    ].join('\n');
    Linking.openURL(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const parseSocialLinks = (links: string | undefined) => {
    if (!links) return [];
    return links
      .split('|')
      .map(link => {
        const [platform, ...rest] = link.trim().split(':');
        const url = rest.join(':').trim();
        return platform && url ? { platform: platform.trim(), url } : null;
      })
      .filter(Boolean) as { platform: string; url: string }[];
  };

  // ── Derived booleans ─────────────────────────────────────────────────────────
  const hasContactInfo = !!(tenant?.contact_email || tenant?.additional_contact_email || tenant?.contact_phone);
  const socialLinks    = parseSocialLinks(tenant?.social_media_links);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-background">
          <TabsLayoutHeader title={name} variant="navy" showBackButton />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={accent} />
          <Text className="text-muted-foreground mt-3 text-sm">Loading tenant info…</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="bg-background">
        <TabsLayoutHeader title={name} variant="navy" showBackButton>
          <Text className="text-white/80 text-sm" numberOfLines={1}>
            {industry} • {location}
          </Text>
        </TabsLayoutHeader>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: isTablet ? 32 : 20, paddingTop: 24 }}
      >
        {/* Logo + tags ─────────────────────────────────────────────────────── */}
        <View className="items-center mb-5">
          <View className="w-24 h-24 rounded-2xl justify-center items-center overflow-hidden bg-card border border-border mb-4">
            <TenantLogo name={name} logoUrl={tenant?.logo_url} size={40} className="w-full h-full" />
          </View>
          <Text className="text-xl font-bold text-foreground text-center mb-1">{name}</Text>
          <View className="flex-row flex-wrap justify-center gap-2 mt-1">
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${accent}20` }}>
              <Text className="text-xs font-semibold" style={{ color: accent }}>{industry}</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-primary/10">
              <Text className="text-xs font-semibold text-primary">{location}</Text>
            </View>
          </View>
        </View>

        {/* About ────────────────────────────────────────────────────────────── */}
        <SectionCard icon="info" title="About" accent={accent}>
          <Text className="text-sm text-foreground leading-[22px]">{description}</Text>
        </SectionCard>

        {/* Details grid ────────────────────────────────────────────────────── */}
        <SectionCard icon="layers" title="Details" accent={accent}>
          <InfoRow icon="briefcase" label="Industry" value={industry} accent={accent} />
          <View className="my-2 border-t border-border" />
          <InfoRow icon="map-pin" label="Location" value={`${location}, ELIDZ-STP`} accent={accent} />
          {tenant?.address && (
            <>
              <View className="my-2 border-t border-border" />
              <InfoRow icon="home" label="Address" value={tenant.address} accent={accent} />
            </>
          )}
          {tenant?.opening_hours && (
            <>
              <View className="my-2 border-t border-border" />
              <InfoRow icon="clock" label="Opening Hours" value={tenant.opening_hours} accent={accent} />
            </>
          )}
        </SectionCard>

        {/* Services ────────────────────────────────────────────────────────── */}
        {tenant?.services && (
          <SectionCard icon="tool" title="Services" accent={accent}>
            <Text className="text-sm text-foreground leading-[22px]">{tenant.services}</Text>
          </SectionCard>
        )}

        {/* Capabilities ───────────────────────────────────────────────────── */}
        {tenant?.capabilities && (
          <SectionCard icon="zap" title="Capabilities" accent={accent}>
            <Text className="text-sm text-foreground leading-[22px]">{tenant.capabilities}</Text>
          </SectionCard>
        )}

        {/* Key Personnel ───────────────────────────────────────────────────── */}
        {tenant?.key_personnel && (
          <SectionCard icon="users" title="Key Personnel" accent={accent}>
            <Text className="text-sm text-foreground leading-[22px]">{tenant.key_personnel}</Text>
          </SectionCard>
        )}

        {/* Partners ────────────────────────────────────────────────────────── */}
        {tenant?.partners && (
          <SectionCard icon="link" title="Partners" accent={accent}>
            <Text className="text-sm text-foreground leading-[22px]">{tenant.partners}</Text>
          </SectionCard>
        )}

        {/* Contact Information — only when at least one field exists ────────── */}
        {hasContactInfo && (
          <SectionCard icon="phone" title="Contact Information" accent={accent}>
            {tenant?.contact_email && (
              <Pressable
                className="flex-row items-center py-2 active:opacity-70"
                onPress={handleContactEmail}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                  <Feather name="mail" size={15} color={accent} />
                </View>
                <Text className="text-sm ml-2.5 flex-1" style={{ color: accent }} numberOfLines={1}>
                  {tenant.contact_email}
                </Text>
                <Feather name="external-link" size={14} color={accent} />
              </Pressable>
            )}

            {tenant?.additional_contact_email && (
              <>
                {tenant?.contact_email && <View className="my-1 border-t border-border" />}
                <Pressable
                  className="flex-row items-center py-2 active:opacity-70"
                  onPress={handleContactEmail}
                >
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                    <Feather name="mail" size={15} color={accent} />
                  </View>
                  <Text className="text-sm ml-2.5 flex-1" style={{ color: accent }} numberOfLines={1}>
                    {tenant.additional_contact_email}
                  </Text>
                  <Feather name="external-link" size={14} color={accent} />
                </Pressable>
              </>
            )}

            {tenant?.contact_phone && (
              <>
                {(tenant?.contact_email || tenant?.additional_contact_email) && (
                  <View className="my-1 border-t border-border" />
                )}
                <Pressable
                  className="flex-row items-center py-2 active:opacity-70"
                  onPress={() => Linking.openURL(`tel:${tenant.contact_phone}`)}
                >
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                    <Feather name="phone" size={15} color={accent} />
                  </View>
                  <Text className="text-sm ml-2.5 flex-1" style={{ color: accent }}>
                    {tenant.contact_phone}
                  </Text>
                  <Feather name="phone-call" size={14} color={accent} />
                </Pressable>
              </>
            )}
          </SectionCard>
        )}

        {/* Social Media ────────────────────────────────────────────────────── */}
        {socialLinks.length > 0 && (
          <SectionCard icon="share-2" title="Social Media" accent={accent}>
            {socialLinks.map((link, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View className="my-1 border-t border-border" />}
                <Pressable
                  className="flex-row items-center py-2 active:opacity-70"
                  onPress={() => openLink(link.url)}
                >
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                    <Feather name="share-2" size={15} color={accent} />
                  </View>
                  <Text className="text-sm ml-2.5 flex-1" style={{ color: accent }}>
                    {link.platform}
                  </Text>
                  <Feather name="external-link" size={14} color={accent} />
                </Pressable>
              </React.Fragment>
            ))}
          </SectionCard>
        )}

        {/* Action buttons ──────────────────────────────────────────────────── */}
        <View className="gap-3 mt-1">
          {tenant?.website && (
            <Pressable
              className="flex-row justify-center items-center h-[52px] rounded-2xl bg-primary active:opacity-80"
              onPress={() => openLink(tenant.website!)}
            >
              <Feather name="globe" size={18} color="#FFFFFF" />
              <Text className="text-sm font-semibold text-white ml-2">Visit Website</Text>
            </Pressable>
          )}

          {tenant?.application_url && (
            <Pressable
              className="flex-row justify-center items-center h-[52px] rounded-2xl active:opacity-80"
              style={{ backgroundColor: accent }}
              onPress={() => openLink(tenant.application_url!)}
            >
              <Feather name="file-text" size={18} color="#FFFFFF" />
              <Text className="text-sm font-semibold text-white ml-2">Apply Now</Text>
            </Pressable>
          )}

          {/* Contact button — always visible */}
          <Pressable
            className="flex-row justify-center items-center h-[52px] rounded-2xl border border-border bg-card active:opacity-80"
            onPress={handleContactEmail}
          >
            <Feather name="mail" size={18} color={accent} />
            <Text className="text-sm font-semibold ml-2" style={{ color: accent }}>
              Contact {name}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(TenantDetailScreen);
