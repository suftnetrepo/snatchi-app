import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import { priorityBackgroundColorHelper, priorityTextColorHelper } from '../../utils/help';

export const PriorityBadge = ({ priority }) => {
  const bg = priorityBackgroundColorHelper(priority);
  const color = priorityTextColorHelper(priority);

  return (
    <Box
      bg={bg}
      px="$3"
      py="$1"
      borderRadius="$full"
      alignSelf="flex-start"
    >
      <Text fontSize="$xs" fontWeight="$semibold" color={color}>
        {priority} Priority
      </Text>
    </Box>
  );
};
