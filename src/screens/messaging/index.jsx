import React, {useMemo, useState} from 'react';
import {FlatList, Platform, Pressable} from 'react-native';
import {HStack, VStack, Text} from '@gluestack-ui/themed';
import {
  StyledSpacer, StyledText, StyledHeader, StyledSafeAreaView,
  StyledInput, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {useChatContext, ChatContextProvider} from '../../hooks/ChatContext';
import {useNavigation} from '@react-navigation/native';
import {useChatRoom} from '../../hooks/useChat';
import {formatMessageTimestamp} from '../../utils/help';
import ChatRoomScrollView from '../../components/chatRooms';
import {Cycle} from '../../components/gluestack/cycle';

const INDIGO = '#4f46e5';

const MyMessaging = () => {
  const navigation = useNavigation();
  const {currentChatUser, authLoading, authError, clearChatAuthError} = useChatContext();
  const {data, loading, error, handleReset} = useChatRoom(currentChatUser?.uid);
  const [roomType, setRoomType] = useState('All');
  const [search, setSearch] = useState('');

  const conversations = useMemo(() => {
    const value = search.trim().toLowerCase();
    return (Array.isArray(data) ? data : []).filter(room => {
      const matchesType = roomType === 'All'
        || (roomType === 'group' ? room.type === 'group' : room.type !== 'group');
      const matchesSearch = !value || [room.name, room.title, room.lastMessage]
        .filter(Boolean)
        .some(text => String(text).toLowerCase().includes(value));
      return matchesType && matchesSearch;
    });
  }, [data, roomType, search]);

  const renderRoom = ({item: room}) => {
    const unreadCount = Number(room?.unreadCount?.[currentChatUser?.uid] || 0);
    const isGroup = room?.type === 'group';
    return (
      <Pressable onPress={() => navigation.navigate('chat', {room})}>
        <HStack marginHorizontal={16} marginBottom={10} borderRadius={16} borderWidth={1} borderColor={unreadCount ? '$indigo200' : '$gray200'} bgColor="$white" padding={14} alignItems="center">
          <Cycle width={48} height={48} borderColor={isGroup ? '#e0e7ff' : '#eef2f6'} bgColor={isGroup ? '#e0e7ff' : '#eef2f6'}>
            <Icon name={isGroup ? 'groups' : 'person'} size={25} color={isGroup ? INDIGO : theme.colors.gray[700]} />
          </Cycle>
          <VStack flex={1} marginLeft={12}>
            <HStack alignItems="center">
              <Text flex={1} numberOfLines={1} fontSize="$md" color="$gray900" fontWeight={unreadCount ? '$bold' : '$semibold'}>{room?.name || room?.title || (isGroup ? 'Group conversation' : 'Direct conversation')}</Text>
              <Text marginLeft={8} color={unreadCount ? '$indigo600' : '$gray500'} fontSize="$xs">{formatMessageTimestamp(room?.lastMessageTimestamp)}</Text>
            </HStack>
            <HStack marginTop={4} alignItems="center">
              <Text flex={1} numberOfLines={1} fontSize="$sm" color={unreadCount ? '$gray800' : '$gray500'} fontWeight={unreadCount ? '$medium' : '$normal'}>{room?.lastMessage || 'Start the conversation'}</Text>
              {unreadCount > 0 && <Cycle marginLeft={8} width={24} height={24} borderColor={INDIGO} bgColor={INDIGO}><Text color="$white" fontSize="$xs" fontWeight="$bold">{unreadCount > 99 ? '99+' : unreadCount}</Text></Cycle>}
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <HStack paddingHorizontal={16} paddingVertical={12} alignItems="center" backgroundColor={theme.colors.gray[1]}>
            <VStack><StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]} fontSize={theme.fontSize.large}>Messages</StyledText><StyledText marginTop={2} color={theme.colors.gray[500]} fontSize={theme.fontSize.small}>{data?.length || 0} conversation{data?.length === 1 ? '' : 's'}</StyledText></VStack>
            <StyledSpacer flex={1} />
          </HStack>
        </StyledHeader.Full>
      </StyledHeader>
      <HStack height={48} marginHorizontal={16} marginTop={8} borderRadius={14} borderWidth={1} borderColor="$gray200" bgColor="$white" alignItems="center" paddingHorizontal={12}>
        <Icon name="search" size={22} color={theme.colors.gray[500]} />
        <StyledInput height={46} borderColor={theme.colors.gray[1]} flex={1} value={search} onChangeText={setSearch} placeholder="Search conversations" borderWidth={0} backgroundColor={theme.colors.gray[1]} />
        {!!search && <Pressable onPress={() => setSearch('')}><Icon name="close" size={20} color={theme.colors.gray[500]} /></Pressable>}
      </HStack>
      <ChatRoomScrollView onPress={setRoomType} />
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderRoom}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 4, paddingBottom: 100, flexGrow: 1}}
        ListEmptyComponent={!loading ? <VStack flex={1} justifyContent="center" alignItems="center" padding={32}><Cycle width={72} height={72} borderColor="#eef2f6" bgColor="#eef2f6"><Icon name="chat-bubble-outline" size={30} color={theme.colors.gray[400]} /></Cycle><Text marginTop={16} fontSize="$lg" fontWeight="$bold" color="$gray900">{search ? 'No conversations found' : 'No conversations yet'}</Text><Text marginTop={6} textAlign="center" color="$gray500">{search ? 'Try another name or message.' : 'Your booking conversations will appear here.'}</Text></VStack> : null}
      />
      {(loading || authLoading) && <StyledSpinner />}
      {(error || authError) && <StyledOkDialog title="Unable to load messages" description={error || authError} visible onOk={() => { handleReset(); clearChatAuthError(); }} />}
    </StyledSafeAreaView>
  );
};

const Messaging = ({route}) => {
  return <ChatContextProvider><MyMessaging /></ChatContextProvider>;
};

export default Messaging;
