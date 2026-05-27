import React, {useState, useCallback, useEffect} from 'react';
import {
  XStack,
  YStack,
  StyledCard,
  StyledText,
  StyledCycle,
  StyledScrollView,
  StyledSpacer,
} from 'fluent-styles';
import {CalendarProvider} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme, fontStyles} from '../../utils/theme';
import {useScheduler} from '../../hooks/useScheduler';
import WeekStrip from './weekStrip';
import {
  getMarkedDates,
  schedulesTransformal,
  durationHrs,
} from '../../utils/help';
import StyledTimeline from '../../components/timeline';
import ScheduleStatusBadge from '../shared/ScheduleStatusBadge';
import {
  getScheduleStatusTheme,
  getScheduleTimelineColors,
} from '../../constants/scheduleStatusTheme';

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const isoToday = () => toISO(new Date());
const TODAY = isoToday();

export default function CalendarStrip({userId}) {
  const navigator = useNavigation();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [anchorDate, setAnchorDate] = useState(TODAY); // drives visible week
  const {data, handleSchedules} = useScheduler();
  const recentSchedules = schedulesTransformal(data);

  useEffect(() => {
    handleSchedules({
      date: new Date().toISOString().slice(0, 10),
      engineerId: userId,
    });
  }, []);

  const onDateChanged = useCallback(date => {
    setSelectedDate(date);
    setAnchorDate(date);
    handleSchedules({
      date: new Date(date).toISOString().slice(0, 10),
      engineerId: userId,
    });
  }, []);

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

  return (
    <YStack
      flex={1}
      borderRadius={16}
      marginVertical={16}
      marginHorizontal={8}
      paddingHorizontal={8}
      paddingVertical={8}
      backgroundColor={theme.colors.gray[1]}>
      <CalendarProvider
        date={selectedDate}
        onDateChanged={onDateChanged}
        style={{
          flex: 1,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: theme.colors.white,
        }}>
        <WeekStrip
          selectedDate={selectedDate}
          anchorDate={anchorDate}
          markedDates={getMarkedDates(data)}
          onSelect={date => {
            setSelectedDate(date);
            setAnchorDate(date);
          }}
          onAnchorChange={setAnchorDate}
        />
        <StyledSpacer marginVertical={8} />
        <StyledScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 24}}>
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
        </StyledScrollView>
      </CalendarProvider>
    </YStack>
  );
}
