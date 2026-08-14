import React from 'react';
import {Pressable} from 'react-native';
import {XStack, YStack, StyledCycle, StyledText, StyledDialog} from 'fluent-styles';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../../utils/theme';

const INDIGO = '#4f46e5';

const ImagePickerModal = ({onHandleImageSelect, modalVisible, setModalVisible}) => {
  const complete = response => {
    if (!response?.didCancel && !response?.errorCode && response?.assets?.length) {
      onHandleImageSelect(response);
    }
    setModalVisible(false);
  };

  const takePhoto = () => launchCamera({mediaType: 'photo', includeBase64: false, maxHeight: 2000, maxWidth: 2000, quality: 0.9}, complete);
  const choosePhoto = () => launchImageLibrary({mediaType: 'photo', includeBase64: false, selectionLimit: 1, maxHeight: 2000, maxWidth: 2000, quality: 0.9}, complete);

  const Action = ({icon, title, subtitle, onPress}) => (
    <Pressable onPress={onPress} accessibilityRole="button">
      <XStack minHeight={72} paddingHorizontal={14} alignItems="center" borderRadius={14} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
        <StyledCycle height={42} width={42} borderColor="#e0e7ff" backgroundColor="#eef2ff"><Icon name={icon} size={22} color={INDIGO} /></StyledCycle>
        <YStack flex={1} marginLeft={12}><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{title}</StyledText><StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{subtitle}</StyledText></YStack>
        <Icon name="chevron-right" size={24} color={theme.colors.gray[400]} />
      </XStack>
    </Pressable>
  );

  return (
    <StyledDialog visible={modalVisible}>
      <YStack width="100%" maxWidth={390} padding={20} borderRadius={20} backgroundColor={theme.colors.gray[1]}>
        <XStack alignItems="flex-start"><YStack flex={1}><StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Choose an image</StyledText><StyledText marginTop={5} color={theme.colors.gray[500]}>Take a clear photo or select one from your library.</StyledText></YStack><Pressable onPress={() => setModalVisible(false)} hitSlop={10}><Icon name="close" size={25} color={theme.colors.gray[600]} /></Pressable></XStack>
        <YStack marginTop={20} gap={10}>
          <Action icon="photo-camera" title="Take photo" subtitle="Use your device camera" onPress={takePhoto} />
          <Action icon="photo-library" title="Photo library" subtitle="Choose an existing image" onPress={choosePhoto} />
        </YStack>
        <Pressable onPress={() => setModalVisible(false)} style={{height: 48, marginTop: 14, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.gray[300], alignItems: 'center', justifyContent: 'center'}}><StyledText fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[800]}>Cancel</StyledText></Pressable>
      </YStack>
    </StyledDialog>
  );
};

export {ImagePickerModal};
