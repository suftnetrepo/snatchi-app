import React, { useState } from "react";
import { ImageBackground, Image, StatusBar } from "react-native";
import { Box, VStack, Text, Button, Center, Pressable, HStack, useToast, Spinner } from "@gluestack-ui/themed";
import { CommonActions } from '@react-navigation/native';
import { geofencingSingleton } from '../../types/geofencing';

export default function Start({ navigation }) {
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
        <Box flex={1} bg="#F5F6FA">
            <StatusBar hidden translucent />
            {/* Background: AV Engineer */}
            <ImageBackground
                source={require("../../../assets/img/1.png")}
                resizeMode="cover"
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                }}
            />

        
            {/* TOP ICON */}
            <Center mt={80}>
                <Image
                    source={require("../../../assets/img/splash_icon.png")}
                    style={{
                        width: 180,
                        height: 180,
                        resizeMode: "contain",
                    }}
                />
            </Center>

            {/* CONTENT CARD */}
            <Box
                flex={1}
                mt={120}
                bg="white"
                borderTopLeftRadius={40}
                borderTopRightRadius={40}
                px={24}
                pt={40}
            >
                <VStack space="lg" alignItems="center">
                    {/* Title */}
                    <Text
                        fontSize="$3xl"
                        fontWeight="$medium"
                        textAlign="center"
                        color="#111827"
                    >
                        The Smarter Way to Run{"\n"}Audio-Visual Jobs
                    </Text>


                    {/* Subtitle */}
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
            <ImageBackground/>
        </Box>
    );
}
