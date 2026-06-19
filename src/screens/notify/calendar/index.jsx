import React, {useRef, useMemo, useState} from 'react';
import {ScrollView, Animated} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {
  Text,
  VStack,
  HStack,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import {
  StyledSpinner,
  StyledOkDialog,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import {useStorage, SCHEDULE_KEY} from '../../../hooks/useStorage';
import {theme, fontStyles} from '../../../utils/theme';
import {
  getRelativeTimeString,
  truncate,
} from '../../../utils/help';
import {useScheduler} from '../../../hooks/useScheduler';
import {Dimensions} from 'react-native';
import JobCard from '../../../components/notifyCard';
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CalendarNotification() {
  const bottomSheetRef = useRef(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const snapPoints = useMemo(() => ['90%', '100%'], []);
  const {handleMarkAsRead, data, handleDelete} = useStorage(SCHEDULE_KEY);
  const {
    handleChange,
    handleNotifySave,
    handleReset,
    fields,
    rules,
    handlNotifyChange,
    loading,
    error,
    success,
    handleUpdateStatus,
  } = useScheduler(SCHEDULE_KEY);

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !Array.isArray(data)) {
      return null;
    }

    return (
      data.find(job => {
        const jobId = job?.id || job?.scheduleId || job?._id;
        return jobId === selectedJobId;
      }) || null
    );
  }, [data, selectedJobId]);

  console.log('CalendarNotification data:', selectedJob);

  const onhandleDelete = id => {
    handleDelete(SCHEDULE_KEY, id);
  };

  const close = () => {
    bottomSheetRef.current?.close();
  };

  const renderRightActions = (dragX, onPress) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable onPress={onPress}>
        <Animated.View
          style={{
            transform: [{scale}],
            backgroundColor: theme.colors.red[500],
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: '100%',
            borderRadius: 8,
          }}>
          <Icon name="delete" size={22} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <VStack height={SCREEN_HEIGHT} p={'$4'} space="lg">
          {data?.map((body, index) => (
            <Swipeable
              key={index}
              renderRightActions={(dragX) =>
                renderRightActions(dragX, () => {
                  onhandleDelete(body.id);
                })
              }>
              <Pressable
                onPress={() => {
                  handleMarkAsRead(SCHEDULE_KEY, body.id).then(() => {
                    handlNotifyChange(body);
                    setSelectedJobId(body?.id || body?.scheduleId || body?._id || '');
                    bottomSheetRef.current?.snapToIndex(1);
                  });
                }}>
                <HStack alignItems="flex-start">
                  <VStack flex={1}>
                    <HStack justifyContent="flex-start" alignItems="center">
                      <Text
                        flex={6}
                        fontWeight="$bold"
                        fontSize="$md"
                        color="$black">
                        {body.siteName}
                      </Text>
                    </HStack>
                    <Text color="$coolGray600" mb={'$1'} fontSize="$sm">
                      {truncate(body.description, 100) ||
                        'No description provided'}
                    </Text>
                    <Text color="$coolGray800" fontSize="$xs">
                      {getRelativeTimeString(body.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
              <Divider mt={'$8'} />
            </Swipeable>
          ))}
        </VStack>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore">
       <JobCard
            job={selectedJob}
            onAccept={id => handleUpdateStatus('Accepted:', id)}
            onDecline={id => handleUpdateStatus('Declined:', id)}
          />
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
