import React, { useState } from 'react';
import { ScrollView, Platform } from 'react-native';
import {
  HStack,
  Pressable,
} from '@gluestack-ui/themed';
import {
  StyledSafeAreaView,
  StyledCycle,
  StyledText,
  StyledHeader,
  StyledSpacer,
  YStack
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme, fontStyles } from '../../utils/theme';
import CalendarNotification from './calendar';

export default function Notify() {
  const navigator = useNavigation();

  const RenderHeader = () => (
    <HStack
      paddingHorizontal={8}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => {
        navigator.navigate("bottom-tabs")
      }}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.gray[400]}>
          <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={8} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        Notifications
      </StyledText>
      <StyledSpacer flex={1} />
    </HStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <YStack flex={1} paddingHorizontal={16} backgroundColor={theme.colors.gray[100]}>
          <CalendarNotification />
        </YStack>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
