import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledText,
  StyledCycle,
  StyledSpacer,
  StyledSpinner,
  StyledOkDialog,
  StyledButton,
  StyledInput,
  StyledMultiInput,
} from 'fluent-styles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { fontStyles, theme } from '../../utils/theme';
import { CalendarList } from 'react-native-calendars';
import moment from 'moment';
import { useScheduler } from '../../hooks/useScheduler';
import { statusOptions } from '../../utils/help';
import { validate } from '../../validator/index';
import { useAppContext } from '../../hooks/appContext';
import { useFocus } from '../../hooks/useFocus';
import { Platform, ScrollView } from 'react-native';
import StyledPickerSelect from '../../components/dropdown/StyledPickerSelect';

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
  const { key } = useFocus();
  const calendarRef = useRef();
  const {
    data,
    handleChange,
    handleReset,
    handleSave,
    handleEdit,
    fields,
    rules,
    error,
    loading,
    handleDayChange,
    handleDateRange,
    handleDelete,
    handleMySchedulesByDates
  } = useScheduler(key);
  const { user } = useAppContext();
  const navigator = useNavigation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const [errorMessages, setErrorMessages] = useState({});
  const visible = false

  useFocusEffect(
    useCallback(() => {
    navigator.setOptions({
    tabBarStyle: { display: visible ? 'flex' : 'none' }
  });
    }, [visible]),
  );

  const onDayPress = day => {
    const result = handleDayChange(day?.dateString?.trim());

    if (result?.showSheet === true) {
      handleReset();
      return;
    }

    if (result) {
      bottomSheetRef.current?.snapToIndex(1);
      return;
    }

    const selected = moment(day.dateString);
    const { startDate, endDate } = fields;

    const selectedStr = selected.format('YYYY-MM-DD');

    // 🟡 Case 1: Nothing selected yet
    if (!startDate) {
      handleDateRange(selectedStr, selectedStr);
      return;
    }

    // 🟡 Case 2: Only start selected
    if (startDate && !endDate) {
      if (selectedStr === startDate) {
        // 🔄 Unselect if tapped again
        handleDateRange(null, null);
      } else {
        // Set end
        const isBefore = selected.isBefore(moment(startDate));
        handleDateRange(
          isBefore ? selectedStr : startDate,
          isBefore ? startDate : selectedStr,
        );
      }
      return;
    }

    // 🟡 Case 3: Range already selected (start and end)
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    if (selected.isBefore(startMoment)) {
      handleDateRange(selectedStr, endDate);
    } else if (selected.isAfter(endMoment)) {
      handleDateRange(startDate, selectedStr);
    } else if (selectedStr === startDate) {
      // Collapse back to start only
      handleDateRange(startDate, null);
    } else {
      handleDateRange(startDate, selectedStr);
    }
  };

  const mergedMarkedDates = useMemo(() => {
    const dateRange = getUserSelectedRange(fields.startDate, fields.endDate);
    return { ...data, ...dateRange };
  }, [data, fields.startDate, fields.endDate]);

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      const formattedErrors = {
        ...validationResult.errors,
      };

      setErrorMessages(formattedErrors);
      return;
    }

    const body = {
      title: fields.title,
      status: fields.status,
      startDate: fields.startDate,
      endDate: fields.endDate || fields.startDate,
      description: fields.description,
      user: user?.user_id,
    };

    if (fields._id) {
      handleEdit(body, fields._id).then(result => {
        if (result) {
          reset();
        }
      });
    } else {
      handleSave(body).then(result => {
        if (result) {
          reset();
        }
      });
    }
  };

  const reset = () => {
    bottomSheetRef.current?.close();
    handleReset();
  };

  const onDelete = async () => {
    await handleDelete(fields._id).then(result => {
      if (result) {
        reset();
      }
    });
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
        borderColor={theme.colors.gray[400]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={4} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        My Job Schedule
      </StyledText>
      <StyledSpacer flex={1} />
      {fields.startDate && fields.title === '' && (
        <StyledCycle
          height={48}
          width={48}
          borderWidth={0}
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}>
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
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack flex={1} backgroundColor={theme.colors.gray[200]}>
        <CalendarList
          ref={calendarRef}
          markingType="period"
          markedDates={mergedMarkedDates}
          pastScrollRange={6}
          futureScrollRange={6}
          scrollEnabled
          showScrollIndicator
          onDayPress={e => onDayPress(e)}
          showsVerticalScrollIndicator={false}
          theme={{
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
          onVisibleMonthsChange={async (months) => {
            if (!months || months.length === 0) return;
            await handleMySchedulesByDates(months);
          }}
        />
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore">
          <ScrollView
            style={{ flex: 1 }}
          >
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
                    paddingHorizontal={4}
                    fontSize={theme.fontSize.normal}>
                    Please fill out the form below to decline a scheduled task or
                    to block out the days you're unavailable on your calendar.
                  </StyledText>
                </YStack>
                <Icon
                  name="cancel"
                  size={42}
                  color={theme.colors.gray[600]}
                  onPress={() => {
                    bottomSheetRef.current?.close();
                    handleReset();
                  }}
                />
              </XStack>
              <StyledSpacer marginVertical={8} />
              <StyledInput
                name="title"
                key="title"
                keyboardType="default"
                placeholder="Enter a reason for blocking your availability"
                returnKeyType="next"
                maxLength={100}
                fontSize={theme.fontSize.small}
                borderColor={theme.colors.gray[400]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={8}
                paddingHorizontal={16}
                placeholderTextColor={theme.colors.gray[400]}
                height={40}
                value={fields.title}
                onChangeText={text => handleChange('title', text)}
                error={!!errorMessages?.title}
                errorMessage={errorMessages?.title?.message}
              />
              <XStack gap={8} marginTop={8} justifyContent="space-between">
                <StyledInput
                  flex={1}
                  keyboardType="default"
                  placeholder="Selected start date"
                  returnKeyType="next"
                  maxLength={100}
                  fontSize={theme.fontSize.small}
                  borderColor={theme.colors.gray[400]}
                  backgroundColor={theme.colors.gray[1]}
                  borderRadius={8}
                  paddingHorizontal={16}
                  placeholderTextColor={theme.colors.gray[400]}
                  height={40}
                  value={fields.startDate}
                  readOnly
                />
                <StyledInput
                  flex={1}
                  keyboardType="default"
                  placeholder="Selected end date"
                  returnKeyType="next"
                  maxLength={100}
                  fontSize={theme.fontSize.small}
                  borderColor={theme.colors.gray[400]}
                  backgroundColor={theme.colors.gray[1]}
                  borderRadius={8}
                  paddingHorizontal={16}
                  placeholderTextColor={theme.colors.gray[400]}
                  height={40}
                  value={fields.endDate}
                  readOnly
                />
              </XStack>
              <StyledSpacer marginTop={8} />
              <StyledMultiInput
                height={100}
                keyboardType="default"
                placeholder="Enter additional details (optional)"
                returnKeyType="next"
                maxLength={100}
                fontSize={theme.fontSize.small}
                borderColor={theme.colors.gray[400]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={8}
                paddingHorizontal={16}
                placeholderTextColor={theme.colors.gray[400]}
                onChangeText={text => handleChange('description', text)}
                value={fields.description}
              />
              <YStack
                marginTop={8}
                justifyContent="flex-start"
                position="relative"
                zIndex={10}
                alignItems="flex-start">
                <StyledPickerSelect
                  placeholder="Select status..."
                  value={fields.status}
                  items={fields.status === 'Pending'
                    ? statusOptions.pending
                    : statusOptions.empty}
                  onChange={text => handleChange('status', text)}
                  theme={theme}
                  error={!!errorMessages?.status}
                  errorMessage={errorMessages?.status?.message}
                />
              </YStack>
              <XStack
                marginTop={16}
                gap={8}
                zIndex={1}
                position="relative"
                justifyContent="flex-start"
                alignItems="center">
                <StyledButton
                  flex={1}
                  borderRadius={32}
                  backgroundColor={theme.colors.cyan[500]}
                  borderColor={theme.colors.cyan[500]}
                  onPress={() => handleSubmit()}>
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
                {fields.status === 'Lock' && (
                  <StyledButton
                    flex={1}
                    borderRadius={32}
                    borderWidth={1}
                    backgroundColor={theme.colors.red[400]}
                    borderColor={theme.colors.red[200]}
                    onPress={() => onDelete()}>
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
                )}

                <StyledButton
                  flex={1}
                  borderRadius={32}
                  borderWidth={1}
                  backgroundColor={theme.colors.gray[200]}
                  borderColor={theme.colors.gray[200]}
                  onPress={() => {
                    reset()
                  }}>
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
          </ScrollView>
        </BottomSheet>
        <StyledSpacer marginBottom={56} />
      </YStack>
      {loading && <StyledSpinner />}
      {error && (
        <StyledOkDialog
          title={'Something went wrong'}
          description="Please try again later"
          visible={true}
          onOk={() => {
            // handleReset();
          }}
        />
      )}
    </StyledSafeAreaView>
  );
};

export default CalendarListScreen;
