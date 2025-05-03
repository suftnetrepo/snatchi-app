import React from 'react';
import {View, Text} from 'react-native';
import { VStack, HStack } from '@gluestack-ui/themed'

const SingleChat = ({user}) => {
  return (
    <VStack
     paddingHorizontal={16}
     paddingVertical={16}
       >
        <Text>Second Route</Text>
        <Text>{user?.name}</Text>
      </VStack>
  );
};

export default SingleChat;
