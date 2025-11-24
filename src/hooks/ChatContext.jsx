import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { store } from '../utils/asyncStorage';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState({
    currentChatUser: null,
    chatRoomId: null,
    chatRoom: null,
  });

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const cleanUser = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            providerData: user.providerData
          };

          setState((prev) => ({
            ...prev,
            currentChatUser: cleanUser,
          }));

          await store("chatUser", JSON.stringify(cleanUser));
        } else {
          setState((prev) => ({
            ...prev,
            currentChatUser: null,
          }));

          await store("chatUser", "null");
        }
      } catch (error) {
        console.error("Auth listener error:", error);
      }
    });

    return () => unsubscribe();

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
