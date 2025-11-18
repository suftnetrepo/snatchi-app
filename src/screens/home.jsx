import React, { useState, useRef, useCallback } from 'react';
import {
  YStack,
  XStack,
  StyledSafeAreaView,
  StyledCycle,
  StyledText,
  StyledHeader,
  StyledSpacer,
  StyledButton,
} from 'fluent-styles';
import { StyledMIcon } from '../components/icon';
import { theme } from '../utils/theme';
import { fontStyles } from '../utils/fontStyles';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppContext } from '../hooks/appContext';
import { getGreetings, toWordCase } from '../utils/help';
import { useFocus } from '../hooks/useFocus';
import { Platform, ScrollView } from 'react-native';
import Dashboard from '../components/dashboard';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { Bell } from '../components/badges/bell';
import CalendarStrip from '../components/calender/calendarStrip';

const Home = ({ route }) => {
  const { setTabBarVisible } = route.params || {};
  const navigate = useNavigation();
  const { user } = useAppContext();
  const { key } = useFocus();
  const [selected, setSelected] = useState('dashboard');
  const scrollViewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
    }, [setTabBarVisible]),
  );

  const handleSelectItem = index => {
    const itemWidth = 100;
    const scrollToX = index * itemWidth;
    scrollViewRef?.current?.scrollTo({ x: scrollToX, animated: true });
  };

  const RenderHeader = () => {
    return (
      <XStack
        flex={1}
        backgroundColor={theme.colors.gray[1]}
        borderRadius={16}
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={8}
        marginHorizontal={16}
        paddingHorizontal={8}>
        <YStack>
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontSize={theme.fontSize.normal}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[400]}>
            {getGreetings()}
          </StyledText>
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontSize={theme.fontSize.normal}
            fontWeight={theme.fontWeight.bold}
            color={theme.colors.gray[800]}>
            {toWordCase(user?.first_name)} {toWordCase(user?.last_name)}
          </StyledText>
        </YStack>
        <StyledSpacer flex={1} />
        <StyledSpacer marginHorizontal={4} />
        <XStack>
          <Bell
            onPress={() => { navigate.navigate('notify'); }}
          />
          <StyledSpacer marginHorizontal={2} />
          <Pressable
            onPress={() => {
              navigate.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'login' }],
                }),
              );
            }}>
            <StyledCycle
              paddingHorizontal={10}
              borderWidth={1}
              width={46}
              height={46}
              borderColor={theme.colors.gray[300]}>
              <StyledMIcon
                size={24}
                name="exit-to-app"
                color={theme.colors.gray[800]}
                onPress={() => {
                  navigate.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'login' }],
                    }),
                  );
                }}
              />
            </StyledCycle>
          </Pressable>
        </XStack>
      </XStack>
    );
  };

  return (
    <StyledSafeAreaView flex={1} backgroundColor={theme.colors.gray[100]}>
      {Platform.OS === 'android' && <StyledSpacer marginVertical={6} />}
      <StyledHeader skipAndroid={Platform.OS === 'android' ? false : true} statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack
        key={key}
        justifyContent="flex-start"
        alignItems="start"
        paddingHorizontal={24}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={16}>
            <StyledButton
              borderRadius={35}
              borderColor={
                selected === 'dashboard'
                  ? theme.colors.gray[800]
                  : theme.colors.gray[1]
              }
              backgroundColor={
                selected === 'dashboard'
                  ? theme.colors.gray[800]
                  : theme.colors.gray[1]
              }
              onPress={() => {
                setSelected('dashboard');
                handleSelectItem(3);
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
                    selected === 'dashboard'
                      ? theme.colors.gray[1]
                      : theme.colors.gray[800]
                  }>
                  Dashboard
                </StyledText>
              </XStack>
            </StyledButton>
            <StyledSpacer marginHorizontal={8} />
            <StyledButton
              borderRadius={35}
              borderColor={
                selected === 'calender'
                  ? theme.colors.gray[800]
                  : theme.colors.gray[1]
              }
              backgroundColor={
                selected === 'calender'
                  ? theme.colors.gray[800]
                  : theme.colors.gray[1]
              }
              onPress={() => {
                setSelected('calender');
                handleSelectItem(2);
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
                    selected === 'calender'
                      ? theme.colors.gray[1]
                      : theme.colors.gray[800]
                  }>
                  Calender
                </StyledText>
              </XStack>
            </StyledButton>
          </XStack>
        </ScrollView>
      </YStack>
      <YStack flex={1}>
        {selected === 'calender' && (
           <CalendarStrip
           user_id={user?.user_id}
            />
        )}
        {selected === 'dashboard' && (
          <Dashboard user_id={user?.user_id} />
        )}
      </YStack>
    </StyledSafeAreaView>
  );
};

export default Home;
