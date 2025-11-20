import React, {useEffect} from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledCycle,
} from 'fluent-styles';
import {theme} from '../../../utils/theme';
import {fontStyles} from '../../../utils/fontStyles';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useChatContext, ChatContextProvider} from '../../../hooks/ChatContext';
import {GiftedChat, Send, Bubble} from 'react-native-gifted-chat';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useChatMessage} from '../../../hooks/useChat';
import {StyledMIcon} from '../../../components/icon';
import {Pressable, Platform} from 'react-native';
import { Cycle } from '../../../components/gluestack/cycle';

const MyChat = ({route}) => {
  const navigator = useNavigation();
  const {messages, room_id, handleFetchMessages, handleSend} = useChatMessage();
  const {currentChatUser} = useChatContext();
  const {room} = route.params;

  useEffect(() => {
    room && handleFetchMessages(room?.id);
  }, [room]);

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
      <StyledMIcon
            name="arrow-back"
            size={30}
            color={theme.colors.gray[800]}
            onPress={() => navigator.goBack()}
          />
      </Pressable>
      <StyledSpacer marginHorizontal={2} />
      <Cycle
        width={40}
        height={40}
        borderColor={
          room?.type === 'group'
            ? theme.colors.yellow[400]
            : theme.colors.rose[400]
        }
        bgColor={
          room?.type === 'group'
            ? theme.colors.yellow[400]
            : theme.colors.rose[400]
        }>
        <StyledMIcon
          name={room?.type === 'group' ? 'people' : 'person'}
          size={24}
          color={
            room?.type === 'group'
              ? theme.colors.gray[600]
              : theme.colors.gray[200]
          }
        />
      </Cycle>
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        paddingHorizontal ={4}
        fontSize={theme.fontSize.small}>
        {room?.name}
      </StyledText>
      <StyledSpacer flex={1} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
      skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

    <YStack flex={1} backgroundColor={theme.colors.gray[100]} >
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
    </YStack>
     
    </StyledSafeAreaView>
  );
};

const Chat = ({route}) => {
  return (
    <ChatContextProvider>
      <MyChat route={route} />
    </ChatContextProvider>
  );
};

export default Chat;
