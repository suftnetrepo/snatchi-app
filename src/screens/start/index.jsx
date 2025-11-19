import React, { useState } from "react";
import {
    StyledSafeAreaView,
    StyledBackgroundImage,
    StyledHeader,
} from 'fluent-styles';
import { Box, VStack, Text, Button, HStack, useToast, Spinner } from "@gluestack-ui/themed";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { geofencingSingleton } from '../../types/geofencing';
import { theme } from "../../utils/theme";
import { store } from "../../utils/asyncStorage";

export default function Start({ navigation }) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const login = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
            })
        );
    };

    const handleAllow = async () => {
        const LOCATION_DENIED_MESSAGE = 'Location access denied. You can enable it later in Settings.';
        const GENERIC_ERROR_MESSAGE = 'Something went wrong.';

        const requestLocationPermission = async () => {
            try {
                return await geofencingSingleton.requestPermissions();
            } catch (error) {
                if(__DEV__)
                console.error('❌ Permission request error:', error);
                throw new Error(GENERIC_ERROR_MESSAGE);
            }
        };

        const initializeGeofencing = async () => {
            try {
                await geofencingSingleton.initialize(true);
            } catch (error) {
                if(__DEV__)
                console.error('❌ Geofencing initialization error:', error);
                throw new Error(GENERIC_ERROR_MESSAGE);
            }
        };

        try {
            setLoading(true);
            const granted = await requestLocationPermission();
            console.log('Location permission granted:', granted);
            if (granted) {
                await initializeGeofencing();
                await store('GeofencingGranted', true);
            } else {
                toast.show({ description: LOCATION_DENIED_MESSAGE });
            }
        } catch (error) {
            toast.show({ description: error.message });
        } finally {
            setLoading(false);
            login();
        }
    };

    const handleSkip = () => {
        login()
    };

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader
                statusProps={{ translucent: true, hidden: true }}>
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
                                color={theme.colors.gray[400]}
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
                                Before you begin, we’d like your permission to enable location
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
                                <Spinner size="large" mt="$4" />
                            ) : (
                                <HStack space="md" justifyContent="flex-start" alignItems="center">
                                    <Button
                                        flex={1}
                                        size="lg"
                                        variant="solid"
                                        bg="$cyan500"
                                        borderRadius="$xl"
                                        onPress={handleAllow}
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
