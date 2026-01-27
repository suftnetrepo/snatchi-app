import React, { useState } from "react";
import {
    StyledSafeAreaView,
    StyledBackgroundImage,
    StyledHeader,
} from 'fluent-styles';
import { Box, VStack, Text, Button, HStack, Spinner } from "@gluestack-ui/themed";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { geofencingSingleton } from '../../../scripts/geofencing';
import { theme } from "../../utils/theme";
import LocationPermissionAlert from "../../components/permissionAlert";

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
            geofencingSingleton.initialize().then(()=> {
                login()
            })
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
                                fontSize="$2xl"
                                fontWeight="$thin"
                                textAlign="center"
                                color={theme.colors.gray[800]}
                            >
                                Snatchi
                            </Text>
                            <Text
                                fontSize="$xl"
                                fontWeight="$medium"
                                textAlign="center"
                                color="#111827"
                            >
                               Work Smarter, On and Off Site
                            </Text>
                            <Text
                                fontSize="$md"
                                color="#4A5568"
                                textAlign="center"
                                px={2}
                            >
                                From assigned jobs and calendars to chat and invoicing, Snatchi helps engineers stay organised.
                            </Text>
                            <Text
                                textAlign="center"
                                color="$textLight500"
                                fontSize="$sm"
                                px="$3"
                            >
                              Location access enables automatic check-in and checkout at your assigned work sites
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
            <LocationPermissionAlert
                visible={showPermissionModal}
                onRetry={requestPermission}
                onContinue={login}
                loading={loading}
            />
        </StyledSafeAreaView>
    );
}