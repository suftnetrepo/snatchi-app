import React, { useEffect } from 'react';
import { Pressable, Box, Badge, Text } from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { useFocus } from '../../hooks/useFocus';
import { useScheduler } from '../../hooks/useScheduler';


export const Bell = ({ user_id, onPress }) => {
  const { key } = useFocus();
  const { handleUnReadSchedule, data } = useScheduler();

  const loadCount = async () => {
    await handleUnReadSchedule({ engineerId: user_id });
  };

  useEffect(() => {
    loadCount();
    // Refresh the server-backed unread count when Home regains focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Pressable onPress={onPress}>
      <Box position="relative">
        <Icon
          name="notifications-none"
          size={48}
          color={theme.colors.gray[800]}
        />

        {Number(data) > 0 && <Badge
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
            {Number(data) > 99 ? '99+' : data}
          </Text>
        </Badge>}
      </Box>
    </Pressable>
  );
};
