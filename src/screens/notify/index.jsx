import React, { useState, useRef, useMemo } from 'react';
import { ScrollView, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import {
  StyledCycle,
  StyledSpacer,
  StyledText,
  StyledHeader,
  StyledSafeAreaView,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useStorage, PROJECT_KEY } from '../../hooks/useStorage';
import { theme, fontStyles } from '../../utils/theme';
import { getRelativeTimeString, truncate, formatShortDate } from '../../utils/help';
import BottomSheet from '@gorhom/bottom-sheet';
import { ProjectDetail } from './projectDetails';

export default function Notify() {
  const navigator = useNavigation();
  const [selected, setSelected] = useState(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const { handleMarkAsRead, data, handleDelete } =
    useStorage(PROJECT_KEY);

  const onhandleDelete = id => {
    handleDelete(PROJECT_KEY, id);
  };

  const RenderHeader = () => (
    <HStack
      paddingHorizontal={8}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => navigator.goBack()}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.gray[200]}>
          <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        Notifications
      </StyledText>
      <StyledSpacer flex={1} />
    </HStack>
  );

  // Swipeable delete action
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
            transform: [{ scale }],
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
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Box p="$4">
          <VStack space="lg">
            {data?.map((body, index) => (
              <Swipeable
                key={index}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, () => {
                    onhandleDelete(body.id);
                  })
                }>
                <Box bg="$white" borderRadius="$md">
                  <HStack space="md" alignItems="flex-start">
                    <VStack flex={1}>
                      <HStack justifyContent="flex-start" alignItems="center">
                        <Text
                          flex={6}
                          fontWeight="$bold"
                          fontSize="$md"
                          color="$black">
                          {body.siteName}
                        </Text>
                        <Pressable
                          marginLeft={8}
                          flex={1}
                          onPress={() => {
                            if (body.action === true) {
                              setSelected(body);
                              handleMarkAsRead(PROJECT_KEY, body.id);
                              bottomSheetRef.current?.snapToIndex(1);
                            } else {
                              navigator.navigate(body.screen, {
                                id: body.id,
                                day :{
                                  dateString : formatShortDate(body.startDate)
                                }
                              })
                            }
                          }}>
                          <StyledCycle
                            height={40}
                            width={40}
                            borderWidth={1}
                            backgroundColor={theme.colors.gray[50]}
                            borderColor={theme.colors.gray[200]}>
                            <Icon
                              name="chevron-right"
                              size={20}
                              color={theme.colors.gray[600]}
                            />
                          </StyledCycle>
                        </Pressable>
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
                </Box>
                <Divider mt={'$8'} />
              </Swipeable>
            ))}
          </VStack>
        </Box>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore">
        <ProjectDetail
          project={selected}
          handleClose={() => {
            bottomSheetRef.current?.close();
            setSelected(null);
          }}
        />
      </BottomSheet>
    </StyledSafeAreaView>
  );
}
