import React, {useState} from 'react';
import {XStack, StyledText} from 'fluent-styles';
import {Pressable, ScrollView} from 'react-native';
import {fontStyles, theme} from '../../utils/theme';
import {capitalizeFirstLetter} from '../../utils/help';

const ChatRoomScrollView = ({onPress}) => {
  const [selected, setSelected] = useState('All');

  const handleSelect = room => {
    setSelected(room);
    onPress && onPress(room);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 8}}>
      <XStack gap={8} alignItems="center">
        {['All', 'direct', 'group'].map(room => {
          const active = selected === room;
          return (
              <Pressable
                key={room}
                accessibilityRole="button"
                accessibilityState={{selected: active}}
                onPress={() => handleSelect(room)}
                style={{
                  height: 38,
                  minWidth: 70,
                  paddingHorizontal: 16,
                  borderRadius: 19,
                  borderWidth: 1,
                  borderColor: active ? '#4f46e5' : theme.colors.gray[300],
                  backgroundColor: active ? '#4f46e5' : theme.colors.gray[1],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <XStack
                  justifyContent="center"
                  alignItems="center">
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.medium}
                    fontSize={theme.fontSize.normal}
                    color={active ? theme.colors.gray[1] : theme.colors.gray[800]}>
                    {capitalizeFirstLetter(room)}
                  </StyledText>
                </XStack>
              </Pressable>
          );
        })}
      </XStack>
    </ScrollView>
  );
};

export default ChatRoomScrollView;
