import React, { useState, useEffect } from 'react';
import { Pressable, Box, Badge, Text } from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { useFocus } from '../../hooks/useFocus';
import { getUnReadCount } from '../../utils/asyncStorage';
import { NotificationBus } from '../../../scripts/notificationBus';

export const Bell = ({ onPress }) => {
  const { key } = useFocus();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    const count = await getUnReadCount();
     setCount(count);
  };

  useEffect(() => {
    loadCount();

    const sub = NotificationBus.on('new-notification', () => {
      loadCount();
    });

    return () => {
      sub.remove();
    };
  }, [key]); 

  return (
    <Pressable onPress={onPress}>
      <Box position="relative">
        <Icon
          name="notifications-none"
          size={48}
          color={theme.colors.gray[800]}
        />

        <Badge
          position="absolute"
          top={-2}
          right={-2}
          px="$2"
          py="$1"
          bg={theme.colors.red[500]}
          borderRadius="$full"
          borderWidth={0}
          borderColor={theme.colors.red[500]}
          justifyContent="center"
          alignItems="center"
        >
          <Text
            color="$white"
            fontSize="$xs"
            fontWeight="$bold"
            textAlign="center"
          >
            {count}
          </Text>
        </Badge>
      </Box>
    </Pressable>
  );
};
