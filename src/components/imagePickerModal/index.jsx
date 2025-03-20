import React from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledButton,
  StyledDialog,
} from 'fluent-styles';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {theme} from '../../utils/theme';

const ImagePickerModal = ({
  onHandleImageSelect,
  modalVisible,
  setModalVisible,
}) => {
  const handleChoosePhoto = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        if (__DEV__) console.log('User cancelled camera');
      } else if (response.error) {
        if (__DEV__) console.log('Camera Error', response.error);
      } else {
        onHandleImageSelect(response);
      }
      setModalVisible(false);
    });
  };

  const handleTakePhoto = () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        if (__DEV__) console.log('User cancelled gallery');
      } else if (response.error) {
        if (__DEV__) console.log('Gallery Error', response.error);
      } else {
        onHandleImageSelect(response);
      }
      setModalVisible(false);
    });
  };

  const RenderModal = () => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <XStack
          justifyContent="space-between"
          alignItems="center"
          gap={8}
          paddingHorizontal={32}>
          <StyledButton
            borderRadius={8}
            borderColor={theme.colors.gray[800]}
            backgroundColor={theme.colors.gray[800]}
            onPress={() => handleChoosePhoto()}>
            <YStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={8}>
              <FontAwesome
                name="camera"
                size={30}
                color={theme.colors.gray[1]}
              />
              <StyledText
                paddingHorizontal={20}
                paddingVertical={10}
                color={theme.colors.gray[1]}>
                Take Photo
              </StyledText>
            </YStack>
          </StyledButton>
          <StyledButton
            borderRadius={8}
            borderColor={theme.colors.gray[800]}
            backgroundColor={theme.colors.gray[800]}
            onPress={() => handleTakePhoto()}>
            <YStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={8}>
              <FontAwesome
                name="image"
                size={30}
                color={theme.colors.gray[1]}
              />
              <StyledText
                paddingHorizontal={20}
                paddingVertical={10}
                color={theme.colors.gray[1]}>
                Gallary
              </StyledText>
            </YStack>
          </StyledButton>
          <StyledButton
            borderRadius={8}
            borderColor={theme.colors.gray[800]}
            backgroundColor={theme.colors.gray[800]}
            onPress={() => setModalVisible(false)}>
            <YStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={8}>
              <FontAwesome
                name="times"
                size={30}
                color={theme.colors.gray[1]}
              />
              <StyledText
                paddingHorizontal={20}
                paddingVertical={10}
                color={theme.colors.gray[1]}>
                Cancel
              </StyledText>
            </YStack>
          </StyledButton>
        </XStack>
      </YStack>
    );
  };

  return (
    <StyledDialog visible={modalVisible}>
      <RenderModal />
    </StyledDialog>
  );
};

export {ImagePickerModal};
