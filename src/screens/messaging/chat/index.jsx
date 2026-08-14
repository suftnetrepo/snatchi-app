import React, {useEffect, useRef, useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput} from 'react-native';
import {
  YStack, XStack, StyledHeader, StyledSafeAreaView, StyledSpacer, StyledText,
  StyledCycle, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import {theme} from '../../../utils/theme';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useChatContext, ChatContextProvider} from '../../../hooks/ChatContext';
import {useChatMessage} from '../../../hooks/useChat';
import {Cycle} from '../../../components/gluestack/cycle';

const INDIGO = '#4f46e5';

const isSameSender = (a, b) => a && b && (a.senderId || a.user?._id) === (b.senderId || b.user?._id);
const isSameMinute = (a, b) => a && b && Math.abs(+new Date(a.createdAt) - +new Date(b.createdAt)) < 60000;
const formatTime = value => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
const dayLabel = value => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], {day: 'numeric', month: 'short', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined});
};

const MyChat = ({route}) => {
  const navigation = useNavigation();
  const room = route.params?.room;
  const listRef = useRef(null);
  const {currentChatUser} = useChatContext();
  const {messages, loading, error, handleSend, handleMarkMessagesAsRead, handleReset} = useChatMessage(room?.id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const isGroup = room?.type === 'group';

  useEffect(() => {
    if (room?.id && currentChatUser?.uid) {
      handleMarkMessagesAsRead(room.id, currentChatUser.uid);
    }
    // Mark once when the room/user becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, currentChatUser?.uid]);

  const send = async () => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    const sent = await handleSend(room.id, currentChatUser?.uid, [{text: message}]);
    if (sent) setText('');
    setSending(false);
  };

  const renderMessage = ({item: message, index}) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const senderId = message.senderId || message.user?._id;
    const mine = senderId === currentChatUser?.uid;
    const startsGroup = !isSameSender(previous, message) || !isSameMinute(previous, message);
    const endsGroup = !isSameSender(next, message) || !isSameMinute(next, message);
    const showDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
    return (
      <YStack>
        {showDay && <XStack justifyContent="center" marginVertical={18}><YStack paddingHorizontal={12} paddingVertical={5} borderRadius={14} backgroundColor={theme.colors.gray[200]}><StyledText fontSize={theme.fontSize.micro} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[600]}>{dayLabel(message.createdAt)}</StyledText></YStack></XStack>}
        <XStack justifyContent={mine ? 'flex-end' : 'flex-start'} marginBottom={endsGroup ? 10 : 3}>
          <YStack maxWidth="82%" alignItems={mine ? 'flex-end' : 'flex-start'}>
            {!mine && isGroup && startsGroup && <StyledText marginLeft={8} marginBottom={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{message.user?.name || 'Team member'}</StyledText>}
            <YStack paddingHorizontal={15} paddingVertical={11} borderRadius={18} borderTopRightRadius={mine && startsGroup ? 6 : 18} borderTopLeftRadius={!mine && startsGroup ? 6 : 18} backgroundColor={mine ? INDIGO : theme.colors.gray[1]} borderWidth={mine ? 0 : 1} borderColor={theme.colors.gray[200]}>
              <StyledText lineHeight={23} fontSize={theme.fontSize.medium} color={mine ? theme.colors.gray[1] : theme.colors.gray[900]}>{message.text}</StyledText>
            </YStack>
            {endsGroup && <StyledText marginTop={3} marginHorizontal={7} fontSize={theme.fontSize.micro} color={theme.colors.gray[400]}>{formatTime(message.createdAt)}{mine ? (message.isRead ? '  ·  Read' : '  ·  Sent') : ''}</StyledText>}
          </YStack>
        </XStack>
      </YStack>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}} keyboardVerticalOffset={0}>
        <StyledHeader skipAndroid={Platform.OS !== 'android'}>
          <StyledHeader.Full>
            <XStack paddingHorizontal={14} paddingVertical={10} alignItems="center" backgroundColor={theme.colors.gray[1]} borderBottomWidth={1} borderColor={theme.colors.gray[200]}>
              <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back to messages">
                <StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}><Icon name="arrow-back" size={23} color={theme.colors.gray[900]} /></StyledCycle>
              </Pressable>
              <StyledSpacer marginHorizontal={5} />
              <Cycle width={46} height={46} borderColor={isGroup ? '#c7d2fe' : '#e0e7ff'} bgColor={isGroup ? '#eef2ff' : '#f5f7ff'}><Icon name={isGroup ? 'groups' : 'work-outline'} size={23} color={INDIGO} /></Cycle>
              <YStack flex={1} marginLeft={11}><StyledText numberOfLines={1} fontSize={theme.fontSize.medium} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{room?.name || room?.title || 'Conversation'}</StyledText><XStack marginTop={3} alignItems="center"><YStack width={7} height={7} borderRadius={4} backgroundColor="#22c55e" /><StyledText marginLeft={6} fontSize={theme.fontSize.micro} color={theme.colors.gray[500]}>{isGroup ? `${room?.users?.length || 0} members` : 'Booking conversation'}</StyledText></XStack></YStack>
            </XStack>
          </StyledHeader.Full>
        </StyledHeader>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id || item.id}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
          ListEmptyComponent={!loading ? <YStack flex={1} justifyContent="center" alignItems="center" padding={30}><StyledCycle height={70} width={70} borderColor="#e0e7ff" backgroundColor="#e0e7ff"><Icon name="waving-hand" size={29} color={INDIGO} /></StyledCycle><StyledText marginTop={16} fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Start the conversation</StyledText><StyledText marginTop={6} textAlign="center" color={theme.colors.gray[500]}>Send a message about the booking or work.</StyledText></YStack> : null}
        />

        <XStack paddingHorizontal={14} paddingTop={10} paddingBottom={Platform.OS === 'ios' ? 10 : 12} alignItems="flex-end" backgroundColor={theme.colors.gray[1]} borderTopWidth={1} borderColor={theme.colors.gray[200]}>
          <XStack flex={1} minHeight={50} maxHeight={120} paddingHorizontal={15} borderRadius={25} borderWidth={1} borderColor={text ? '#c7d2fe' : theme.colors.gray[300]} backgroundColor={theme.colors.gray[50]} alignItems="center">
            <TextInput style={styles.composerInput} value={text} onChangeText={setText} placeholder="Write a message…" placeholderTextColor={theme.colors.gray[400]} multiline maxLength={2000} returnKeyType="default" />
          </XStack>
          <Pressable onPress={send} disabled={!text.trim() || sending}>
            <StyledCycle marginLeft={9} height={50} width={50} borderColor={text.trim() ? INDIGO : theme.colors.gray[200]} backgroundColor={text.trim() ? INDIGO : theme.colors.gray[100]}><Icon name={sending ? 'more-horiz' : 'send'} size={22} color={text.trim() ? '#fff' : theme.colors.gray[400]} /></StyledCycle>
          </Pressable>
        </XStack>
        {loading && <StyledSpinner />}
        {error && <StyledOkDialog title="Message not sent" description={error} visible onOk={handleReset} />}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

const Chat = ({route}) => <ChatContextProvider><MyChat route={route} /></ChatContextProvider>;
export default Chat;

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    flexGrow: 1,
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
  },
});
