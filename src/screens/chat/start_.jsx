import React, {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {ChatContextProvider} from '../../hooks/ChatContext';
import RenderChat from './chat';


const Chat = ({route}) => {
  const {setTabBarVisible} = route.params || {};

  useFocusEffect(
     useCallback(() => {
       setTabBarVisible(false);
     }, [setTabBarVisible]),
   );

  return (
    <ChatContextProvider>
      <RenderChat />
    </ChatContextProvider>
  );
};

export default Chat;
