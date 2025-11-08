import React, { useState, useRef } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledBadge,
  StyledCard,
  StyledCycle,
  StyledSeparator,
  FlexStyledImage,
  StyledOkDialog,
  StyledButton,
  StyledInput,
  StyledDialog,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
  Linking,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import {
  backgroundColorHelper,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  formatTimeFromDate,
  textColorHelper,
} from '../../utils/help';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTask } from '../../hooks/useTask';

const Task = () => {
  const navigator = useNavigation();
  const { data: taskData, error, success, handleReset } = useTask();

  console.log('Task Data:', taskData);

  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <StyledCycle
        pressable
        pressableProps={{
          onPress: () =>
            navigator.goBack(),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.gray[200]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        My Assignments
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  )

  const RenderCard = ({ item }) => {
    const { name, priority, status, startDate, endDate } = item;

    return (
      <StyledCard
        borderRadius={16}
        marginBottom={8}
        borderColor={theme.colors.gray[1]}
        backgroundColor={theme.colors.gray[1]}
        paddingVertical={16}
        paddingHorizontal={16}
        borderWidth={1}
        pressable={true}
        pressableProps={{
          onPress: () =>
            navigator.navigate('task-details', {
              task: item,
            }),
        }}>
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" gap={1}>
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.bold}
              fontSize={theme.fontSize.large}
              flex={1}
              color={theme.colors.gray[800]}>
              {name}
            </StyledText>
            <StyledSpacer marginHorizontal={2} />
            <StyledCycle
              height={48}
              width={48}
              borderColor={theme.colors.gray[200]}>
              <Icon
                name="chevron-right"
                size={25}
                color={theme.colors.gray[800]}
              />
            </StyledCycle>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center" gap={1}>
            <StyledBadge
              paddingHorizontal={8}
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.medium}
              fontSize={theme.fontSize.small}
              backgroundColor={backgroundColorHelper(status)}
              borderColor={backgroundColorHelper(status)}
              color={textColorHelper(status)}>
              {status}
            </StyledBadge>
          </XStack>
          <XStack
            justifyContent="space-between"
            marginTop={2}
            alignItems="center">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              paddingVertical={4}
              borderRadius={32}>
              <XStack justifyContent="flex-start" alignItems="center" gap={1}>
                <Icon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  color={theme.colors.gray[800]}>
                  {formatTimeFromDate(startDate)}
                </StyledText>
              </XStack>
              <StyledText
                paddingHorizontal={2}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.normal}
                color={theme.colors.gray[800]}>
                -
              </StyledText>
              <XStack justifyContent="flex-start" alignItems="center" gap={1}>
                <Icon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  color={theme.colors.gray[800]}>
                  {formatTimeFromDate(endDate)}
                </StyledText>
              </XStack>
            </XStack>
            <StyledBadge
              paddingHorizontal={8}
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.medium}
              fontSize={theme.fontSize.small}
              backgroundColor={priorityBackgroundColorHelper(priority)}
              paddingVertical={4}
              borderColor={priorityBackgroundColorHelper(priority)}
              color={priorityTextColorHelper(priority)}>
              {priority}
            </StyledBadge>
          </XStack>
        </YStack>
      </StyledCard>
    );
  };

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack backgroundColor={theme.colors.gray[100]} paddingHorizontal={8} paddingVertical={8}>
          {taskData?.map((item, index) => (
            <RenderCard key={index} item={item} />
          ))}
        </YStack>
      </ScrollView>

      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Task status was updated successfully"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
    </StyledSafeAreaView>
  );
};

export default Task;
