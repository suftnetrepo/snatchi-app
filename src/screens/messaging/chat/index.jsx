import React, { useEffect, useState } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledInput,
  StyledCycle,
} from 'fluent-styles';
import { theme } from '../../../utils/theme';
import { fontStyles } from '../../../utils/fontStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useChatContext, ChatContextProvider } from '../../../hooks/ChatContext';
import { GiftedChat, Send, Bubble } from 'react-native-gifted-chat';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useChatMessage } from '../../../hooks/useChat';
import { StyledMIcon } from '../../../components/icon';
import { Pressable, Platform, ScrollView } from 'react-native';
import { Cycle } from '../../../components/gluestack/cycle';

const isSameSender = (a, b) =>
  a && b && a.user?._id === b.user?._id;

const isSameMinute = (a, b) =>
  a && b && Math.abs(+new Date(a.createdAt) - +new Date(b.createdAt)) < 60000;

const formatTime = date => {
  const d = new Date(date);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const MyChat = ({ route }) => {
  const navigator = useNavigation();
  const { messages, room_id, handleFetchMessages, handleSend } = useChatMessage();
  const { currentChatUser } = useChatContext();
  const { room } = route.params;
  const [text, setText] = useState('');

  useEffect(() => {
    room && handleFetchMessages(room?.id);
  }, [room]);

  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}
    >
      <Pressable onPress={() => navigator.goBack()}>
        <StyledMIcon
          name="arrow-back"
          size={30}
          color={theme.colors.gray[800]}
          onPress={() => navigator.goBack()}
        />
      </Pressable>

      <StyledSpacer marginHorizontal={6} />

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
        }
      >
        <StyledMIcon
          name={room?.type === 'group' ? 'people' : 'person'}
          size={22}
          color={theme.colors.gray[800]}
        />
      </Cycle>

      <StyledText
        paddingHorizontal={8}
        fontSize={theme.fontSize.small}
        color={theme.colors.gray[700]}
      >
        {room?.name}
      </StyledText>

      <StyledSpacer flex={1} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[100]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
      >
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      {/* MESSAGE LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
  <YStack flex={1} paddingHorizontal={12} paddingVertical={8}>
        {[...messages].map((msg, index, arr) => {
          const prev = arr[index - 1];
          const next = arr[index + 1];

          const isMe = msg.user?._id === currentChatUser?.uid;

          const startsGroup =
            !isSameSender(prev, msg) || !isSameMinute(prev, msg);

          const endsGroup =
            !isSameSender(next, msg) || !isSameMinute(next, msg);

          return (
            <XStack
              key={msg._id}
              justifyContent={isMe ? 'flex-end' : 'flex-start'}
              marginBottom={endsGroup ? 10 : 2}
            >
              <YStack maxWidth="80%" alignItems={isMe ? 'flex-end' : 'flex-start'}>
                {/* Sender name once */}
                {!isMe && startsGroup && (
                  <StyledText
                    fontSize={11}
                    color={theme.colors.gray[500]}
                    marginBottom={2}
                    marginLeft={6}
                  >
                    {msg.user?.name}
                  </StyledText>
                )}

                {/* Bubble */}
                <YStack
                  padding={10}
                  borderRadius={14}
                  backgroundColor={
                    isMe
                      ? theme.colors.cyan[500]
                      : theme.colors.gray[200]
                  }
                  borderTopRightRadius={isMe && startsGroup ? 4 : 14}
                  borderTopLeftRadius={!isMe && startsGroup ? 4 : 14}
                >
                  <StyledText
                    color={isMe ? '#fff' : theme.colors.gray[800]}
                    fontSize={14}
                  >
                    {msg.text}
                  </StyledText>
                </YStack>

                {/* Time once per group */}
                {endsGroup && (
                  <StyledText
                    fontSize={10}
                    color={theme.colors.gray[500]}
                    marginTop={2}
                    marginHorizontal={6}
                  >
                    {formatTime(msg.createdAt)}
                  </StyledText>
                )}
              </YStack>
            </XStack>
          );
        })}
      </YStack>
      </ScrollView>
    
      {/* INPUT */}
      <XStack
        padding={8}
        alignItems="center"
        backgroundColor={theme.colors.gray[50]}
      >
        <XStack
          flex={1}
          padding={8}
          borderRadius={30}
          backgroundColor={theme.colors.gray[200]}
        >
          <StyledInput
            value={text}
            onChangeText={setText}
            borderRadius={30}
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.gray[500]}
            style={{
              flex: 1,
              fontSize: 14,
              color: theme.colors.gray[800],
              paddingVertical: Platform.OS === 'ios' ? 8 : 4,
            }}
            multiline
          />
        </XStack>

        <Pressable
          onPress={() => {
            handleSend(room_id, currentChatUser?.uid, [
              {
                _id: Date.now().toString(),
                text: text.trim(),
                user: { _id: currentChatUser?.uid },
                createdAt: new Date(),
              },
            ])
             setText('');
          }}
        >
          <Icon
            name="send-circle"
            size={48}
            color={theme.colors.gray[800]}
          />
        </Pressable>
      </XStack>
    </StyledSafeAreaView>
  );
};

const Chat = ({ route }) => {
  return (
    <ChatContextProvider>
      <MyChat route={route} />
    </ChatContextProvider>
  );
};

export default Chat;
