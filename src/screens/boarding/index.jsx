import React, { useState } from "react";
import {
    StyledSafeAreaView,
    StyledHeader,
} from 'fluent-styles';
import { Box, VStack, Text, Button, HStack, Spinner } from "@gluestack-ui/themed";
import { View, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { geofencingSingleton } from '../../../scripts/geofencing';
import LocationPermissionAlert from "../../components/permissionAlert";

const FeaturePill = ({ iconName, label }) => (
    <View style={styles.featurePill}>
        <Icon name={iconName} size={14} color="#3B6D11" />
        <Text style={styles.featurePillLabel}>{label}</Text>
    </View>
);

export default function Boarding() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const login = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
            })
        );
    };

    const requestPermission = async () => {
        const status = await geofencingSingleton.requestPermissions();
        if (status) {
            setShowPermissionModal(false);
            geofencingSingleton.initialize().then(() => {
                login();
            });
        }
    };

    const handleAllow = async () => {
        try {
            setLoading(true);
            const granted = await geofencingSingleton.initialize();
            if (granted) {
                setTimeout(login, 300);
            } else {
                setShowPermissionModal(true);
            }
        } catch (error) {
            setShowPermissionModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        login();
    };

    return (
        <StyledSafeAreaView backgroundColor="#F0F4F0">
            <StyledHeader statusProps={{ translucent: true }} />

            <Box flex={1} bg="#F0F4F0">

                {/* Hero illustration area */}
                <View style={styles.heroContainer}>
                    <View style={styles.bgCircleLarge} />
                    <View style={styles.bgCircleSmall} />

                    {/* Central icon cluster */}
                    <View style={styles.iconCluster}>
                        <View style={styles.iconPrimary}>
                            <Icon name="work-outline" size={38} color="#C0DD97" />
                        </View>
                        <View style={styles.iconRow}>
                            <View style={[styles.iconSecondary, { backgroundColor: '#27500A' }]}>
                                <Icon name="calendar-today" size={22} color="#C0DD97" />
                            </View>
                            <View style={[styles.iconSecondary, { backgroundColor: '#639922' }]}>
                                <Icon name="description" size={22} color="#EAF3DE" />
                            </View>
                            <View style={[styles.iconSecondary, { backgroundColor: '#27500A' }]}>
                                <Icon name="chat-bubble-outline" size={22} color="#C0DD97" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom sheet */}
                <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>

                    {/* Brand eyebrow */}
                    <Text style={styles.eyebrow}>SNATCHI</Text>

                    {/* Headline */}
                    <Text style={styles.headline}>Work smarter,{'\n'}on and off site</Text>

                    {/* Feature pills */}
                    <View style={styles.pillsRow}>
                        <FeaturePill iconName="assignment" label="Jobs" />
                        <FeaturePill iconName="calendar-today" label="Calendar" />
                        <FeaturePill iconName="chat-bubble-outline" label="Chat" />
                        <FeaturePill iconName="description" label="Invoicing" />
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Location notice */}
                    <View style={styles.locationNotice}>
                        <Icon name="location-on" size={16} color="#639922" style={{ marginTop: 1 }} />
                        <Text style={styles.locationText}>
                            Location access enables automatic check-in and checkout at your assigned work sites.
                        </Text>
                    </View>

                    {/* Actions */}
                    {loading ? (
                        <VStack space="sm" alignItems="center" style={{ marginTop: 16 }}>
                            <Spinner size="large" color="#3B6D11" />
                            <Text style={styles.loadingText}>Requesting permission...</Text>
                        </VStack>
                    ) : (
                        <HStack space="md" style={styles.buttonRow}>
                            <Button
                                flex={1}
                                size="lg"
                                variant="solid"
                                style={styles.primaryButton}
                                onPress={handleAllow}
                                disabled={loading}
                            >
                                <Text style={styles.primaryButtonText}>Allow access</Text>
                            </Button>
                            <Button
                                flex={1}
                                size="lg"
                                variant="outline"
                                style={styles.secondaryButton}
                                onPress={handleSkip}
                                disabled={loading}
                            >
                                <Text style={styles.secondaryButtonText}>Continue</Text>
                            </Button>
                        </HStack>
                    )}
                </View>
            </Box>

            <LocationPermissionAlert
                visible={showPermissionModal}
                onRetry={requestPermission}
                onContinue={login}
                loading={loading}
            />
        </StyledSafeAreaView>
    );
}

const styles = StyleSheet.create({
    heroContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    bgCircleLarge: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#C0DD97',
        opacity: 0.35,
        top: 20,
        right: -40,
    },
    bgCircleSmall: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#9FE1CB',
        opacity: 0.25,
        bottom: 40,
        left: -20,
    },
    iconCluster: {
        alignItems: 'center',
        gap: 12,
    },
    iconPrimary: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#3B6D11',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 10,
    },
    iconSecondary: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bottom sheet
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 8,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        color: '#639922',
        marginBottom: 8,
    },
    headline: {
        fontSize: 26,
        fontWeight: '600',
        color: '#111827',
        lineHeight: 34,
        marginBottom: 20,
    },

    // Feature pills
    pillsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#EAF3DE',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    featurePillLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#3B6D11',
    },

    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },

    // Location notice
    locationNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#F8FAF5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D3E8C0',
        padding: 12,
        marginBottom: 24,
    },
    locationText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: '#4B5563',
    },

    // Buttons
    buttonRow: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#3B6D11',
        borderRadius: 14,
        height: 52,
        borderWidth: 0,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        borderRadius: 14,
        height: 52,
        borderWidth: 1,
        borderColor: '#C0DD97',
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: '#3B6D11',
        fontSize: 15,
        fontWeight: '500',
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 14,
    },
});