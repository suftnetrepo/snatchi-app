/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  doc,
  onSnapshot,
  query,
  orderBy,
  collection,
  setDoc,
  addDoc,
  getDocs,
  where,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {db, auth} from '../../firebase';
import {store} from '../utils/asyncStorage';

const useUserChat = () => {
  const [state, setState] = useState({
    user: null,
    loading: false,
    error: null,
  });

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, user: null, error: null};
    });
  };

  const handleSignUp = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
      });

      setState(pre => {
        return {...pre, user: user, loading: false};
      });

      return true;
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleChatSignIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await store('chatUser', JSON.stringify(userCredential.user));
      setState(pre => {
        return {...pre, user: userCredential.user, loading: false};
      });
      return true;
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setState(pre => {
        return {...pre, user: null, loading: false};
      });
      return true;
    } catch (error) {
      handleError(error.message);
    }
  };

  return {
    ...state,
    handleChatSignIn,
    handleSignOut,
    handleSignUp,
    handleReset,
  };
};

const useChatRoom = user_id => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, data: [], error: null};
    });
  };

  const handleFetchChatRooms = userId => {
    try {
      const chatRoomsRef = collection(db, 'chats');
      const chatRoomsQuery = query(
        chatRoomsRef,
        where('users', 'array-contains', userId || 0),
        // orderBy('lastUpdated', 'desc')
      );

      const unsubscribe = onSnapshot(chatRoomsQuery, snapshot => {
        const chatRooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setState(prev => ({
          ...prev,
          data: chatRooms,
          error: null,
        }));
      });

      return unsubscribe;
    } catch (error) {
      handleError(error.message);
    }
  };


  useEffect(() => {
    user_id && handleFetchChatRooms(user_id);
  }, [user_id]);

  return {
    ...state,
    handleReset,
    handleError,
    handleFetchChatRooms,
  };
};

const useChatMessage = chatRoomId => {
  const [state, setState] = useState({
    messages: [],
    loading: false,
    error: null,
    room_id : ''
  });

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleFetchMessages = async chatRoomId => {
    try {
      const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(messagesQuery, snapshot => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setState(pre => {
          return {...pre, messages: messages, loading: false, room_id : chatRoomId};
        });
      });

      return unsubscribe;
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleSend = async (chatRoomId, senderId, newMessages) => {
    let imageURL = null;

   const message = newMessages[0]

    try {
      
      // imageURL = await handleUploadImage(image);
      const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
      const newMessage = {
        _id: new Date().getTime().toString(),
        senderId,
        text: message?.text || '',
        imageURL: imageURL || null,
        timestamp: serverTimestamp(),
        isRead: false,
        user: {
          _id: senderId
        },
      };

      await addDoc(messagesRef, newMessage);

      return true;
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleMarkMessagesAsRead = async (chatRoomId, userId) => {
    try {
      const messagesRef = collection(db, 'chats', chatRoomId, 'messages');

      const querySnapshot = await getDocs(
        query(
          messagesRef,
          where('isRead', '==', false),
          where('senderId', '!=', userId),
        ),
      );

      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.update(doc.ref, {isRead: true});
      });

      await batch.commit();

      return true;
    } catch (error) {
      handleError(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = handleFetchMessages(chatRoomId);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [chatRoomId]);

  return {
    ...state,
    handleFetchMessages,
    handleSend,
    handleMarkMessagesAsRead,
  };
};

export {useUserChat, useChatMessage, useChatRoom};
