import React, { useState, useRef } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledImage,
  StyledSpacer,
  StyledText,
  StyledSpinner,
  StyledButton,
  StyledCycle,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animated, Pressable, Vibration, Platform } from 'react-native';
import { theme } from '../utils/theme';
import { fontStyles } from '../utils/fontStyles';
import { useSecure } from '../hooks/useSecure';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useAppContext } from '../hooks/appContext';
import { useUserChat } from '../hooks/useChat';

const Keypad = () => {
  const route = useRoute();
  const navigator = useNavigation();
  const { login } = useAppContext();
  const { error, loading, handleVerifyCode, handleReset } = useSecure();
  const [pin, setPin] = useState('');
  const { email } = route.params;
  const { handleChatSignIn } = useUserChat();
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate(100);
  };

  if (error) {
    triggerShake();
  }

  const handlePress = num => {
    if (pin.length < 6) {
      let passCode = pin + num;
      setPin(pin + num);

      if (passCode.length === 6) {
        handleVerifyCode({ code: passCode, email: email }).then(async result => {
          if (result) {
            await login(result);
            handleChatSignIn(email, '12345!').then(() => { });
            navigator.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'bottom-tabs' }],
              })
            );
          }
        });
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => navigator.goBack()}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.gray[200]}>
          <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
        </StyledCycle>
      </Pressable>

      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        OTP Verification
      </StyledText>
      <StyledSpacer flex={1} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true, hidden: false }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack flex={1} justifyContent="center" alignItems="center">
        <YStack
          marginHorizontal={16}
          justifyContent="center"
          alignItems="center">
          <StyledImage
            borderWidth={0}
            source={require('../../assets/img/icons8--ogin-64.png')}></StyledImage>
          <StyledText
            paddingTop={16}
            paddingHorizontal={24}
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[400]}
            textAlign="center"
            fontSize={theme.fontSize.normal}>
            Enter the 6-digit OTP sent to your registered email address.
          </StyledText>
          <StyledText
            paddingVertical={2}
            paddingHorizontal={16}
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.medium}
            color={theme.colors.gray[800]}
            textAlign="center"
            fontSize={theme.fontSize.normal}>
            {email}
          </StyledText>
        </YStack>

        <StyledSpacer marginVertical={16} />
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <XStack marginBottom={20}>
            {[0, 1, 2, 3, 4, 5].map((_, index) => (
              <YStack
                key={index}
                width={40}
                height={40}
                borderWidth={1}
                borderRadius={10}
                margin={5}
                justifyContent="center"
                alignItems="center">
                <StyledText fontSize={18} fontWeight="bold">
                  {pin[index]}
                </StyledText>
              </YStack>
            ))}
          </XStack>
        </Animated.View>

        <StyledSpacer marginVertical={8} />
        <XStack
          paddingHorizontal={8}
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, index) => (
            <YStack key={index} margin={5}>
              <StyledButton
                width={70}
                height={70}
                borderWidth={1}
                borderRadius={35}
                backgroundColor={theme.colors.gray[1]}
                borderColor={theme.colors.gray[400]}
                key={index}
                onPress={() => handlePress(num.toString())}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontSize={theme.fontSize.xxlarge}
                  fontWeight={theme.fontWeight.bold}>
                  {num}
                </StyledText>
              </StyledButton>
            </YStack>
          ))}
          <StyledButton
            width={70}
            height={70}
            borderWidth={1}
            borderRadius={35}
            backgroundColor={theme.colors.gray[1]}
            borderColor={theme.colors.gray[400]}
            onPress={handleDelete}>
            <StyledText
              fontSize={theme.fontSize.xxlarge}
              fontWeight={theme.fontWeight.bold}>
              ⌫
            </StyledText>
          </StyledButton>
        </XStack>
        <StyledSpacer marginVertical={8} />
      </YStack>
      {loading && <StyledSpinner />}
      {error && handleReset()}
    </StyledSafeAreaView>
  );
};

export default Keypad;
