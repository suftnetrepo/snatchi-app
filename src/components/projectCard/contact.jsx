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

export const ContactCard = ({ name, email, mobile, image, online = true }) => {
    return (
        <HStack
            bg="$white"
            borderRadius="$lg"
            px="$1"
            py="$1"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={4}
            shadowOffset={{ width: 0, height: 1 }}
        >
            {/* Avatar */}
            <Box position="relative" mr="$3">
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
                <Text fontWeight="$bold" color="$textDark900" fontSize="$md">
                    {name}
                </Text>
                {/* Email */}
                <HStack alignItems="center" space="xs">
                    <Icon as={MaterialIcons} name="email" size={16} color="$textLight500" />
                    <Text color="$textLight700" fontSize="$sm">
                        {email}
                    </Text>
                </HStack>

                {/* Mobile */}
                <HStack alignItems="center" space="xs">
                    <Icon as={MaterialIcons} name="phone" size={16} color="$textLight500" />
                    <Text color="$textLight700" fontSize="$sm">
                        {mobile}
                    </Text>
                </HStack>
            </VStack>
        </HStack>
    );
};
