import React, {useCallback} from 'react';
import {Box, HStack, VStack, Icon, Text} from '@gluestack-ui/themed';
import {Platform, StatusBar as RNStatusBar, Pressable} from 'react-native';
import {ArrowLeftIcon} from '@gluestack-ui/themed';
import {theme} from '../../utils/theme';
import {useChatContext} from '../../hooks/ChatContext';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ChatContextProvider} from '../../hooks/ChatContext';
import {useChatRoom} from '../../hooks/useChat';
import {FlatList} from 'react-native';
import {formatMessageTimestamp} from '../../utils/help';
import {StyledMIcon} from '../../components/icon';
import ChatRoomScrollView from '../../components/chatRooms';
import {Spacer} from '../../components/gluestack/spacer';
import {Cycle} from '../../components/gluestack/cycle';

const MyMessaging = () => {
  const navigator = useNavigation();
  const {currentChatUser} = useChatContext();
  const {data, handleFilterChatRooms} = useChatRoom(currentChatUser?.uid);

  const RenderChatRoom = ({room}) => {
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
          borderRadius={8}
          borderWidth={1}
          borderColor="$gray100"
          bgColor="$gray100"
          flex={1}
          paddingHorizontal={4}
          paddingVertical={4}
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
            fontSize={'$sm'}
            color="$gray800"
            fontWeight={'$medium'}
            fontFamily="$crimson.bold">
            {room?.name}
          </Text>
          <Text
            paddingHorizontal={8}
            fontSize={'$xs'}
            color="$gray400"
            fontWeight={'$normal'}
            fontFamily="$crimson.regular">
            {room?.lastMessage}
          </Text>
          
          </VStack>
         
          <Spacer flex={1} />
          <VStack justifyContent="center" alignItems="center">
            <Text color="$gray400" paddingHorizontal={8} size={'xs'}>
              {formatMessageTimestamp(room?.lastMessageTimestamp)}
            </Text>
            {unreadCount > 0 && (
              <Cycle
                width={20}
                height={20}
                borderColor={
                  theme.colors.orange[400]
                }
                bgColor={
                  theme.colors.orange[400]
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

  return (
    <Box flex={1} safeAreaTop safeAreaBottom backgroundColor="$gray200">
      <RNStatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <HStack
        width="$auto"
        paddingTop={48}
        bg="$gray100"
        paddingHorizontal={16}
        paddingVertical={8}
        justifyContent="flex-start"
        alignItems="center">
        <Pressable onPress={() => navigator.canGoBack() && navigator.goBack()}>
          <Cycle width={48} height={48}>
            <Icon as={ArrowLeftIcon} size="md" color="$gray800" />
          </Cycle>
        </Pressable>

        <Text paddingHorizontal={8} fontSize={'$md'} fontWeight={'$bold'}>
          Chats
        </Text>
      </HStack>

      <VStack
        marginHorizontal={4}
        justifyContent="flex-start"
        alignItems="flex-start">
        <ChatRoomScrollView onPress={room => handleFilterChatRooms(room)} />
      </VStack>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <RenderChatRoom key={`${item.id}-${index}`} room={item} />
        )}
      />
    </Box>
  );
};

const Messaging = ({route}) => {
  const {setTabBarVisible} = route.params || {};

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
