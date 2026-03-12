import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Pressable, Alert, Linking, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { useAuthContext } from '../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';
import { supabase } from '@/lib/supabase';
import { connectionService } from '@/services/connection.service';
import { smmmeService, SMMEServiceProduct } from '@/services/smme.service';
import { Profile } from '@/types';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { DEFAULT_AVATAR } from '@/constants/avatars';
import { useQueryClient } from '@tanstack/react-query';

function UserProfileScreen() {
    const { colors } = useTheme();
    const { profile: currentUser } = useAuthContext();
    const params = useLocalSearchParams<{ id?: string; userId?: string }>();
    const queryClient = useQueryClient();

    const [profileUser, setProfileUser] = useState<Profile | null>(null);
    const { uri: profileUserAvatarUri } = useAvatarUri(profileUser?.avatar);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending_sent' | 'pending_received' | 'available' | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [smmeServices, setSmmeServices] = useState<SMMEServiceProduct[]>([]);
    const [smmeProducts, setSmmeProducts] = useState<SMMEServiceProduct[]>([]);
    const [loadingOfferings, setLoadingOfferings] = useState(false);
    const [offeringsError, setOfferingsError] = useState<string | null>(null);

    const userId = params?.id || params?.userId;
    const isOwnProfile = currentUser?.id === userId;
    const isSMME = profileUser?.role === 'SMME';
    const isVerifiedSMME = isSMME && profileUser?.verification_status === 'verified';

    const avatarSource = useMemo(() => {
        if (profileUserAvatarUri) return { uri: profileUserAvatarUri };
        return DEFAULT_AVATAR;
    }, [profileUserAvatarUri]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError) throw userError;
                setProfileUser(userData);

                if (isOwnProfile || !currentUser) {
                    setLoading(false);
                    return;
                }

                // Connection Logic
                const { data: directConnection } = await supabase
                    .from('connections')
                    .select('*')
                    .or(`and(user_id.eq.${currentUser.id},connected_user_id.eq.${userId}),and(user_id.eq.${userId},connected_user_id.eq.${currentUser.id})`)
                    .maybeSingle();

                if (directConnection) {
                    setConnectionId(directConnection.id);
                    if (directConnection.status === 'accepted') setConnectionStatus('connected');
                    else if (directConnection.user_id === currentUser.id) setConnectionStatus('pending_sent');
                    else setConnectionStatus('pending_received');
                } else {
                    setConnectionStatus('available');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, currentUser?.id]);

    useEffect(() => {
        if (!profileUser?.id || profileUser.role !== 'SMME') {
            setSmmeServices([]);
            setSmmeProducts([]);
            setLoadingOfferings(false);
            setOfferingsError(null);
            return;
        }

        let cancelled = false;
        setLoadingOfferings(true);
        setOfferingsError(null);
        smmmeService
            .getServicesProductsBySMME(profileUser.id)
            .then(({ services, products }) => {
                if (cancelled) return;
                setSmmeServices(services);
                setSmmeProducts(products);
            })
            .catch((err: any) => {
                if (cancelled) return;
                console.warn('UserProfile: failed to load SMME services/products', err);
                setSmmeServices([]);
                setSmmeProducts([]);
                setOfferingsError('Could not load products & services.');
            })
            .finally(() => {
                if (cancelled) return;
                setLoadingOfferings(false);
            });

        return () => {
            cancelled = true;
        };
    }, [profileUser?.id, profileUser?.role]);

    const handleConnect = useCallback(async () => {
        if (!currentUser?.id || !profileUser?.id) return;
        try {
            await connectionService.sendConnectionRequest(currentUser.id, profileUser.id);
            setConnectionStatus('pending_sent');
            // Keep contacts/messages views in sync so the user
            // immediately sees this under Requests instead of Discover.
            queryClient.invalidateQueries({ queryKey: ['contacts'] });

            Alert.alert('Request sent', `Connection request sent to ${profileUser.name}.`);
        } catch (error: any) {
            console.error('Connect error:', error);
            Alert.alert('Error', error?.message || 'Failed to send request.');
        }
    }, [currentUser?.id, profileUser?.id, profileUser?.name, queryClient]);

    const handleAccept = useCallback(async () => {
        if (!connectionId) return;
        try {
            await connectionService.acceptConnectionRequest(connectionId);
            setConnectionStatus('connected');
        } catch (error: any) {
            console.error('Accept error:', error);
            Alert.alert('Error', error?.message || 'Failed to accept request.');
        }
    }, [connectionId]);

    const handleDecline = useCallback(async () => {
        if (!connectionId) return;
        try {
            await connectionService.declineConnectionRequest(connectionId);
            setConnectionStatus('available');
            setConnectionId(null);
        } catch (error: any) {
            console.error('Decline error:', error);
            Alert.alert('Error', error?.message || 'Failed to decline request.');
        }
    }, [connectionId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profileUser) {
        return (
            <ScreenScrollView>
                <View className="flex-1 justify-center items-center p-10 mt-20">
                    <View className="bg-muted p-6 rounded-full">
                        <Feather name="user-x" size={48} color={colors.mutedForeground} />
                    </View>
                    <Text className="text-xl font-bold mt-6 text-foreground">User Not Found</Text>
                    <Text className="text-muted-foreground text-center mt-2">The user might have moved or deactivated their account.</Text>
                </View>
            </ScreenScrollView>
        );
    }

    return (
        <ScreenScrollView className="bg-background">
            {/* Header + avatar area (reference-style) */}
            <View className="px-6 pt-5 pb-4">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center active:opacity-80">
                        <Feather name="chevron-left" size={26} color={colors.text} />
                    </Pressable>
                </View>

                <View className="items-center pt-0 mb-1">
                    <View
                        className="rounded-full border-4 border-background shadow-sm overflow-hidden"
                        style={{ width: 96, height: 96, backgroundColor: colors.backgroundSecondary }}
                    >
                        <Image
                            source={avatarSource}
                            style={{ width: 96, height: 96 }}
                            contentFit="cover"
                            contentPosition="center"
                        />
                        {isVerifiedSMME && (
                            <View
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full items-center justify-center border-4 border-background"
                                style={{ backgroundColor: colors.success }}
                            >
                                <Feather name="check" size={16} color="white" />
                            </View>
                        )}
                    </View>

                    <Text className="text-xl font-extrabold text-foreground mt-3 text-center">{profileUser.name}</Text>
                    {profileUser.organization ? (
                        <Text className="text-muted-foreground mt-1 font-medium text-center">{profileUser.organization}</Text>
                    ) : (
                        <Text className="text-muted-foreground mt-1 font-medium text-center">{profileUser.role}</Text>
                    )}
                </View>
            </View>

            {/* Stats row - only relevant for SMMEs (verification, products & services) */}
            {isSMME && (
                <View className="flex-row mx-6 mt-2 mb-2 justify-around">
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-foreground">{smmeProducts.length}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">Products</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-foreground">{smmeServices.length}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">Services</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-foreground">{isVerifiedSMME ? 'Yes' : 'No'}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">Verified</Text>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
                <View className="flex-row px-6 mt-6 gap-3">
                    {connectionStatus === 'connected' ? (
                        <Pressable 
                            onPress={() => router.push({ pathname: '/message', params: { userId: profileUser.id, userName: profileUser.name } })}
                            className="flex-1 flex-row bg-primary h-12 rounded-2xl items-center justify-center shadow-md active:opacity-90"
                        >
                            <Feather name="message-square" size={18} color="white" />
                            <Text className="text-white font-bold ml-2">Message</Text>
                        </Pressable>
                    ) : connectionStatus === 'pending_received' ? (
                        <>
                            <Pressable onPress={handleAccept} className="flex-1 bg-green-600 h-12 rounded-2xl items-center justify-center shadow-md active:opacity-90">
                                <Text className="text-white font-bold">Accept</Text>
                            </Pressable>
                            <Pressable onPress={handleDecline} className="flex-1 bg-destructive/10 h-12 rounded-2xl items-center justify-center border border-destructive/20 active:opacity-90">
                                <Text className="text-destructive font-bold">Decline</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Pressable 
                            onPress={handleConnect} 
                            disabled={connectionStatus === 'pending_sent'}
                            className={`flex-1 h-12 rounded-2xl items-center justify-center shadow-md ${connectionStatus === 'pending_sent' ? 'bg-muted' : 'bg-foreground dark:bg-white'}`}
                        >
                            <Text className={`font-bold ${connectionStatus === 'pending_sent' ? 'text-muted-foreground' : 'text-background dark:text-black'}`}>
                                {connectionStatus === 'pending_sent' ? 'Request Sent' : 'Connect'}
                            </Text>
                        </Pressable>
                    )}
                </View>
            )}

            {/* Content Sections */}
            <View className="px-6 py-8 gap-y-6">
                {/* About */}
                {profileUser.bio && (
                    <View>
                        <Text className="text-lg font-bold text-foreground mb-2">About</Text>
                        <Text className="text-base text-muted-foreground leading-6">{profileUser.bio}</Text>
                    </View>
                )}

                {/* Contact Info */}
                <View className="bg-card p-5 rounded-3xl border border-border">
                    <Text className="text-lg font-bold text-foreground mb-4">Contact Details</Text>
                    <View className="gap-y-4">
                        <Pressable onPress={() => Linking.openURL(`mailto:${profileUser.email}`)} className="flex-row items-center">
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: colors.whiteOpacity10 }}
                            >
                                <Feather name="mail" size={18} color={colors.accent} />
                            </View>
                            <Text className="text-foreground font-medium flex-1">{profileUser.email}</Text>
                        </Pressable>
                        {profileUser.address && (
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: colors.whiteOpacity10 }}
                                >
                                    <Feather name="map-pin" size={18} color={colors.accent} />
                                </View>
                                <Text className="text-foreground font-medium flex-1">{profileUser.address}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Verified SMME offerings */}
                {isSMME && (
                    <View className="bg-card p-5 rounded-3xl border border-border">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-foreground">Products & Services</Text>
                            {loadingOfferings ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text className="text-muted-foreground text-xs ml-2">Loading</Text>
                                </View>
                            ) : null}
                        </View>

                        {offeringsError ? (
                            <View className="py-6 items-center">
                                <Feather name="alert-circle" size={22} color={colors.mutedForeground} />
                                <Text className="text-muted-foreground mt-2 text-center">{offeringsError}</Text>
                            </View>
                        ) : null}

                        {!loadingOfferings && !offeringsError && smmeProducts.length === 0 && smmeServices.length === 0 ? (
                            <View className="py-8 items-center">
                                <Feather name="grid" size={26} color={colors.mutedForeground} />
                                <Text className="text-muted-foreground mt-2 text-center">No products or services listed yet.</Text>
                            </View>
                        ) : null}

                        {!offeringsError && smmeProducts.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-base font-extrabold text-foreground mb-3">Products</Text>
                                <View className="gap-y-3">
                                    {smmeProducts.map((item) => (
                                        <View
                                            key={item.id}
                                            className="p-4 rounded-2xl border border-border"
                                            style={{ backgroundColor: colors.backgroundSecondary }}
                                        >
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-3">
                                                    <Text className="text-base font-bold text-foreground">{item.name}</Text>
                                                    <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    <View className="bg-primary/10 px-2 py-1 rounded-lg">
                                                        <Text className="text-xs font-bold text-primary">{item.category}</Text>
                                                    </View>
                                                    <Text className="text-foreground font-extrabold mt-2 text-sm">
                                                        {item.price || 'Contact'}
                                                    </Text>
                                                </View>
                                            </View>
                                            {(item.contact_email || item.contact_phone) && (
                                                <View className="flex-row flex-wrap mt-3">
                                                    {item.contact_email ? (
                                                        <Pressable onPress={() => Linking.openURL(`mailto:${item.contact_email}`)} className="mr-3 mt-1">
                                                            <Text className="text-xs text-primary font-semibold">{item.contact_email}</Text>
                                                        </Pressable>
                                                    ) : null}
                                                    {item.contact_phone ? (
                                                        <Pressable onPress={() => Linking.openURL(`tel:${item.contact_phone}`)} className="mt-1">
                                                            <Text className="text-xs text-primary font-semibold">{item.contact_phone}</Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {!offeringsError && smmeServices.length > 0 && (
                            <View>
                                <Text className="text-base font-extrabold text-foreground mb-3">Services</Text>
                                <View className="gap-y-3">
                                    {smmeServices.map((item) => (
                                        <View
                                            key={item.id}
                                            className="p-4 rounded-2xl border border-border"
                                            style={{ backgroundColor: colors.backgroundSecondary }}
                                        >
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-3">
                                                    <Text className="text-base font-bold text-foreground">{item.name}</Text>
                                                    <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    <View className="bg-primary/10 px-2 py-1 rounded-lg">
                                                        <Text className="text-xs font-bold text-primary">{item.category}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {(item.contact_email || item.contact_phone) && (
                                                <View className="flex-row flex-wrap mt-3">
                                                    {item.contact_email ? (
                                                        <Pressable onPress={() => Linking.openURL(`mailto:${item.contact_email}`)} className="mr-3 mt-1">
                                                            <Text className="text-xs text-primary font-semibold">{item.contact_email}</Text>
                                                        </Pressable>
                                                    ) : null}
                                                    {item.contact_phone ? (
                                                        <Pressable onPress={() => Linking.openURL(`tel:${item.contact_phone}`)} className="mt-1">
                                                            <Text className="text-xs text-primary font-semibold">{item.contact_phone}</Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </ScreenScrollView>
    );
}

export default withAuthGuard(UserProfileScreen);