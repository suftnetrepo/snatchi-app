import React from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledCycle,
  StyledImage,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import { useNavigation } from '@react-navigation/native';
import { StyledMIcon } from '../../components/icon';
import { Linking, Platform } from 'react-native';

const HelpCenter = () => {
  const navigator = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${'info@suftnet.com'}`);
  };

  const handleDialPress = () => {
    Linking.openURL(`tel:${'+447407022723'}`);
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Header
          backgroundColor={theme.colors.gray[1]}

          onPress={() => navigator.goBack()}
          title="Help Center"
          icon
          cycleProps={{
            borderColor: theme.colors.gray[400],
            marginRight: 8,
          }}
        />
      </StyledHeader>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={theme.colors.gray[50]}>
        <YStack
          width={'80%'}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={8}
          paddingHorizontal={16}
          paddingVertical={16}>
          <StyledSpacer marginVertical={8} />
          <StyledImage
            borderWidth={0}
            source={require('../../../assets/img/logo.png')}></StyledImage>
          <StyledSpacer marginVertical={8} />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontSize={theme.fontSize.normal}>
            Thank you for using Snatchi and for your interest in contacting us.
            We're always here to help and we appreciate your feedback.
          </StyledText>
          <StyledSpacer marginVertical={8} />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontSize={theme.fontSize.medium}>
            {
              'The Gatehouse \n453 Cranbrook Road\nllford Essex IG2 6EW, United Kingdom'
            }
          </StyledText>
          <StyledSpacer marginVertical={8} />
          <XStack justifyContent="space-between" gap={10} alignItems="center">
            <YStack>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontSize={theme.fontSize.medium}
                color={theme.colors.gray[800]}>
                info@suftnet.com
              </StyledText>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontSize={theme.fontSize.medium}
                color={theme.colors.gray[800]}>
                +44 7407 022723
              </StyledText>
            </YStack>
            <StyledSpacer marginHorizontal={1} />
            <XStack justifyContent="flex-end" alignItems="center">
              <StyledCycle
                borderWidth={1}
                backgroundColor={theme.colors.cyan[500]}
                borderColor={theme.colors.cyan[500]}>
                <StyledMIcon
                  name="mail"
                  size={20}
                  color={theme.colors.gray[1]}
                  onPress={handleEmailPress}
                />
              </StyledCycle>
              <StyledSpacer marginHorizontal={2} />
              <StyledCycle
                borderWidth={1}
                backgroundColor={theme.colors.cyan[500]}
                borderColor={theme.colors.cyan[500]}>
                <StyledMIcon
                  name="phone"
                  size={20}
                  color={theme.colors.gray[1]}
                  onPress={handleDialPress}
                />
              </StyledCycle>
            </XStack>
          </XStack>
          <StyledSpacer marginVertical={8} />
          <XStack justifyContent="flex-end" alignItems="center">
            <StyledSpacer flex={1} />
            <StyledText
              color={theme.colors.gray[400]}
              fontSize={theme.fontSize.normal}>
              Version 0.0.1
            </StyledText>
          </XStack>
        </YStack>
      </YStack>
    </StyledSafeAreaView>
  );
};

export default HelpCenter;
