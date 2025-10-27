import React, { useState } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { geofencingSingleton } from '../../types/geofencing';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Image,
    Text,
    Button,
    Spinner,
    useToast,
} from '@gluestack-ui/themed';

export default function Start() {
    const navigation = useNavigation();
    const toast = useToast();
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
        try {
            setLoading(true);
            const granted = await geofencingSingleton.requestPermissions();
            setLoading(false);

            if (granted) {
                await geofencingSingleton.initialize(true);
                login()
            } else {
                toast.show({
                    description:
                        'Location access denied. You can enable it later in Settings.',
                });
                login()
            }
        } catch (error) {
            console.error('❌ Permission error:', error);
            setLoading(false);
            toast.show({ description: 'Something went wrong.' });
            login()
        }
    };

    const handleSkip = () => {
        login()
    };

    return (
        <Box flex={1} bg="$backgroundLight0" px="$6" justifyContent="center">
            <VStack space="lg" alignItems="center">

                <Image
                    source={require('../../../assets/img/icons8-login-100-2.png')} // optional; replace with your own
                    alt="Snatchi Logo"
                    size="xl"
                    resizeMode="contain"
                    mb="$4"
                />

                <Heading textAlign="center" size="2xl" color="$textLight800" mb="$2">
                    Welcome to Snatchi 👋
                </Heading>

                <Text
                    textAlign="center"
                    color="$textLight600"
                    fontSize="$md"
                    mb="$3"
                    px="$2"
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
                            bg="$primary500"
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
                            borderColor="$primary500"
                            borderRadius="$xl"
                            onPress={handleSkip}
                        >
                            <Text color="$primary600" fontWeight="500" fontSize="$md">
                                Continue
                            </Text>
                        </Button>
                        
                    </HStack>
                )}
            </VStack>
        </Box>
    );
}
