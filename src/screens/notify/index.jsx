import React, { useState, useRef, useMemo } from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Divider,
  Avatar,
  Button,
  set
} from '@gluestack-ui/themed';
import {
  StyledSpinner,
  YStack,
  XStack,
  StyledOkDialog,
  StyledImage,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledInput,
  StyledText,
  StyledButton,
  StyledCycle
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useStorage, PROJECT_KEY } from '../../hooks/useStorage';
import { theme, fontStyles } from '../../utils/theme';
import { notify } from '../../../data/notify';
import { getRelativeTimeString } from '../../utils/help';
import BottomSheet from '@gorhom/bottom-sheet';
import { ProjectDetail } from './projectDetails';

export default function Notify() {
  const navigator = useNavigation();
  const [showSheet, setShowSheet] = useState(false);
  const [selected, setSelected] = useState(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const { data, loading, success, handleMarkAsRead } = useStorage(PROJECT_KEY);

  const project = {
    projectId: '67bc2c1ebb47cab9f8a156eb',
    id: '67bc2c1ebb47cab9f8a156eb',
    integrator: '679733468f42d980183f89bd',
    siteName: 'Deploy a cloud-based digital signage system for a retail chain.',
    latitude: 52.54169165,
    longitude: -0.29971815,
    radius: 200,
    startDate: '2025-02-25T08:20:00.000Z',
    endDate: '2025-02-28T12:20:00.000Z',
    startTime: '08:20',
    endTime: '12:20',
    activeDays: [2, 3, 4, 5],
    completeAddress:
      'PE2 5SP, Orton Waterville, City of Peterborough, Cambridgeshire and Peterborough, England, United Kingdom',
    status: 'Pending',
    userId: '679735d6e0a110edbc266745',
    firstName: 'Micheal',
    lastName: 'Hooks',
    description:
      'Key Features: Dynamic Content Management (Cloud-based CMS for promotions) Scheduling System (Automated updates for displays).',
    action: true,
    read: false,
    createdAt: 1761058110047,
  };

  console.log("Storage Data: ", notify);

  const RenderHeader = () => (
    <XStack
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
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Box p="$4">
          <VStack space="lg" >
            {notify.map((item, index) => (
              <Box key={index}>
                <HStack space="md" alignItems="flex-start">
                  <VStack flex={1}>
                    <HStack justifyContent="flex-start" alignItems="center">
                      <Text flex={6} fontWeight="$bold">{item.siteName}</Text>
                      {item && (
                        <Pressable marginLeft={8} flex={1} onPress={() => {
                          setSelected(item);
                          bottomSheetRef.current?.snapToIndex(1);
                        }}>
                          <StyledCycle
                            height={48}
                            width={48}
                            borderWidth={0}
                            backgroundColor={theme.colors.gray[200]}
                            borderColor={theme.colors.gray[200]}>
                            <Icon name="chevron-right" size={15} color={theme.colors.gray[800]} />
                          </StyledCycle>
                        </Pressable>
                      )}
                    </HStack>
                    <Text color="$coolGray600" mt="$1" fontSize="$sm">
                      {item.description}
                    </Text>
                    <Text color="$coolGray400" mt="$1" fontSize="$xs">
                      {getRelativeTimeString(item.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
                <Divider mt="$3" />
              </Box>
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
        <ProjectDetail project={selected} handleClose={() => { bottomSheetRef.current?.close(); setSelected(null) }} />
      </BottomSheet>
      {/*       
      <BottomSheet
        title="Project Details"
        isVisible={showSheet}
        onClose={() => { setShowSheet(false) 
            setSelected(null);
        }}
      >
        <ProjectDetail project={selected} />
      </BottomSheet> */}
    </StyledSafeAreaView>)
}
