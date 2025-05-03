import React, {useCallback} from 'react';
import {Dimensions} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import SingleChat from './tab/singleChat';
import GroupChat from './tab/groupChat';
import {Box, HStack, VStack, Icon} from '@gluestack-ui/themed';
import {View, Platform, StatusBar as RNStatusBar} from 'react-native';
import {ArrowLeftIcon} from '@gluestack-ui/themed';
import {styled} from '@gluestack-style/react';
import {theme} from '../../utils/theme';
import {useChatContext} from '../../hooks/ChatContext';
import {useFocusEffect} from '@react-navigation/native';
import {ChatContextProvider} from '../../hooks/ChatContext';
import ChatRoomScrollView from '../../components/chatRooms';

const MyChat = () => {
  const [index, setIndex] = React.useState(0);
  const {currentChatUser} = useChatContext();
  const [routes] = React.useState([
    {key: 'single_chat', title: 'Single Chat'},
    {key: 'group_chat', title: 'Group Chat'},
  ]);

  console.log('.....................currentChatUser', currentChatUser);

  const data = 'Hello from parent!';
  const user = {name: 'Abel'};

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.colors.gray[800], height: 3}}
      style={{
        backgroundColor: theme.colors.gray[100],
        borderWidth: 1,
        borderColor: theme.colors.gray[100],
      }}
      labelStyle={{fontWeight: 'bold'}}
      activeColor={theme.colors.gray[800]}
      inactiveColor={theme.colors.gray[400]}
    />
  );

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'single_chat':
        return <SingleChat data={user} />;
      case 'group_chat':
        return <GroupChat user={data} />;
      default:
        return null;
    }
  };

  const StatusBarWrapper = styled(View, {
    height: Platform.OS === 'ios' ? 48 : RNStatusBar.currentHeight,
  });

  const Cycle = ({width, height, children}) => (
    <Box
      bg="$gray1"
      borderColor="$gray300"
      borderWidth={1}
      width={width}
      height={height}
      justifyContent="center"
      alignItems="center"
      borderRadius={100}>
      {children}
    </Box>
  );

  return (
    <Box flex={1} safeAreaTop safeAreaBottom>
      <StatusBarWrapper style={{backgroundColor: '#f8f9fa'}}>
        <RNStatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        />
      </StatusBarWrapper>
      <HStack
        width="$auto"
        paddingHorizontal={16}
        paddingVertical={8}
        justifyContent="space-between"
        alignItems="center">
        <Cycle width={48} height={48}>
          <Icon as={ArrowLeftIcon} size="md" color="$gray800" />
        </Cycle>
      </HStack>
      <ChatRoomScrollView />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene} // custom renderScene here!
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{width: Dimensions.get('window').width}}
      />
    </Box>
  );
};

const Chat = ({route}) => {
  const {setTabBarVisible} = route.params || {};

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
    }, [setTabBarVisible]),
  );

  return (
    <ChatContextProvider>
      <MyChat />
    </ChatContextProvider>
  );
};

export default Chat;
