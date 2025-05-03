import React from 'react';
import {View, Text} from 'react-native';

const GroupChat = ({data}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ff4081',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>First Route</Text>
      <Text>{data}</Text>
    </View>
  );
};

export default GroupChat;
