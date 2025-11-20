import React, { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledImage,
  StyledScrollView,
  StyledCycle,
  StyledSeparator,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { StyledMIcon } from '../../components/icon';
import { fontStyles } from '../../utils/fontStyles';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Pressable, Platform } from 'react-native';

const Settings = () => {
  const navigator = useNavigation();

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
        Settings
      </StyledText>
      <StyledSpacer flex={1} />
    </XStack>
  );

  const RenderRow = ({ icon = 'account-circle', title, screen }) => {
    return (
      <Pressable onPress={() => screen && navigator.navigate(screen)}>
        <XStack
          borderRadius={16}
          marginHorizontal={8}
          marginBottom={4}
          backgroundColor={theme.colors.gray[1]}
          justifyContent="flex-start"
          alignItems="center"
          paddingVertical={8}
          paddingHorizontal={8}>
          <StyledMIcon size={32} name={icon} color={theme.colors.gray[800]} />
          <StyledSpacer marginHorizontal={2} />
          <StyledText
            paddingHorizontal={8}
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.normal}
            color={theme.colors.gray[800]}>
            {title}
          </StyledText>
          <StyledSpacer flex={1} />
          <StyledMIcon
            size={32}
            name="chevron-right"
            color={theme.colors.gray[600]}
          />
        </XStack>
      </Pressable>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[100]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <StyledSpacer marginVertical={8} />
      <XStack
        paddingHorizontal={8}
        paddingVertical={8}
        borderRadius={16}
        marginHorizontal={16}
        justifyContent="flex-start"
        borderColor={theme.colors.gray[200]}
          backgroundColor={theme.colors.gray[1]}
        alignItems="center">
        <StyledImage
          local
          borderRadius={100}
          borderWidth={5}
          borderColor={theme.colors.gray[100]}
          height={90}
          width={90}
          source={require('../../../assets/img/map.png')}
        />
        <YStack flex={1} marginHorizontal={4}>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack flex={1}>
              <StyledText
                paddingHorizontal={2}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.semiBold}
                fontSize={theme.fontSize.normal}
                color={theme.colors.gray[800]}>
                Snatchi
              </StyledText>
              <StyledText
                paddingHorizontal={2}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[800]}>
                2 Riseholme Orten Goldhay
              </StyledText>
            </YStack>
          </XStack>
        </YStack>
      </XStack>

      <StyledScrollView>
        <YStack
          flex={1}
          marginHorizontal={16}
          paddingBottom={8}
          backgroundColor={theme.colors.gray[100]}
          borderRadius={16}>
          <StyledSpacer marginVertical={6} />
          <RenderRow
            icon="info-outline"
            title="Help Center"
            screen="help-center"
          />
          <StyledSpacer marginVertical={4} />
          <RenderRow
            icon="account-circle"
            title="Edit Profile"
            screen="profile"
          />
        </YStack>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default Settings;
