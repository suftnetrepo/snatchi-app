import React from 'react';
import {
  YStack,
  XStack,
  StyledCycle,
  StyledText,
  StyledSpacer,
  StyledSeparator,
  StyledCard,
  StyledBadge,
} from 'fluent-styles';
import {StyledMIcon} from '../icon';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  backgroundColorHelper,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  formatTimeFromDate,
  textColorHelper,
} from '../../utils/help';
import {useMyTaskDashboard} from '../../hooks/useTask';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ScrollView} from 'react-native';

const Dashboard = ({recentTasks, navigate}) => {
  const {data} = useMyTaskDashboard();

  const getAggregate = (data, status) => {
    {
      const result = (data || []).find(j => j.status === status);
      return result ? result.count : 0;
    }
  };

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
          onPress: () =>
            navigate.navigate('task', {
              task: item,
            }),
        }}>
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" gap={1}>
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.normal}
              fontSize={theme.fontSize.medium}
              flex={1}
              color={theme.colors.gray[600]}>
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
    <YStack paddingHorizontal={16} >
      <ScrollView showsVerticalScrollIndicator={false}>
        <XStack gap={16}>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="clock-o"
                size={48}
                color={theme.colors.indigo[400]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Pending
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Pending')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Pending')}
                color={textColorHelper('Pending')}>
                {getAggregate(data?.statuses, 'Pending')}
              </StyledBadge>
            </XStack>
          </StyledCard>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="spinner"
                size={48}
                color={theme.colors.orange[300]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Progress
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Progress')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Progress')}
                color={textColorHelper('Progress')}>
                {getAggregate(data?.statuses, 'Progress')}
              </StyledBadge>
            </XStack>
          </StyledCard>
        </XStack>
        <XStack gap={16}>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="check-circle"
                size={48}
                color={theme.colors.green[500]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Completed
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Completed')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Completed')}
                color={textColorHelper('Completed')}>
                {getAggregate(data?.statuses, 'Completed')}
              </StyledBadge>
            </XStack>
          </StyledCard>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="times-circle"
                size={48}
                color={theme.colors.pink[500]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Cancelled
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Cancelled')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Cancelled')}
                color={textColorHelper('Cancelled')}>
                {getAggregate(data?.statuses, 'Canceled')}
              </StyledBadge>
            </XStack>
          </StyledCard>
        </XStack>

        <StyledSeparator
          left={
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.normal}
              color={theme.colors.gray[800]}>
              My Recent Tasks ({recentTasks.length})
            </StyledText>
          }
        />

        <YStack borderRadius={16} marginBottom={64} paddingVertical={8}>
          {recentTasks?.map((item, index) => (
            <RenderCard key={index} item={item} />
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default Dashboard;
