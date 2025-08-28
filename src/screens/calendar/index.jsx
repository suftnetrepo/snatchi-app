import React, {useState, useMemo, useRef, useEffect} from 'react';
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
import {CalendarList} from 'react-native-calendars';
import moment from 'moment';
import {useScheduler} from '../../hooks/useScheduler';
import {StyledDropdown} from '../../components/dropdown';
import {calendarStatusArray} from '../../utils/help';
import {validate} from '../../validator/index';
import {useAppContext} from '../../hooks/appContext';

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
  const {
    data,
    handleChange,
    handleReset,
    handleSave,
    fields,
    rules,
    success,
    error,
    loading,
    rawData,
    handleDayChange,
  } = useScheduler();
  const {user} = useAppContext();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const [range, setRange] = useState({start: null, end: null});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});
  const [value, setValue] = useState(fields.status);

  console.log('rawData..........:', rawData);
  console.log('Data ..........:', data);

  useEffect(() => {
    bottomSheetRef.current?.close();
    handleReset();
    setRange({start: null, end: null});
    setValue('');
  }, [success]);

  const onDayPress = day => {
    console.log('Day pressed:', day);
    handleDayChange(day?.dateString).then(result => {
      if (result) {
        bottomSheetRef.current?.snapToIndex(1);
        return;
      }
      console.log('Day press handled:', result);
    });

    const selected = moment(day.dateString);
    const {start, end} = range;

    const selectedStr = selected.format('YYYY-MM-DD');

    // 🟡 Case 1: Nothing selected yet
    if (!start) {
      setRange({start: selectedStr, end: selectedStr});
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
  }, [data, range.start, range.end]);

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      const formattedErrors = {
        ...validationResult.errors,
      };
      if (!value) {
        formattedErrors.status = {message: 'Status is required.'};
      }

      console.log('Validation errors:', formattedErrors);
      setErrorMessages(formattedErrors);
      return;
    }

    const body = {
      title: fields.title,
      status: value,
      startDate: range.start,
      endDate: range.end || range.start,
      description: fields.description,
      user: user?.user_id,
    };

    await handleSave(body);
    console.log('Submitting with body:', body);
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
        <CalendarList
          keyExtractor={item => item.startDate}
          markingType="period"
          markedDates={mergedMarkedDates}
          pastScrollRange={6}
          futureScrollRange={6}
          scrollEnabled
          showScrollIndicator
          onDayPress={onDayPress}
          showsVerticalScrollIndicator={false}
          theme={{
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
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
                  paddingHorizontal={4}
                  fontSize={theme.fontSize.micro}>
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
                  range && setRange({start: null, end: null});
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
              alignItems="flex-start">
              <StyledDropdown
                borderRadius={8}
                borderColor={theme.colors.gray[400]}
                height={30}
                items={calendarStatusArray}
                value={value}
                setValue={setValue}
                onChangeText={text => handleChange('status', text)}
                error={!!errorMessages?.status}
                errorMessage={errorMessages?.status?.message}
                placeholder={'Select...'}
                listMode="SCROLLVIEW"></StyledDropdown>
            </YStack>
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
                onPress={() => bottomSheetRef.current?.close()}>
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
