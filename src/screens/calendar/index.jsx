import React, {useState, useMemo, useCallback} from 'react';
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
} from 'fluent-styles';
import {FlatList, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {StyledMIcon} from '../../components/icon';
import {CalendarList, DateData} from 'react-native-calendars';

const MyCalender = () => {
  const navigator = useNavigation();
  const [selected, setSelected] = useState(initialDate);

  const RANGE = 24;
  const initialDate = '2025-07-15'; // Updated to 2025

  const availableDates = [
    // June 2025 available dates
    '2025-06-03',
    '2025-06-05',
    '2025-06-07',
    '2025-06-09',
    '2025-06-12',
    '2025-06-14',
    '2025-06-16',
    '2025-06-18',
    '2025-06-21',
    '2025-06-23',
    '2025-06-25',
    '2025-06-27',
    '2025-06-30',
    // July 2025 available dates
    '2025-07-02',
    '2025-07-04',
    '2025-07-08',
    '2025-07-11',
    '2025-07-15',
    '2025-07-18',
    '2025-07-22',
    '2025-07-25',
    '2025-07-28',
    '2025-07-31',
  ];

  const specialDates = [
    '2025-06-01',
    '2025-06-06',
    '2025-06-10',
    '2025-06-19',
    '2025-06-28',
    '2025-07-01',
    '2025-07-06',
    '2025-07-13',
    '2025-07-20',
    '2025-07-27',
  ];

  const marked = useMemo(() => {
    const markedDates = {};

    // Mark available dates with yellow/orange background
    availableDates.forEach(date => {
      markedDates[date] = {
        selected: selected === date,
        selectedColor: selected === date ? '#5E60CE' : '#F5C842', // Purple if selected, yellow if available
        selectedTextColor: selected === date ? 'white' : '#333',
        marked: false,
        customStyles: {
          container: {
            backgroundColor: selected === date ? '#5E60CE' : '#F5C842',
            borderRadius: 15,
          },
          text: {
            color: selected === date ? 'white' : '#333',
            fontWeight: selected === date ? 'bold' : '600',
          },
        },
      };
    });

    // Mark special dates with green background
    specialDates.forEach(date => {
      markedDates[date] = {
        selected: selected === date,
        selectedColor: selected === date ? '#5E60CE' : '#7ED321', // Purple if selected, green if special
        selectedTextColor: selected === date ? 'white' : '#333',
        marked: false,
        customStyles: {
          container: {
            backgroundColor: selected === date ? '#5E60CE' : '#7ED321',
            borderRadius: 15,
          },
          text: {
            color: selected === date ? 'white' : '#333',
            fontWeight: selected === date ? 'bold' : '600',
          },
        },
      };
    });

    // Ensure selected date is properly marked
    if (selected && markedDates[selected]) {
      markedDates[selected] = {
        ...markedDates[selected],
        selected: true,
        selectedColor: '#5E60CE',
        selectedTextColor: 'white',
        customStyles: {
          container: {
            backgroundColor: '#5E60CE',
            borderRadius: 15,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    }

    return markedDates;
  }, [selected, availableDates, specialDates]);

  const onDayPress = useCallback(
    day => {
      // Only allow selection of available dates or special dates
      if (
        availableDates.includes(day.dateString) ||
        specialDates.includes(day.dateString)
      ) {
        setSelected(day.dateString);
      }
    },
    [availableDates, specialDates],
  );

  // Function to add new available dates
  const addAvailableDate = dateString => {
    if (!availableDates.includes(dateString)) {
      availableDates.push(dateString);
    }
  };

  // Function to add new special dates
  const addSpecialDate = dateString => {
    if (!specialDates.includes(dateString)) {
      specialDates.push(dateString);
    }
  };

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
      <StyledCycle
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon
          name="add"
          size={25}
          color={theme.colors.gray[1]}
          onPress={() => {}}
        />
      </StyledCycle>
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
        <CalendarList
          testID={'calendar-list'}
          current={initialDate}
          pastScrollRange={RANGE}
          futureScrollRange={RANGE}
          onDayPress={onDayPress}
          markedDates={marked}
          markingType={'custom'}
          renderHeader={undefined}
          calendarHeight={undefined}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#5E60CE',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#5E60CE',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#5E60CE',
            selectedDotColor: '#ffffff',
            arrowColor: '#5E60CE',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#5E60CE',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '400',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
          horizontal={false}
          pagingEnabled={false}
          staticHeader={false}
        />
      </YStack>
    </StyledSafeAreaView>
  );
};

export default MyCalender;
