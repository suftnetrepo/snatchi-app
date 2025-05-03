import React, {Fragment, useState} from 'react';
import {XStack, StyledText, StyledButton, StyledSpacer} from 'fluent-styles';
import {ScrollView, useWindowDimensions} from 'react-native';
import {fontStyles, theme} from '../../utils/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useChatRoom} from '../../hooks/useChat';
import { useAppContext } from '../../hooks/appContext';
import { useChatContext } from '../../hooks/ChatContext';

const ChatRoomScrollView = ({onPress}) => {
  const { width } = useWindowDimensions()
  const [selected, setSelected] = useState();
  const { currentChatUser }= useChatContext()
  const {data} = useChatRoom(currentChatUser?.uid);

  console.log('.....................data', data);

  const handleSelect = room_id => {
    setSelected(room_id);
    onPress && onPress(room_id);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack
        width={width - 32}
        paddingHorizontal={8}
        marginVertical={8}
        borderRadius={32}
        backgroundColor={theme.colors.gray[100]}
        paddingVertical={6}>
        {data.map((room, index) => {
          return (
            <Fragment key={index}>
              <StyledButton
                key={index}
                borderColor={theme.colors.teal[500]}
                backgroundColor={theme.colors.green[50]}
                onPress={() => handleSelect(room.id)}>
                <XStack
                  paddingHorizontal={10}
                  paddingVertical={5}
                  key={index}
                  justifyContent="flex-start"
                  alignItems="center">
                  {selected === room.id && (
                    <>
                      <FontAwesome
                        name="check-circle"
                        size={24}
                        color={theme.colors.green[500]}
                      />
                      <StyledSpacer marginHorizontal={1} />
                    </>
                  )}
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.medium}
                    fontSize={theme.fontSize.small}
                    color={theme.colors.green[800]}>
                    {room.name}
                  </StyledText>
                </XStack>
              </StyledButton>
              <StyledSpacer marginHorizontal={4} />
            </Fragment>
          );
        })}
      </XStack>
    </ScrollView>
  );
};

export default ChatRoomScrollView;
