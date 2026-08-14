import React, {createContext, useContext, useEffect, useState} from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { store } from '../utils/asyncStorage';
import {useAppContext} from './appContext';

// Matches the existing web chat login until custom-token auth replaces the
// temporary shared credential.
const CHAT_PASSWORD = '12345!';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const {user} = useAppContext();
  const [state, setState] = useState({
    currentChatUser: null,
    chatRoomId: null,
    chatRoom: null,
    authLoading: true,
    authError: null,
  });

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth not initialized');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          const cleanUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            providerData: firebaseUser.providerData,
          };

          setState((prev) => ({
            ...prev,
            currentChatUser: cleanUser,
            authLoading: false,
            authError: null,
          }));

          await store('chatUser', JSON.stringify(cleanUser));
        } else {
          setState((prev) => ({
            ...prev,
            currentChatUser: null,
            authLoading: false,
          }));

          await store('chatUser', 'null');
        }
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });

    return () => unsubscribe();

  }, []);

  useEffect(() => {
    const email = String(user?.email || '').trim().toLowerCase();
    if (!email || auth.currentUser?.email?.toLowerCase() === email) {
      return;
    }

    let active = true;
    setState(prev => ({...prev, authLoading: true, authError: null}));
    signInWithEmailAndPassword(auth, email, CHAT_PASSWORD)
      .catch(error => {
        if (active) {
          setState(prev => ({
            ...prev,
            authLoading: false,
            authError: error?.code === 'auth/invalid-credential'
              ? 'Chat access is not provisioned for this account.'
              : error?.message || 'Unable to connect to chat.',
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [user?.email]);

  const changeChatRoom = (chatRoom) => {
    setState((prevState) => ({
      ...prevState,
      chatRoomId: chatRoom.id,
      chatRoom: chatRoom,
    }));
  };

  const clearChatAuthError = () => {
    setState(prev => ({...prev, authError: null}));
  };

  return (
    <ChatContext.Provider value={{...state, changeChatRoom, clearChatAuthError}}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
