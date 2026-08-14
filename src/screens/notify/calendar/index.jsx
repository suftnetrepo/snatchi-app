import React, {useRef, useMemo, useState} from 'react';
import {ScrollView} from 'react-native';
import {Text, VStack, HStack, Pressable} from '@gluestack-ui/themed';
import {StyledSpinner, StyledOkDialog} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {theme} from '../../../utils/theme';
import {getRelativeTimeString} from '../../../utils/help';
import ScheduleStatusBadge from '../../../components/shared/ScheduleStatusBadge';
import {Dimensions} from 'react-native';
import JobCard from '../../../components/notifyCard';
const SCREEN_HEIGHT = Dimensions.get('window').height;
import {useScheduler} from '../../../hooks/useScheduler';
import {useFocusEffect} from '@react-navigation/native';

export default function CalendarNotification() {
  const bottomSheetRef = useRef(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const snapPoints = useMemo(() => ['90%', '100%'], []);
  const {
    data,
    loading,
    error,
    success,
    handleReset,
    handleUpdateStatus,
    handleMarkAsRead,
    handleAllSchedules,
  } = useScheduler();

  useFocusEffect(React.useCallback(() => {
    handleAllSchedules();
    // Booking centre may remain mounted; refresh every time it regains focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !Array.isArray(data)) {
      return null;
    }

    return (
      data.find(job => {
        const jobId = job?._id;
        return jobId === selectedJobId;
      }) || null
    );
  }, [data, selectedJobId]);

  const bookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (Array.isArray(data) ? data : [])
      .filter(job => ['Pending', 'Accepted'].includes(job.status) || new Date(job.endDate || job.startDate) >= today)
      .sort((a, b) => {
        if (Boolean(a.read) !== Boolean(b.read)) return a.read ? 1 : -1;
        return new Date(a.startDate) - new Date(b.startDate) || String(a.startTime || '').localeCompare(String(b.startTime || ''));
      });
  }, [data]);

  const close = () => {
    bottomSheetRef.current?.close();
  };

  const onUpdateStatus = async (status, id) => {
    const updated = await handleUpdateStatus(status, id);
    if (updated) {
      close();
    }
  };

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <VStack minHeight={SCREEN_HEIGHT} p={'$4'} space="lg">
          {bookings.map(body => (
              <Pressable
                key={body._id}
                onPress={() => {
                  setSelectedJobId(body?._id);
                  bottomSheetRef.current?.snapToIndex(0);
                  if (!body.read) {
                    handleMarkAsRead(body._id);
                  }
                }}>
                <HStack
                  backgroundColor={body.read ? '$white' : '$indigo50'}
                  borderRadius="$lg"
                  px="$4"
                  py="$4"
                  alignItems="flex-start"
                  style={{
                    borderWidth: 1,
                    borderColor: body.read ? theme.colors.gray[200] : theme.colors.indigo[200],
                  }}>
                  <VStack width={42} height={42} borderRadius={12} backgroundColor="$indigo100" alignItems="center" justifyContent="center"><Icon name="event" size={22} color="#4f46e5" /></VStack>
                  <VStack flex={1}>
                    <HStack marginLeft="$3" justifyContent="space-between" alignItems="center">
                      <Text flex={1} numberOfLines={1} fontWeight="$semibold" fontSize="$md" color="$black">
                        {body.title}
                      </Text>
                      <ScheduleStatusBadge status={body.status} size="sm" />
                    </HStack>
                    <Text marginLeft="$3" marginTop="$1" color="$coolGray600" fontSize="$xs">
                      {getRelativeTimeString(body.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
                <VStack height={10} />
              </Pressable>
          ))}
          {!loading && bookings.length === 0 && <VStack flex={1} paddingTop="$32" alignItems="center"><Icon name="event-available" size={46} color={theme.colors.gray[300]} /><Text marginTop="$4" fontWeight="$bold" fontSize="$lg">No current bookings</Text><Text marginTop="$2" color="$coolGray500" textAlign="center">New booking requests and upcoming jobs will appear here.</Text></VStack>}
        </VStack>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore">
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}>
          <JobCard
            job={selectedJob}
            onAccept={id => onUpdateStatus('Accepted', id)}
            onDecline={id => onUpdateStatus('Declined', id)}
            onCancel={id => onUpdateStatus('Cancelled', id)}
            onStart={id => onUpdateStatus('InProgress', id)}
            onComplete={id => onUpdateStatus('Completed', id)}
          />
        </BottomSheetScrollView>
      </BottomSheet>
      {error && (
        <StyledOkDialog
          title={error}
          description="Please try again later"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Your schedule was updated successfully"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
      {loading && <StyledSpinner />}
    </>
  );
}
