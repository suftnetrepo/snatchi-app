import React, {useEffect} from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledSpacer,
  StyledBadge,
} from 'fluent-styles';
import {Pressable, FlatList} from 'react-native';
import {fontStyles} from '../../utils/fontStyles';
import {theme} from '../../utils/theme';
import {StyledMIcon} from '../icon';
import {
  backgroundColorHelper,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  formatTimeFromDate,
  textColorHelper,
} from '../../utils/help';
import EmptyView from '../shared/empty';
import {useTask} from '../../hooks/useTask';

const CalendarCard = ({date, onSelect}) => {
  const {handleMyTasks, data} = useTask();

  useEffect(() => {
    async function loadCurrentEvents() {
      await handleMyTasks(date);
    }
    loadCurrentEvents();
  }, [date]);

  const RenderCard = ({item}) => {
    const {name, priority, status, startDate, endDate} = item;
    return (
      <XStack
        borderBottomWidth={1}
        paddingVertical={8}
        borderBottomColor={theme.colors.gray[300]}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <StyledText
            textAlign="left"
            paddingHorizontal={8}
            paddingVertical={16}
            fontFamily={fontStyles.Roboto_Bold}
            fontWeight={theme.fontWeight.bold}
            fontSize={theme.fontSize.small}
            color={theme.colors.gray[800]}>
            {formatTimeFromDate(startDate)}
          </StyledText>
        </YStack>
        <Pressable
          onPress={() => {
            onSelect && onSelect(item);
          }}>
          <YStack
            flex={1}
            backgroundColor={theme.colors.gray[1]}
            borderRadius={32}
            justifyContent="center"
            alignItems="start"
            paddingHorizontal={16}
            paddingVertical={8}>
            <XStack   justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.normal}
                flex={1}
                color={theme.colors.gray[800]}>
                {name}
              </StyledText>
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

            <XStack justifyContent="space-between" alignItems="center">
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                paddingVertical={4}
                borderRadius={32}>
                <XStack justifyContent="flex-start" alignItems="center" gap={1}>
                  <StyledMIcon
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
                  <StyledMIcon
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
              <StyledSpacer marginHorizontal={4} />
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
        </Pressable>
      </XStack>
    );
  };

  return (
    <YStack flex={1} backgroundColor={theme.colors.gray[100]}>
      {!data?.length ? (
        <EmptyView
          button="Add Schedule"
          screen="add-card"
          title="Empty Task Schedule"
          description="Your Task Schedule list is currently empty."
        />
      ) : (
        <YStack
          borderRadius={16}
          marginBottom={64}
          marginHorizontal={8}
          paddingVertical={8}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()} // Unique keys
            renderItem={({item}) => <RenderCard item={item} />}
          />
        </YStack>
      )}
    </YStack>
  );
};

export default CalendarCard;
