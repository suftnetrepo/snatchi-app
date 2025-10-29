import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import { textColorHelper, backgroundColorHelper } from '../../utils/help';

export const StatusBadge = ({ status }) => {
  const bg = backgroundColorHelper(status);
  const color = textColorHelper(status);

  return (
    <Box
      bg={bg}
      px="$3"
      py="$1"
      borderRadius="$full"
      alignSelf="flex-start"
    >
      <Text fontSize="$xs" fontWeight="$semibold" color={color}>
        {status}
      </Text>
    </Box>
  );
};
