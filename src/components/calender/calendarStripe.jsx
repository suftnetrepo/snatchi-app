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
import {Badge, BadgeText} from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme, fontStyles} from '../../utils/theme';
import {useScheduler} from '../../hooks/useScheduler';
import WeekStrip from './weekStrip';
import {
  getMarkedDates,
  schedulesTransformal,
  getPriorityColor,
  capitalizeFirstLetter,
  durationHrs,
} from '../../utils/help';
import StyledTimeline from '../../components/timeline';

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
    return (
      <StyledCard
        flex={1}
        borderRadius={24}
        borderColor={theme.colors.gray[1]}
        backgroundColor={theme.colors.gray[1]}
        
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
          marginTop={4}>
          <Badge
            size="md"
            variant="solid"
            bg={getPriorityColor(data?.metta?.status)}
            rounded="$full"
            px="$3"
            py="$1">
            <BadgeText color="$white" fontSize="$sm" fontWeight="$medium">
              {capitalizeFirstLetter(data?.metta?.status)}
            </BadgeText>
          </Badge>
          <Icon name="access-time" size={24} color="#9CA3AF" />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.normal}>
            {durationHrs(data.time, data.endTime)}
          </StyledText>

          <StyledCycle
            paddingHorizontal={10}
            borderWidth={1}
            width={48}
            height={48}
            borderColor={theme.colors.gray[400]}>
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
          </StyledCycle>
        </XStack>
      </StyledCard>
    );
  };

  return (
    <YStack
      flex={1}
      borderRadius={16}
      marginVertical={16}
      marginHorizontal={0}
      paddingHorizontal={16}
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
            variant="default"
            dotShape="filled"
            dotSize={10}
            timeColumnWidth={58}
            timeGap={12}
            animated
            colors={{
              dot: theme.colors.gray[800],
              line: theme.colors.gray[800],
              timeText: theme.colors.gray[800],
              endTimeText: theme.colors.gray[500],
            }}
          />
        </StyledScrollView>
      </CalendarProvider>
    </YStack>
  );
}
