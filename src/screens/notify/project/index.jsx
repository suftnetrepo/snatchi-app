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
  YStack,
  XStack,
  StyledCycle,
  StyledText,
  StyledSpacer,
  StyledButton,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStorage, PROJECT_KEY } from '../../../hooks/useStorage';
import { theme, fontStyles } from '../../../utils/theme';
import { getRelativeTimeString, truncate } from '../../../utils/help';
import BottomSheet from '@gorhom/bottom-sheet';
import { ProjectDetail } from '../projectDetails';
import { Dimensions } from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ProjectNotification() {
  const [selected, setSelected] = useState(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['90%', '100%'], []);
  const { handleMarkAsRead, data, handleDelete } =
    useStorage(PROJECT_KEY);

  const onhandleDelete = id => {
    handleDelete(PROJECT_KEY, id);
  };

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
    <YStack height={SCREEN_HEIGHT} flex={1} backgroundColor={theme.colors.gray[1]}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#fff' }}>
   
        <VStack p={'$4'} space="lg">
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
                            setSelected(body);
                              handleMarkAsRead(PROJECT_KEY, body.id);
                              bottomSheetRef.current?.snapToIndex(1);
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
    </YStack>
  );
}
