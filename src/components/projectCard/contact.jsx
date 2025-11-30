import React from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Avatar,
    AvatarImage,
    Icon,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme, fontStyles } from '../../utils/theme';

export const ContactCard = ({ name, email, mobile, image, online = true }) => {
    return (
        <HStack
            bg="$white"
            borderRadius={16}
            paddingHorizontal={8}
            paddingVertical={8}
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={4}
            shadowOffset={{ width: 0, height: 1 }}
            borderWidth={0.9} borderColor="$gray300"
        >
            {/* Avatar */}
            <Box position="relative" mr="$2" >
                <Avatar size="md" bg="$purple500" alignItems="center" justifyContent="center">
                    {image ? (
                        <AvatarImage source={{ uri: image }} />
                    ) : (
                        <Icon as={MaterialIcons} name="account-circle" color="$white" size={28} />
                    )}
                </Avatar>

                {/* Online dot */}
                {online && (
                    <Box
                        position="absolute"
                        bottom={2}
                        right={2}
                        bg="$green500"
                        width={10}
                        height={10}
                        borderRadius={10}
                        borderWidth={2}
                        borderColor="$white"
                    />
                )}
            </Box>

            {/* Info */}
            <VStack>
                <Text fontWeight="$bold" color="$textLight900" fontSize="$sm" fontFamily={fontStyles.Roboto_Regular}>
                    {name}
                </Text>
                {/* Email */}
                {
                    email && (<HStack alignItems="center" space="xs">
                        <Icon as={MaterialIcons} name="email" size={16} color="$textLight500" />
                        <Text color="$textLight700" fontSize="$sm" fontFamily={fontStyles.Roboto_Regular}>
                            {email}
                        </Text>
                    </HStack>)
                }
                {/* Mobile */}
                {mobile && (
                    <HStack alignItems="center" space="xs">
                        <Icon as={MaterialIcons} name="phone" size={16} color="$textLight500" />
                        <Text color="$textLight700" fontSize="$sm" fontFamily={fontStyles.Roboto_Regular}>
                            {mobile}
                        </Text>
                    </HStack>
                )}

            </VStack>
        </HStack>
    );
};
