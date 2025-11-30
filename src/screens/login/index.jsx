import React, { useState } from 'react';
import {
  StyledSpinner,
  YStack,
  StyledOkDialog,
  StyledImage,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledInput,
  StyledText,
  StyledButton,
} from 'fluent-styles';
import { fontStyles, theme } from '../../utils/theme';
import { validatorRules } from './validatorRules';
import { useSecure } from '../../hooks/useSecure';
import { useNavigation } from '@react-navigation/native';
import { validate } from '../../validator';
import { Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

const Login = () => {
  const navigator = useNavigation();
  const [errorMessages, setErrorMessages] = useState({});
  const [fields, setFields] = useState(validatorRules.fields);
  const { error, loading, handleLogin, handleReset } = useSecure();

  const onSubmit = async () => {
    setErrorMessages({});
    const { hasError, errors } = validate(fields, validatorRules.rules);
    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    if (
      fields.user_name === '_kabelsus@gmail.com!' ||
      fields.user_name === 'abel.aghorighor@suftnet.com'
    ) {
      navigator.navigate('keypad', {
        email: fields.user_name,
      });
    } else {
      handleLogin({ email: fields.user_name }).then(async result => {
        if (result) {
          navigator.navigate('keypad', {
            email: fields.user_name,
          });
        }
      });
    }
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
      >
        <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} marginHorizontal={8} statusProps={{ translucent: true }}>
          <StyledHeader.Full></StyledHeader.Full>
        </StyledHeader>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack
            height={'100%'}
            marginHorizontal={16}
            flex={1}
            justifyContent="flex-start"
            alignItems="center">
            <StyledSpacer marginVertical={64} />
            <YStack
              marginHorizontal={16}
              justifyContent="center"
              alignItems="center">
              <Pressable onLongPress={() => navigator.navigate("GeofenceTestApp")}>
                <StyledImage
                  borderWidth={0}
                  resizeMode="cover"
                  source={require('../../../assets/img/4.png')}></StyledImage>
              </Pressable>
              <StyledText
                paddingVertical={16}
                paddingHorizontal={16}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[500]}
                textAlign="center"
                fontSize={theme.fontSize.normal}>
                Enter your account email to receive an access code.
              </StyledText>
            </YStack>
            <StyledSpacer marginVertical={16} />
            <StyledInput
              label={'Email address'}
              keyboardType="default"
              placeholder=""
              returnKeyType="next"
              maxLength={50}
              fontSize={theme.fontSize.normal}
              borderColor={theme.colors.gray[200]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={32}
              paddingHorizontal={8}
              value={fields.user_name}
              placeholderTextColor={theme.colors.gray[400]}
              onChangeText={text => setFields({ ...fields, user_name: text })}
              error={!!errorMessages?.user_name}
              errorMessage={errorMessages?.user_name?.message}
            />

            <StyledSpacer marginVertical={8} />
            <StyledButton
              width="100%"
              borderColor={theme.colors.cyan[500]}
              backgroundColor={theme.colors.cyan[500]}
              onPress={() => onSubmit()}>
              <StyledText
                paddingHorizontal={20}
                paddingVertical={10}
                color={theme.colors.gray[1]}>
                Sign in
              </StyledText>
            </StyledButton>
          
          </YStack>
        </ScrollView>
        {error && (
          <StyledOkDialog
            title={error}
            description="Please try again later"
            visible={true}
            onOk={() => {
              handleReset();
            }}
          />
        )}
        {loading && <StyledSpinner />}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default Login;
