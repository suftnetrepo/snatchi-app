import React, { Fragment, useEffect } from 'react';
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
  StyledOkDialog,
  StyledSpinner,
  StyledButton
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
  ScrollView,
  Platform,
} from 'react-native';
import {
  backgroundColorHelper,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  textColorHelper,
  limitHtmlTextByWord,
  formatDateTime,
  Status_data
} from '../../utils/help';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTask } from '../../hooks/useTask';
import { useAppContext } from '../../hooks/appContext';
import { useFocus } from '../../hooks/useFocus';

const Task = () => {
  const { key } = useFocus()
  const navigator = useNavigation();
  const { status, updateChangeStatus } = useAppContext()
  const route = useRoute();
  const { id, from } = route.params;
  const { data: taskData, error, loading, filteMyTasks, handleMyTasksById, filterValue } = useTask(id);

  useEffect(() => {
    if (status) {
      handleMyTasksById(id).then(() => {
        updateChangeStatus(false)
      })
    }
  }, [key, status, id])

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
            navigator.navigate(from, {
              id: id,
            }),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.gray[400]}>
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
    const { name, priority, status, startDate, endDate, description } = item;

    return (
      <StyledCard
        borderRadius={16}
        marginBottom={8}
        borderColor={theme.colors.gray[1]}
        backgroundColor={theme.colors.gray[1]}
        paddingVertical={8}
        paddingHorizontal={8}
        borderWidth={1}
        pressable={true}
        pressableProps={{
          onPress: () =>
            navigator.navigate('task-details', {
              task: item,
            }),
        }}>
        <YStack>
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.bold}
            fontSize={theme.fontSize.normal}
            flex={1}
            color={theme.colors.gray[800]}>
            {name}
          </StyledText>
          <StyledSpacer marginVertical={2} />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.medium}
            flex={1}
            color={theme.colors.gray[800]}>
            {limitHtmlTextByWord(description, 200)}
          </StyledText>
          <StyledSpacer marginVertical={4} />
          <XStack justifyContent="flex-start" alignItems="center" gap={4}>
            <StyledBadge
              paddingHorizontal={8}
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.medium}
              fontSize={theme.fontSize.small}
              paddingVertical={4}
              backgroundColor={backgroundColorHelper(status)}
              borderColor={backgroundColorHelper(status)}
              color={textColorHelper(status)}>
              {status}
            </StyledBadge>
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
          <StyledSpacer marginVertical={4} />
          <XStack
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            paddingHorizontal={4}>
            <YStack>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.bold}
                fontSize={theme.fontSize.medium}
                color={theme.colors.gray[800]}>
                Start Date
              </StyledText>
              <XStack justifyContent="flex-start" alignItems="center">
                <Icon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.medium}
                  color={theme.colors.gray[800]}>
                  {formatDateTime(startDate)}
                </StyledText>
              </XStack>
            </YStack>
            <YStack>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.bold}
                fontSize={theme.fontSize.medium}
                color={theme.colors.gray[800]}>
                End Date
              </StyledText>
              <XStack justifyContent="flex-start" alignItems="center">
                <Icon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.medium}
                  color={theme.colors.gray[800]}>
                  {formatDateTime(endDate)}
                </StyledText>
              </XStack>
            </YStack>
          </XStack>
          {/* <XStack
            justifyContent="space-between"
            marginTop={2}
            alignItems="center">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              marginHorizontal={3}
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

           
          </XStack> */}
        </YStack>
      </StyledCard>
    );
  };

  const RenderStatus = () => {
    return (
      <XStack
        gap={8}
        justifyContent="flex-start"
        alignItems="center"
        borderRadius={32}
        paddingHorizontal={8}
        paddingVertical={8}
        backgroundColor={theme.colors.gray[1]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Status_data.map((status, index) => (
            <Fragment key={index}>
              <StyledButton
                borderRadius={32}
                borderWidth={filterValue === status ? 2 : 0}
                borderColor={filterValue === status ? theme.colors.blue[500] : theme.colors.gray[100]}
                backgroundColor={theme.colors.gray[100]}
                onPress={() => {
                  if (status === 'All') {
                    filteMyTasks('');
                  } else {
                    filteMyTasks(status);
                  }
                }}
              >
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[800]}
                  paddingHorizontal={12}
                  paddingVertical={4}
                  fontSize={theme.fontSize.small}>
                  {status}
                </StyledText>
              </StyledButton>
              <StyledSpacer marginHorizontal={2} />
            </Fragment>

          ))}
        </ScrollView>
      </XStack>
    )
  }

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
      <YStack flex={1} backgroundColor={theme.colors.gray[100]} paddingHorizontal={16} paddingVertical={16}>
        <RenderStatus />
        <StyledSpacer marginVertical={6} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {taskData?.map((item, index) => (
            <RenderCard key={index} item={item} />
          ))}
        </ScrollView>
      </YStack>
      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            navigator.goBack();
          }}
        />
      )}
      {loading && <StyledSpinner />}
    </StyledSafeAreaView>
  );
};

export default Task;
