import React, {useRef, useMemo, useState, useEffect} from 'react';
import {ScrollView, Animated} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {Text, VStack, HStack, Pressable, Divider} from '@gluestack-ui/themed';
import {StyledSpinner, StyledOkDialog} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {theme} from '../../../utils/theme';
import {getRelativeTimeString} from '../../../utils/help';
import {Dimensions} from 'react-native';
import JobCard from '../../../components/notifyCard';
const SCREEN_HEIGHT = Dimensions.get('window').height;
import {useNotification} from '../../../hooks/useNotification';

export default function CalendarNotification() {
  const bottomSheetRef = useRef(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const snapPoints = useMemo(() => ['90%', '100%'], []);
  const {
    data,
    loading,
    error,
    success,  
    fetchNotifications,
    handleEdit,
    handleDelete,
    handleReset,
    handleUpdateStatus
  } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  console.log('CalendarNotification data:', data);

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !Array.isArray(data)) {
      return null;
    }

    return (
      data.find(job => {
        const jobId = job?.id;
        return jobId === selectedJobId;
      }) || null
    );
  }, [data, selectedJobId]);

  const onhandleDelete = id => {
    handleDelete(id);
  };

  const close = () => {
    bottomSheetRef.current?.close();
  };

  const onUpdateStatus = (status, id) => {
    handleUpdateStatus(status, id).then(() => {
      close();
      handleReset();
    });
  };

  const renderRightActions = (progress, dragX, onPress) => {
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
        <VStack minHeight={SCREEN_HEIGHT} p={'$4'} space="lg">
          {data?.map((body, index) => (
            <Swipeable
              key={index}
              renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, () => {
                  onhandleDelete(body.id);
                })
              }>
              <Pressable
                onPress={() => {
                  if (!body.read) {
                  
                  handleEdit(body, body.id, 'read').then(() => {
                    setSelectedJobId(body?.id);
                    bottomSheetRef.current?.snapToIndex(0);
                  })} else {
                    setSelectedJobId(body?.id);
                    bottomSheetRef.current?.snapToIndex(0);
                  }
                }}>
                <HStack
                  alignItems="flex-start"
                  style={{
                    borderLeftWidth: body.read ? 4 : 0,
                    borderLeftColor: body.read
                      ? theme.colors.green[500]
                      : 'transparent',
                    paddingLeft: body.read ? 12 : 0,
                  }}>
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
                      {body.description || 'No description provided'}
                    </Text>
                    <Text color="$coolGray800" fontSize="$xs">
                      {getRelativeTimeString(body.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
              <Divider mt={'$2'} />
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
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}>
          <JobCard
            job={selectedJob}
            onAccept={id => onUpdateStatus('Accepted', id)}
            onDecline={id => onUpdateStatus('Declined', id)}
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
