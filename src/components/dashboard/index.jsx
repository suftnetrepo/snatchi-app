import React, {useEffect} from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledSpacer,
  StyledSeparator,
  StyledCard,
  StyledBadge,
  StyledCycle,
} from 'fluent-styles';
import {useNavigation} from '@react-navigation/native';
import {Pressable, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {
  schedulesTransformal,
  durationHrs,
} from '../../utils/help';
import StyledTimeline from '../../components/timeline';
import {useScheduler} from '../../hooks/useScheduler';
import ScheduleStatusBadge from '../shared/ScheduleStatusBadge';
import {
  getScheduleStatusTheme,
  getScheduleTimelineColors,
} from '../../constants/scheduleStatusTheme';

const Dashboard = ({userId}) => {
  const navigator = useNavigation();
  const {data, handleScheduleStatus} = useScheduler();

  useEffect(() => {
    handleScheduleStatus({engineerId: userId});
  }, [userId]);

  const getAggregate = (data, status) => {
    return data?.byStatus?.[status] || 0;
  };

  const getAggregateBadgeTheme = status => getScheduleStatusTheme(status);

  const RenderRecentCard = ({data}) => {
    const statusTheme = getScheduleStatusTheme(data?.metta?.status);

    return (
      <StyledCard
        flex={1}
        borderRadius={24}
        borderColor={statusTheme.border}
        borderLeftColor={statusTheme.text}
        borderLeftWidth={4}
        paddingVertical={12}
        paddingHorizontal={12}
        borderWidth={1}>
        <StyledText
          fontFamily={fontStyles.Roboto_Regular}
          fontWeight={theme.fontWeight.normal}
          color={theme.colors.gray[600]}
          fontSize={theme.fontSize.medium}>
          {data.title}
        </StyledText>
        <XStack
          gap={16}
          alignItems="center"
          justifyContent="flex-start"
          flexWrap="wrap"
          marginTop={8}>
          <ScheduleStatusBadge status={data?.metta?.status} size="sm" />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.small}>
            {durationHrs(data.time, data.endTime)}
          </StyledText>
          <StyledSpacer flex={1} />
         <Icon
              size={24}
              name="chevron-right"
              color={theme.colors.gray[800]}
              onPress={() => {
                navigator.navigate('project-details', {
                  id: data?.metta?.project,
                });
              }}
            />
        </XStack>
      </StyledCard>
    );
  };

  const RestDay = () => (
    <YStack alignItems="center" paddingVertical={48} gap={12}>
      <XStack
        width={72}
        height={72}
        borderRadius={36}
        backgroundColor="#f0fdf4"
        alignItems="center"
        justifyContent="center">
        <Icon name="bell" size={28} color="#8bc34a" />
      </XStack>
      <StyledText fontSize={18} fontWeight="800" color="#1a1a1e">
        No Schedule Day
      </StyledText>
      <StyledText fontSize={14} color="#9ca3af" textAlign="center">
        Recovery is part of the plan.{'\n'}Rest up and come back stronger 💚
      </StyledText>
    </YStack>
  );

  const RenderRecentTimeline = () => {
    const {data, handleSchedules} = useScheduler();
    const recentSchedules = schedulesTransformal(data);

    useEffect(() => {
      handleSchedules({
        date: new Date().toISOString().slice(0, 10),
        engineerId: userId,
      });
    }, [userId]);

    return (
      <>
        <StyledSeparator
          paddingHorizontal={24}
          left={
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.small}
              color={theme.colors.gray[500]}>
              My Recent Schedules ({recentSchedules?.length || 0})
            </StyledText>
          }
          right={
            <Pressable onPress={() => navigator.navigate('project')}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.light}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[500]}>
                View All
              </StyledText>
            </Pressable>
          }
        />
    
        <YStack
          borderRadius={24}
          marginBottom={64}
          paddingVertical={8}
          paddingHorizontal={8}
          marginHorizontal={8}
          backgroundColor={theme.colors.gray[100]}>
          {recentSchedules?.length === 0 ? (
            <RestDay />
          ) : (
            <StyledTimeline
              items={recentSchedules}
              renderItem={item => <RenderRecentCard data={item} />}
              getItemColors={item => getScheduleTimelineColors(item?.metta?.status)}
              variant="default"
              dotShape="filled"
              dotSize={10}
              timeColumnWidth={58}
              timeGap={12}
              animated
              colors={{
                timeText: theme.colors.gray[800],
                endTimeText: theme.colors.gray[500],
              }}
            />
          )}
        </YStack>
      </>
    );
  };
  return (
    <YStack marginTop={16} flex={1}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal={16}>
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
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap={1}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[600]}
                  fontSize={theme.fontSize.normal}>
                  Pending
                </StyledText>

                <StyledBadge
                  backgroundColor={getAggregateBadgeTheme('Pending').bg}
                  paddingHorizontal={8}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.small}
                  paddingVertical={4}
                  borderColor={getAggregateBadgeTheme('Pending').border}
                  color={getAggregateBadgeTheme('Pending').text}>
                  {getAggregate(data, 'Pending')}
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
                  name="check-circle"
                  size={48}
                  color={theme.colors.green[500]}
                />
              </XStack>
              <StyledSpacer marginVertical={20} />
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap={1}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[600]}
                  fontSize={theme.fontSize.normal}>
                  Accepted
                </StyledText>

                <StyledBadge
                  backgroundColor={getAggregateBadgeTheme('Accepted').bg}
                  paddingHorizontal={8}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.small}
                  paddingVertical={4}
                  borderColor={getAggregateBadgeTheme('Accepted').border}
                  color={getAggregateBadgeTheme('Accepted').text}>
                  {getAggregate(data, 'Accepted')}
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
                <Icon
                  name="play-circle-filled"
                  size={48}
                  color={theme.colors.orange[300]}
                />
              </XStack>
              <StyledSpacer marginVertical={20} />
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap={1}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[600]}
                  fontSize={theme.fontSize.normal}>
                  Ready 
                </StyledText>

                <StyledBadge
                  backgroundColor={getAggregateBadgeTheme('ReadyToStart').bg}
                  paddingHorizontal={8}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.small}
                  paddingVertical={4}
                  borderColor={getAggregateBadgeTheme('ReadyToStart').border}
                  color={getAggregateBadgeTheme('ReadyToStart').text}>
                  {getAggregate(data, 'ReadyToStart')}
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
              <XStack
                justifyContent="space-between"
                alignItems="center"
                gap={1}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[600]}
                  fontSize={theme.fontSize.normal}>
                  In Progress
                </StyledText>

                <StyledBadge
                  backgroundColor={getAggregateBadgeTheme('InProgress').bg}
                  paddingHorizontal={8}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.small}
                  paddingVertical={4}
                  borderColor={getAggregateBadgeTheme('InProgress').border}
                  color={getAggregateBadgeTheme('InProgress').text}>
                  {getAggregate(data, 'InProgress')}
                </StyledBadge>
              </XStack>
            </StyledCard>
          </XStack>
        </YStack>

        <RenderRecentTimeline />
      </ScrollView>
    </YStack>
  );
};

export default Dashboard;
