import React from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledCycle,
} from 'fluent-styles';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useChatContext} from '../../hooks/ChatContext';
import {GiftedChat, Send, Bubble} from 'react-native-gifted-chat';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useChatMessage} from '../../hooks/useChat';
import ChatRoomScrollView from '../../components/chatRooms';
import {StyledMIcon} from '../../components/icon';
import {Pressable} from 'react-native';

const Chat = () => {
  const navigator = useNavigation();
  const {messages, room_id, handleFetchMessages, handleSend} = useChatMessage();
  const {currentChatUser} = useChatContext();

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {backgroundColor: theme.colors.gray[200]},
          right: {
            backgroundColor: theme.colors.cyan[500],
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: theme.colors.gray[700],
          },
        }}
        containerStyle={{
          right: {alignItems: 'flex-end', width: '100%'},
          left: {alignItems: 'flex-start', width: '100%'},
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  const renderSend = props => {
    return (
      <Send {...props}>
        <>
          <Icon
            name="send-circle"
            style={{marginBottom: 5, marginRight: 5}}
            size={40}
            color={theme.colors.cyan[500]}
          />
        </>
      </Send>
    );
  };

  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => navigator.goBack()}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.gray[200]}>
          <StyledMIcon
            name="arrow-back"
            size={15}
            color={theme.colors.gray[800]}
            onPress={() => navigator.goBack()}
          />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        Chat
      </StyledText>
      <StyledSpacer flex={1} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      <YStack
        paddingHorizontal={16}
        justifyContent="flex-start"
        alignItems="flex-start">
        <ChatRoomScrollView
          onPress={async room_id => await handleFetchMessages(room_id)}
        />
      </YStack>
      <GiftedChat
        messages={[...messages].reverse()}
        onSend={newMessages =>
          handleSend(room_id, currentChatUser?.uid, newMessages)
        }
        user={{
          _id: currentChatUser?.uid,
          name: currentChatUser?.displayName || 'User',
        }}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
      />
    </StyledSafeAreaView>
  );
};

export default Chat;
