import React, {useState, useMemo, useRef, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledText,
  StyledCycle,
  StyledSpacer,
  StyledCard,
  StyledSeparator,
  StyledBadge,
  StyledSpinner,
  StyledOkDialog,
  StyledButton,
  StyledDialog,
  StyledInput,
  StyledMultiInput,
} from 'fluent-styles';
import {FlatList, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import {fontStyles, theme} from '../../utils/theme';
import {StyledMIcon} from '../../components/icon';
import {CalendarList, DateData} from 'react-native-calendars';
import moment from 'moment';
import {useScheduler} from '../../hooks/useScheduler';
import {StyledDropdown} from '../../components/dropdown';
import {calendarStatusArray} from '../../utils/help';

const eventsData = [
  {
    title: 'Holiday',
    startDate: '2025-09-06T17:00:00.000Z',
    endDate: '2025-09-07T23:00:00.000Z',
    status: 'Rejected',
  },
  {
    title: 'Renovating Job in Shell',
    startDate: '2025-08-31T22:00:00.000Z',
    endDate: '2025-09-05T22:00:00.000Z',
    status: 'Accepted',
  },
  {
    title: 'New Plumbing Jobs',
    startDate: '2025-08-30T23:00:00.000Z',
    endDate: '2025-09-15T23:00:00.000Z',
    status: 'Pending',
  },
  {
    title: 'Work on Building',
    startDate: '2025-08-19T23:00:00.000Z',
    endDate: '2025-08-29T23:00:00.000Z',
    status: 'Pending',
  },
];

const statusColorMap = {
  Accepted: '#4ECDC4',
  Pending: '#F4A261',
  Rejected: '#E76F51',
};

const getMarkedDatesFromEvents = events => {
  const marked = {};

  events.forEach(event => {
    const color = statusColorMap[event.status] || '#BDBDBD';
    const start = moment(event.startDate).format('YYYY-MM-DD');
    const end = moment(event.endDate).format('YYYY-MM-DD');

    let current = moment(start);
    const endMoment = moment(end);

    while (current.isSameOrBefore(endMoment)) {
      const dateStr = current.format('YYYY-MM-DD');
      const isStart = current.isSame(start, 'day');
      const isEnd = current.isSame(end, 'day');

      marked[dateStr] = {
        ...(marked[dateStr] || {}),
        ...(isStart ? {startingDay: true} : {}),
        ...(isEnd ? {endingDay: true} : {}),
        color: marked[dateStr]?.color || color,
        textColor: 'white',
      };

      current.add(1, 'day');
    }
  });

  return marked;
};

const getUserSelectedRange = (start, end, color = '#3B82F6') => {
  const marked = {};
  if (!start) return marked;

  const startMoment = moment(start);
  const endMoment = end ? moment(end) : startMoment;

  let current = startMoment.clone();
  while (current.isSameOrBefore(endMoment)) {
    const dateStr = current.format('YYYY-MM-DD');
    marked[dateStr] = {
      ...(marked[dateStr] || {}),
      startingDay: current.isSame(startMoment, 'day'),
      endingDay: current.isSame(endMoment, 'day'),
      color,
      textColor: 'white',
    };
    current.add(1, 'day');
  }
  return marked;
};

const CalendarListScreen = () => {
  const {data, error, loading} = useScheduler();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const [range, setRange] = useState({start: null, end: null});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [value, setValue] = useState(null);
  // console.log('Data from useScheduler:', data);

  const onDayPress = day => {
    const selected = moment(day.dateString);
    const {start, end} = range;

    const selectedStr = selected.format('YYYY-MM-DD');

    // 🟡 Case 1: Nothing selected yet
    if (!start) {
      setRange({start: selectedStr, end: null});
      return;
    }

    // 🟡 Case 2: Only start selected
    if (start && !end) {
      if (selectedStr === start) {
        // 🔄 Unselect if tapped again
        setRange({start: null, end: null});
      } else {
        // Set end
        const isBefore = selected.isBefore(moment(start));
        setRange({
          start: isBefore ? selectedStr : start,
          end: isBefore ? start : selectedStr,
        });
      }
      return;
    }

    // 🟡 Case 3: Range already selected (start and end)
    const startMoment = moment(start);
    const endMoment = moment(end);

    if (selected.isBefore(startMoment)) {
      setRange({start: selectedStr, end});
    } else if (selected.isAfter(endMoment)) {
      setRange({start, end: selectedStr});
    } else if (selectedStr === start) {
      // Collapse back to start only
      setRange({start, end: null});
    } else {
      // Shrink end
      setRange({start, end: selectedStr});
    }
  };
  const mergedMarkedDates = useMemo(() => {
    const userRange = getUserSelectedRange(range.start, range.end);
    return {...data, ...userRange};
  }, [data, range]);

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
          onPress: () => navigator.goBack(),
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
        My Calendar
      </StyledText>
      <StyledSpacer flex={1} />
      {range && range.start && (
        <StyledCycle
          height={48}
          width={48}
          borderWidth={0}
          borderColor={theme.colors.pink[500]}
          backgroundColor={theme.colors.pink[500]}>
          <Icon
            name="add"
            size={25}
            color={theme.colors.gray[1]}
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(1);
            }}
          />
        </StyledCycle>
      )}

      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack flex={1} backgroundColor={theme.colors.gray[200]}>
        {mergedMarkedDates && Object.keys(mergedMarkedDates).length > 0 && (
          <CalendarList
            markingType="period"
            markedDates={mergedMarkedDates}
            pastScrollRange={6}
            futureScrollRange={6}
            scrollEnabled
            showScrollIndicator
            onDayPress={onDayPress}
            onPress={e => {
              console.log('Day pressed', e);
            }}
            theme={{
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
        )}
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={() => {}}>
          <YStack
            flex={1}
            paddingHorizontal={16}
            paddingVertical={16}
            justifyContent="flex-start"
            alignItems="flex-start"
            borderRadius={16}
            borderWidth={1}
            borderColor={theme.colors.gray[200]}
            backgroundColor={theme.colors.gray[1]}>
            <XStack
              width="100%"
              justifyContent="space-between"
              alignItems="center"
              borderColor={theme.colors.gray[1]}
              backgroundColor={theme.colors.gray[1]}>
              <YStack
              flex={1}
                justifyContent="flex-start"
                alignItems="flex-start"
                borderColor={theme.colors.gray[1]}
                backgroundColor={theme.colors.gray[1]}>
                
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  color={theme.colors.gray[600]}
                  paddingVertical={4}
                  fontSize={theme.fontSize.micro}>
                  Please fill up  the form below to Declined a schedule or Blocked days in your calendar that you are not available.
                </StyledText>
              </YStack>
              <Icon
                name="cancel"
                size={42}
                color={theme.colors.gray[600]}
                onPress={() => {
                  bottomSheetRef.current?.close();
                }}
              />
            </XStack>
            <StyledSpacer marginVertical={8} />
            <StyledInput
              keyboardType="default"
              placeholder="Enter short description about invoice"
              returnKeyType="next"
              maxLength={100}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              paddingHorizontal={16}
              placeholderTextColor={theme.colors.gray[400]}
              height={40}
            />
            <XStack gap={8} marginTop={8} justifyContent="space-between">
              <StyledInput
                flex={1}
                keyboardType="default"
                placeholder="Enter short description about invoice"
                returnKeyType="next"
                maxLength={100}
                fontSize={theme.fontSize.small}
                borderColor={theme.colors.gray[400]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={8}
                paddingHorizontal={16}
                placeholderTextColor={theme.colors.gray[400]}
                height={40}
                value={range.start}
              />
              <StyledInput
                flex={1}
                keyboardType="default"
                placeholder="Enter short description about invoice"
                returnKeyType="next"
                maxLength={100}
                fontSize={theme.fontSize.small}
                borderColor={theme.colors.gray[400]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={8}
                paddingHorizontal={16}
                placeholderTextColor={theme.colors.gray[400]}
                height={40}
                value={range.end}
              />
            </XStack>
            <StyledSpacer marginTop={8} />
            <StyledMultiInput
              height={100}
              keyboardType="default"
              placeholder="Enter short description about invoice"
              returnKeyType="next"
              maxLength={100}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              paddingHorizontal={16}
              placeholderTextColor={theme.colors.gray[400]}
            />
            <XStack
              marginTop={8}
              justifyContent="flex-start"
              alignItems="center">
              <StyledDropdown
                borderRadius={8}
                borderColor={theme.colors.gray[400]}
                height={30}
                items={calendarStatusArray}
                value={value}
                setValue={setValue}
                onChangeValue={value => setValue(value)}
                placeholder={'Select...'}
                listMode="SCROLLVIEW"></StyledDropdown>
            </XStack>
            <XStack
              marginTop={16}
                gap={8}
              justifyContent="flex-start"
              alignItems="center">
              <StyledButton
                flex={1}
                borderRadius={8}
              
                backgroundColor={theme.colors.cyan[500]}
                borderColor={theme.colors.cyan[500]}
                onPress={() => {}}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  color={theme.colors.gray[1]}
                  fontWeight={theme.fontWeight.normal}
                  paddingVertical={8}
                  paddingHorizontal={8}
                  textAlign="center"
                  fontSize={theme.fontSize.small}>
                  SaveChanges
                </StyledText>
              </StyledButton>
        
              <StyledButton
                flex={1}
                borderRadius={8}
                borderWidth={1}
                backgroundColor={theme.colors.red[400]}
                borderColor={theme.colors.red[200]}
                onPress={() => {}}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  color={theme.colors.gray[1]}
                  fontWeight={theme.fontWeight.normal}
                  paddingVertical={8}
                  paddingHorizontal={8}
                  textAlign="center"
                  fontSize={theme.fontSize.small}>
                  Delete
                </StyledText>
              </StyledButton>
              <StyledButton
                flex={1}
                borderRadius={8}
                borderWidth={1}
                backgroundColor={theme.colors.gray[200]}
                borderColor={theme.colors.gray[200]}
                onPress={() => {}}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  color={theme.colors.gray[800]}
                  fontWeight={theme.fontWeight.normal}
                  paddingVertical={8}
                  paddingHorizontal={8}
                  textAlign="center"
                  fontSize={theme.fontSize.small}>
                  Close
                </StyledText>
              </StyledButton>
            </XStack>
          </YStack>
        </BottomSheet>
        <StyledSpacer marginBottom={56} />
      </YStack>
    </StyledSafeAreaView>
  );
};

export default CalendarListScreen;
