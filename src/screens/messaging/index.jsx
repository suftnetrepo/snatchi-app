import React, { useCallback } from 'react';
import { HStack, VStack, Text } from '@gluestack-ui/themed';
import {
  StyledCycle,
  StyledSpacer,
  StyledText,
  StyledHeader,
  StyledSafeAreaView,
} from 'fluent-styles';
import { Platform, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontStyles, theme } from '../../utils/theme';
import { useChatContext } from '../../hooks/ChatContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChatContextProvider } from '../../hooks/ChatContext';
import { useChatRoom } from '../../hooks/useChat';
import { FlatList } from 'react-native';
import { formatMessageTimestamp } from '../../utils/help';
import { StyledMIcon } from '../../components/icon';
import ChatRoomScrollView from '../../components/chatRooms';
import { Spacer } from '../../components/gluestack/spacer';
import { Cycle } from '../../components/gluestack/cycle';

const MyMessaging = () => {
  const navigator = useNavigation();
  const { currentChatUser } = useChatContext();
  const { data, handleFilterChatRooms } = useChatRoom(currentChatUser?.uid);

  const RenderChatRoom = ({ room }) => {
    const unreadCount = room?.unreadCount
      ? room?.unreadCount[currentChatUser?.uid]
      : 0;
    return (
      <Pressable
        onPress={() =>
          navigator.navigate('chat', {
            room: room,
          })
        }>
        <HStack
          mb={8}
          cursor="default"
          marginHorizontal={8}
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray300"
          bgColor="$gray1"
          flex={1}
          paddingHorizontal={8}
          paddingVertical={8}
          justifyContent="flex-start"
          alignItems="center">
          <Cycle
            width={40}
            height={40}
            borderColor={
              room?.type === 'group'
                ? theme.colors.blueGray[400]
                : theme.colors.rose[400]
            }
            bgColor={
              room?.type === 'group'
                ? theme.colors.blueGray[400]
                : theme.colors.rose[400]
            }>
            <StyledMIcon
              name={room?.type === 'group' ? 'people' : 'person'}
              size={24}
              color={
                room?.type === 'group'
                  ? theme.colors.gray[100]
                  : theme.colors.gray[200]
              }
            />
          </Cycle>
          <VStack justifyContent="start" alignItems="start">
            <Text
              paddingHorizontal={8}
              fontSize={'$md'}
              color="$gray800"
              fontWeight={'$medium'}
              fontFamily="$crimson.bold">
              {room?.name}
            </Text>
            <Text
              paddingHorizontal={8}
              fontSize={'$md'}
              color="$gray600"
              fontWeight={'$normal'}
              fontFamily="$crimson.regular">
              {room?.lastMessage}
            </Text>

          </VStack>

          <Spacer flex={1} />
          <VStack justifyContent="center" alignItems="center">
            <Text color="$gray600" paddingHorizontal={8} size={'xs'}>
              {formatMessageTimestamp(room?.lastMessageTimestamp)}
            </Text>
            {unreadCount > 0 && (
              <Cycle
                width={30}
                height={30}
                borderColor={
                  theme.colors.orange[500]
                }
                bgColor={
                  theme.colors.orange[500]
                }>
                <Text color="$gray100" size={'xs'}>
                  {unreadCount}
                </Text>
              </Cycle>
            )}
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  const RenderHeader = () => (
    <HStack
      paddingHorizontal={8}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => navigator.goBack()}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.gray[400]}>
          <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={4} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        Chats
      </StyledText>
      <StyledSpacer flex={1} />
    </HStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      <VStack
        marginHorizontal={4}
        justifyContent="flex-start"
        alignItems="flex-start">
        <ChatRoomScrollView onPress={room => handleFilterChatRooms(room)} />
      </VStack>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <RenderChatRoom key={`${item.id}-${index}`} room={item} />
        )}
      />
    </StyledSafeAreaView>
  );
};

const Messaging = ({ route }) => {
  const { setTabBarVisible } = route.params || {};

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
    }, [setTabBarVisible]),
  );

  return (
    <ChatContextProvider>
      <MyMessaging />
    </ChatContextProvider>
  );
};

export default Messaging;
