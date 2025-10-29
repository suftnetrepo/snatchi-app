import React, {useState, useEffect} from 'react';
import { Pressable, Box, Badge, Text } from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { useUtil } from '../../store';
import { useFocus } from '../../hooks/useFocus';
import { PROJECT_KEY } from '../../utils/asyncStorage';

export const Bell = ({ onPress }) => {
  const { key } = useFocus();
  const [count, setCount] = useState(0);
  const { get } = useUtil();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const unreadCount = await get(PROJECT_KEY);
      setCount(unreadCount || 0);
    };

    fetchUnreadCount();
  }, [key]);

  return (
    <Pressable onPress={onPress}>
      <Box position="relative">
        <Icon
          name="notifications-none"
          size={40}
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
