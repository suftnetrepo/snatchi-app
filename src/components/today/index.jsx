
import React from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledCard,
  StyledCycle,
  StyledBadge,
} from 'fluent-styles';
import {fontStyles} from '../../utils/fontStyles';
import {theme} from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StyledMIcon} from '../icon';
import { backgroundColorHelper, priorityBackgroundColorHelper, priorityTextColorHelper, textColorHelper, formatTimeFromDate} from '../../utils/help';

import EmptyView from '../shared/empty';

const Today = ({onSelect, data}) => {
  const RenderCard = ({item}) => {
    const {name, priority, status, startDate, endDate} = item;

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
          onPress: () => onSelect && onSelect(item),
        }}>
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" gap={1}>
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.medium}
              fontSize={theme.fontSize.normal}
              flex={1}
              color={theme.colors.gray[600]}>
              {name}
            </StyledText>

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
    <YStack flex={1} marginHorizontal={16}>
      {data?.length === 0 ? (
        <EmptyView
          button="Add Schedule"
          screen="add-card"
          title="Empty Task Schedule"
          description="Your Task Schedule list is currently empty."
        />
      ) : (
        <YStack borderRadius={16} marginBottom={64} paddingVertical={8}>
          {data?.map((item, index) => (
            <RenderCard key={index} item={item} />
          ))}
        </YStack>
      )}
    </YStack>
  );
};

export default Today;
