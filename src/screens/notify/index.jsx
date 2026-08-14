import React from 'react';
import { Platform } from 'react-native';
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
      paddingHorizontal={16}
      paddingVertical={10}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[1]}
      borderBottomWidth={1}
      borderColor={theme.colors.gray[200]}>
      <Pressable onPress={() => {
        navigator.goBack()
      }}>
        <StyledCycle
          height={42}
          width={42}
          borderColor={theme.colors.gray[200]}>
          <Icon name="arrow-back" size={24} color={theme.colors.gray[900]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={8} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.bold}
        color={theme.colors.gray[900]}
        fontSize={theme.fontSize.large}>
        Bookings
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

        <YStack flex={1} backgroundColor={theme.colors.gray[1]}>
          <CalendarNotification />
        </YStack>
    </StyledSafeAreaView>
  );
}
