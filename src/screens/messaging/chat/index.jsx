import React, {useEffect, useRef, useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Pressable} from 'react-native';
import {
  YStack, XStack, StyledHeader, StyledSafeAreaView, StyledSpacer, StyledText,
  StyledInput, StyledCycle, StyledSpinner, StyledOkDialog,
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
        {showDay && <XStack justifyContent="center" marginVertical={16}><YStack paddingHorizontal={12} paddingVertical={5} borderRadius={14} backgroundColor={theme.colors.gray[200]}><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[600]}>{dayLabel(message.createdAt)}</StyledText></YStack></XStack>}
        <XStack justifyContent={mine ? 'flex-end' : 'flex-start'} marginBottom={endsGroup ? 10 : 3}>
          <YStack maxWidth="82%" alignItems={mine ? 'flex-end' : 'flex-start'}>
            {!mine && isGroup && startsGroup && <StyledText marginLeft={8} marginBottom={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{message.user?.name || 'Team member'}</StyledText>}
            <YStack paddingHorizontal={14} paddingVertical={10} borderRadius={18} borderTopRightRadius={mine && startsGroup ? 5 : 18} borderTopLeftRadius={!mine && startsGroup ? 5 : 18} backgroundColor={mine ? INDIGO : theme.colors.gray[1]} borderWidth={mine ? 0 : 1} borderColor={theme.colors.gray[200]}>
              <StyledText fontSize={theme.fontSize.normal} color={mine ? theme.colors.gray[1] : theme.colors.gray[900]}>{message.text}</StyledText>
            </YStack>
            {endsGroup && <StyledText marginTop={3} marginHorizontal={7} fontSize={theme.fontSize.micro} color={theme.colors.gray[400]}>{formatTime(message.createdAt)}{mine ? (message.isRead ? '  ·  Read' : '  ·  Sent') : ''}</StyledText>}
          </YStack>
        </XStack>
      </YStack>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[50]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}} keyboardVerticalOffset={0}>
        <StyledHeader skipAndroid={Platform.OS !== 'android'}>
          <StyledHeader.Full>
            <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" backgroundColor={theme.colors.gray[1]} borderBottomWidth={1} borderColor={theme.colors.gray[200]}>
              <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Icon name="arrow-back" size={26} color={theme.colors.gray[900]} /></Pressable>
              <StyledSpacer marginHorizontal={7} />
              <Cycle width={44} height={44} borderColor={isGroup ? '#e0e7ff' : '#eef2f6'} bgColor={isGroup ? '#e0e7ff' : '#eef2f6'}><Icon name={isGroup ? 'groups' : 'person'} size={24} color={isGroup ? INDIGO : theme.colors.gray[700]} /></Cycle>
              <YStack flex={1} marginLeft={11}><StyledText numberOfLines={1} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{room?.name || 'Conversation'}</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{isGroup ? `${room?.users?.length || 0} members` : 'Direct message'}</StyledText></YStack>
            </XStack>
          </StyledHeader.Full>
        </StyledHeader>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id || item.id}
          renderItem={renderMessage}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 18, flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
          ListEmptyComponent={!loading ? <YStack flex={1} justifyContent="center" alignItems="center" padding={30}><StyledCycle height={70} width={70} borderColor="#e0e7ff" backgroundColor="#e0e7ff"><Icon name="waving-hand" size={29} color={INDIGO} /></StyledCycle><StyledText marginTop={16} fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Start the conversation</StyledText><StyledText marginTop={6} textAlign="center" color={theme.colors.gray[500]}>Send a message about the booking or work.</StyledText></YStack> : null}
        />

        <XStack paddingHorizontal={12} paddingTop={10} paddingBottom={Platform.OS === 'ios' ? 10 : 12} alignItems="flex-end" backgroundColor={theme.colors.gray[1]} borderTopWidth={1} borderColor={theme.colors.gray[200]}>
          <XStack flex={1} minHeight={48} maxHeight={120} paddingHorizontal={12} borderRadius={24} borderWidth={1} borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} alignItems="center">
            <StyledInput flex={1} value={text} onChangeText={setText} placeholder="Message" placeholderTextColor={theme.colors.gray[400]} borderWidth={0} backgroundColor={theme.colors.gray[1]} multiline maxLength={2000} />
          </XStack>
          <Pressable onPress={send} disabled={!text.trim() || sending}>
            <StyledCycle marginLeft={9} height={48} width={48} borderColor={text.trim() ? INDIGO : theme.colors.gray[200]} backgroundColor={text.trim() ? INDIGO : theme.colors.gray[200]}><Icon name={sending ? 'more-horiz' : 'arrow-upward'} size={24} color={text.trim() ? '#fff' : theme.colors.gray[400]} /></StyledCycle>
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
