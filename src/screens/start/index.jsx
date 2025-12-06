import React, { useState } from "react";
import {
    StyledSafeAreaView,
    StyledBackgroundImage,
    StyledHeader,
} from 'fluent-styles';
import { Box, VStack, Text, Button, HStack, Spinner } from "@gluestack-ui/themed";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { geofencingSingleton } from '../../../scripts/geofencing';
import { theme } from "../../utils/theme";
import { useFocus } from "../../hooks/useFocus";

export default function Start({ navigation }) {
    const { key } = useFocus();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    const login = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
            })
        );
    };

    const handleAllow = async () => {
        console.log('🔘 [START] Allow button pressed');
        
        try {
            setLoading(true);

            // Initialize geofencing
            const granted = await geofencingSingleton.initialize();
            console.log('📍 [START] Initialize result:', granted);

            if (granted) {
                console.log('✅ [START] Permission granted, navigating to login');
                // Small delay to show success state
                setTimeout(() => {
                    login();
                }, 300);
            } else {
                console.log('❌ [START] Permission denied');
                // You might want to show an alert here
                alert(
                    'Location Permission Required',
                    'Snatchi needs location access to track job sites. Please enable it in Settings.',
                    [
                        { text: 'Continue Anyway', onPress: login },
                        { text: 'Try Again', onPress: handleAllow }
                    ]
                );
            }
        } catch (error) {
            console.error('❌ [START] Geofencing initialization error:', error);
            
            // Show error to user
            alert(
                'Initialization Error',
                'Something went wrong. Please try again.',
                [
                    { text: 'Continue Anyway', onPress: login },
                    { text: 'Try Again', onPress: handleAllow }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        console.log('⏭️ [START] Skip button pressed');
        login();
    };

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader
                statusProps={{ translucent: true }}>
            </StyledHeader>
            <Box flex={1} bg="#F5F6FA">
                <StyledBackgroundImage
                    local={true}
                    borderColor={theme.colors.gray[100]}
                    resizeMode="cover"
                    height="100%"
                    borderWidth={0}
                    imageUrl={require("../../../assets/img/1.png")}
                >
                    <Box
                        flex={1}
                        mt={120}
                        bg="white"
                        borderTopLeftRadius={40}
                        borderTopRightRadius={40}
                        px={24}
                        pt={40}
                        bottom={insets.bottom}
                        position="absolute"
                        paddingBottom={32}
                    >
                        <VStack space="lg" alignItems="center">
                            <Text
                                fontSize="$lg"
                                fontWeight="$bold"
                                textAlign="center"
                                color={theme.colors.gray[700]}
                            >
                                Snatchi
                            </Text>
                            <Text
                                fontSize="$3xl"
                                fontWeight="$medium"
                                textAlign="center"
                                color="#111827"
                            >
                                The Smarter Way to Run{"\n"}Audio-Visual Jobs
                            </Text>
                            <Text
                                fontSize="$md"
                                color="#4A5568"
                                textAlign="center"
                                px={8}
                            >
                                Before you begin, we'd like your permission to enable location
                                tracking. This allows Snatchi to automatically detect when you arrive
                                at or leave assigned job sites — even when the app is closed.
                            </Text>
                            <Text
                                textAlign="center"
                                color="$textLight500"
                                fontSize="$sm"
                                px="$3"
                            >
                                Your location is used strictly for job tracking and never for
                                advertising or marketing.
                            </Text>

                            {loading ? (
                                <VStack space="sm" alignItems="center" mt="$4">
                                    <Spinner size="large" />
                                    <Text color="$gray600" fontSize="$sm">
                                        Requesting permission...
                                    </Text>
                                </VStack>
                            ) : (
                                <HStack space="md" justifyContent="flex-start" alignItems="center" width="100%">
                                    <Button
                                        flex={1}
                                        size="lg"
                                        variant="solid"
                                        bg="$cyan500"
                                        borderRadius="$xl"
                                        onPress={handleAllow}
                                        disabled={loading}
                                    >
                                        <Text color="$white" fontWeight="600" fontSize="$md">
                                            Allow Access
                                        </Text>
                                    </Button>
                                    <Button
                                        flex={1}
                                        size="lg"
                                        variant="outline"
                                        borderColor="$cyan500"
                                        borderRadius="$xl"
                                        onPress={handleSkip}
                                        disabled={loading}
                                    >
                                        <Text color="$gray800" fontWeight="500" fontSize="$md">
                                            Continue
                                        </Text>
                                    </Button>
                                </HStack>
                            )}
                        </VStack>
                    </Box>
                </StyledBackgroundImage>
            </Box>
        </StyledSafeAreaView>
    );
}