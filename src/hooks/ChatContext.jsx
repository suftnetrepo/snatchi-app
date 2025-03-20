import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getStore, store } from '../utils/asyncStorage';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState({
    currentChatUser: null,
    chatRoomId: null,
    chatRoom: null,
  });

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth is not initialized.');
      return;
    }

    const fetchStoredUser = async () => {
      try {
        const storedUser = await getStore('chatUser');
        if (storedUser && storedUser !== 'undefined') {
          setState((prevState) => ({
            ...prevState,
            currentChatUser: JSON.parse(storedUser),
          }));
        }
      } catch (error) {
        console.error('Error fetching stored user:', error);
      }
    };

    fetchStoredUser();

    const unsubscribeAuthListener = onAuthStateChanged(auth, async (user) => {

      try {
        if (user) {
          setState((prevState) => ({
            ...prevState,
            currentChatUser: user,
          }));
          await store('chatUser', JSON.stringify(user));
        } else {
          setState((prevState) => ({
            ...prevState,
            currentChatUser: null,
          }));
          await store('chatUser', null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    });

    return () => unsubscribeAuthListener();
  }, []);

  const changeChatRoom = (chatRoom) => {
    setState((prevState) => ({
      ...prevState,
      chatRoomId: chatRoom.id,
      chatRoom: chatRoom,
    }));
  };

  return (
    <ChatContext.Provider value={{ ...state, changeChatRoom }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
