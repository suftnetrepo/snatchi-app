import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Pressable,
} from '@gluestack-ui/themed';
import {
  XStack,
  StyledSafeAreaView,
  StyledCycle,
  StyledText,
  StyledHeader,
  StyledSpacer,
  StyledButton,
  YStack
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme, fontStyles } from '../../utils/theme';
import ProjectNotification from './project';
import CalendarNotification from './calendar';

export default function Notify() {
  const navigator = useNavigation();
  const [tab, setTab] = useState('project');

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
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginHorizontal={8}
          paddingHorizontal={8}
          borderRadius={35}
          borderColor={theme.colors.gray[100]}
          backgroundColor={theme.colors.gray[100]}
          paddingVertical={8}>
          <StyledButton
            borderRadius={35}
            flex={1}
            borderColor={
              tab === 'project'
                ? theme.colors.gray[800]
                : theme.colors.gray[1]
            }
            backgroundColor={
              tab === 'project'
                ? theme.colors.gray[800]
                : theme.colors.gray[1]
            }
            onPress={() => {
              setTab('project');
            }}>
            <XStack
              paddingHorizontal={12}
              paddingVertical={1}
              justifyContent="flex-start"
              alignItems="center">
              <StyledText
                paddingVertical={8}
                paddingHorizontal={16}
                fontFamily={fontStyles.Roboto_Regular}
                color={
                  tab === 'project'
                    ? theme.colors.gray[1]
                    : theme.colors.gray[800]
                }>
                Projects
              </StyledText>
            </XStack>
          </StyledButton>
          <StyledSpacer marginHorizontal={8} />
          <StyledButton
            flex={1}
            borderRadius={35}
            borderColor={
              tab === 'calender'
                ? theme.colors.gray[800]
                : theme.colors.gray[1]
            }
            backgroundColor={
              tab === 'calender'
                ? theme.colors.gray[800]
                : theme.colors.gray[1]
            }
            onPress={() => {
              setTab('calender');
            }}>
            <XStack
              paddingHorizontal={12}
              paddingVertical={1}
              justifyContent="flex-start"
              alignItems="center">
              <StyledText
                paddingVertical={8}
                paddingHorizontal={16}
                fontFamily={fontStyles.Roboto_Regular}
                color={
                  tab === 'calender'
                    ? theme.colors.gray[1]
                    : theme.colors.gray[800]
                }>
                Calender
              </StyledText>
            </XStack>
          </StyledButton>
        </XStack>
        <YStack flex={1} backgroundColor={theme.colors.gray[100]}>
          {
            tab === "calender" && (
              <CalendarNotification />
            )
          }
          {
            tab === "project" && (
              <ProjectNotification />
            )
          }
        </YStack>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
