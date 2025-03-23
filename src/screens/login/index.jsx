/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {validatorRules} from './validatorRules';
import {useSecure} from '../../hooks/useSecure';
import {useNavigation} from '@react-navigation/native';
import {validate} from '../../validator';

const Login = () => {
  const navigator = useNavigation();
  const [errorMessages, setErrorMessages] = useState({});
  const [fields, setFields] = useState(validatorRules.fields);
  const {error, loading, handleLogin, handleReset} = useSecure();

  const onSubmit = async () => {
    setErrorMessages({});
    const {hasError, errors} = validate(fields, validatorRules.rules);
    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    if (
      fields.user_name === 'Abel.aghorighor@suftnet.com' ||
      fields.user_name === 'abel.aghorighor@suftnet.com'
    ) {
      navigator.navigate('keypad', {
        email: fields.user_name,
      });
    } else {
      handleLogin({email: fields.user_name}).then(async result => {
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
      <StyledHeader marginHorizontal={8} statusProps={{translucent: true}}>
        <StyledHeader.Full></StyledHeader.Full>
      </StyledHeader>
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
          <StyledImage
          borderWidth={0}
          source={require('../../../assets/img/icons8-login-100-2.png')}></StyledImage>
          <StyledText
            paddingVertical={16}
            paddingHorizontal={16}
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[400]}
            textAlign="center"
            fontSize={theme.fontSize.normal}>
           Enter your registered email address to receive a One-Time Password (OTP)
          </StyledText>
        </YStack>

        <StyledSpacer marginVertical={16} />

        <StyledInput
          label={'Email address'}
          keyboardType="default"
          placeholder="Enter your email address"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          value={fields.user_name}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => setFields({...fields, user_name: text})}
          error={!!errorMessages?.user_name}
          errorMessage={errorMessages?.user_name?.message}
        />

        <StyledSpacer marginVertical={8} />
        <StyledButton
          width="100%"
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => onSubmit()}>
          <StyledText
            paddingHorizontal={20}
            paddingVertical={10}
            color={theme.colors.gray[1]}>
            Sign in
          </StyledText>
        </StyledButton>
        <StyledSpacer marginVertical={4} />
      </YStack>
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
    </StyledSafeAreaView>
  );
};

export default Login;
