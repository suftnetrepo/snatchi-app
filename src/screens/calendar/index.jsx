import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import moment from 'moment';

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
  }
];

const statusColorMap = {
  Accepted: '#4ECDC4',
  Pending: '#F4A261',
  Rejected: '#E76F51',
};

const getMarkedDatesFromEvents = (events) => {
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
        ...(isStart ? { startingDay: true } : {}),
        ...(isEnd ? { endingDay: true } : {}),
        color: marked[dateStr]?.color || color,
        textColor: 'white'
      };

      current.add(1, 'day');
    }
  });

  return marked;
};

// 🔵 Custom user-selected range marker
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
      textColor: 'white'
    };
    current.add(1, 'day');
  }
  return marked;
};

const CalendarListScreen = () => {
  const eventMarks = useMemo(() => getMarkedDatesFromEvents(eventsData), []);

  const [range, setRange] = useState({ start: null, end: null });

const onDayPress = (day) => {
  const selected = moment(day.dateString);
  const { start, end } = range;

  const selectedStr = selected.format('YYYY-MM-DD');

  // 🟡 Case 1: Nothing selected yet
  if (!start) {
    setRange({ start: selectedStr, end: null });
    return;
  }

  // 🟡 Case 2: Only start selected
  if (start && !end) {
    if (selectedStr === start) {
      // 🔄 Unselect if tapped again
      setRange({ start: null, end: null });
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
    setRange({ start: selectedStr, end });
  } else if (selected.isAfter(endMoment)) {
    setRange({ start, end: selectedStr });
  } else if (selectedStr === start) {
    // Collapse back to start only
    setRange({ start, end: null });
  } else {
    // Shrink end
    setRange({ start, end: selectedStr });
  }
};
  const mergedMarkedDates = useMemo(() => {
    const userRange = getUserSelectedRange(range.start, range.end);
    return { ...eventMarks, ...userRange };
  }, [eventMarks, range]);

  return (
    <View style={styles.container}>
      <CalendarList
        markingType="period"
        markedDates={mergedMarkedDates}
        pastScrollRange={6}
        futureScrollRange={6}
        scrollEnabled
        showScrollIndicator
        onDayPress={onDayPress}
        theme={{
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
  },
});

export default CalendarListScreen;
