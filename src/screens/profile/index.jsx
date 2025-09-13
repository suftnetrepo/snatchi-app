import React, { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledSpinner,
  StyledButton,
  StyledOkDialog,
  StyledInput,
  StyledCycle,
  FlexStyledBackgroundImage,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import { useUser } from '../../hooks/useUser';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../../hooks/appContext';
import { validate } from '../../validator';
import { ImagePickerModal } from '../../components/imagePickerModal';
import { Pressable } from 'react-native';
import { getStore } from '../../utils/asyncStorage';


const Profile = () => {
  const navigator = useNavigation();
  const { user, updateCurrentUser } = useAppContext();
  const [errorMessages, setErrorMessages] = useState({});
  const [file, setFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const {
    handleChange,
    handleSave,
    handleReset,
    handleEdit,
    success,
    error,
    loading,
    fields,
    rules,
  } = useUser();

  useEffect(() => {
    async function fetchFcm() {
      const fcm = await getStore('fcm');
      handleChange('fcm', fcm);
      // You can use the fcm token as needed
      if (__DEV__) console.log('Stored FCM Token:', fcm);
    }
    fetchFcm();
    user && handleEdit(user);
  }, [user]);

  const onHandleImageSelect = async response => {
    if (response.assets[0].uri) {
      setImageUrl(response.assets[0].uri);
      setFile(response.assets[0]);
    }
  };

  const pickImage = async () => {
    setModalVisible(true);
  };

  const onSubmit = async () => {
    setErrorMessages({});
    const { hasError, errors } = validate(fields, rules);
    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    const formData = new FormData();

    formData.append('file', {
      uri: file?.uri,
      type: file?.type,
      name: file?.fileName,
    });

    formData.append('first_name', fields.first_name);
    formData.append('last_name', fields.last_name);
    formData.append('email', fields.email);
    formData.append('mobile', fields.mobile);

    if (fields.fcm) {
      formData.append('fcm', fields.fcm);
    }

    handleSave(formData, user.user_id).then(async result => {
      if (result) {
        updateCurrentUser(fields);
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
        My Profile
      </StyledText>
      <StyledSpacer flex={1} />
      <Pressable onPress={() => { navigator.navigate('user-documents'); }}>
        <StyledCycle
          height={48}
          width={48}
          borderColor={theme.colors.cyan[500]}
          backgroundColor={theme.colors.cyan[500]}>
          <Icon
            name="file-upload"
            size={16}
            color={theme.colors.gray[1]}
          />
        </StyledCycle>
      </Pressable>

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
      <StyledSpacer marginVertical={16} />
      <XStack justifyContent="center" alignItems="center">
        <FlexStyledBackgroundImage
          relative
          borderRadius={100}
          borderWidth={1}
          borderColor={theme.colors.gray[100]}
          height={120}
          width={120}
          imageUrl={imageUrl}>
          <XStack absolute right={-74} bottom={-74}>
            <Icon
              size={48}
              name="add-a-photo"
              color={imageUrl ? theme.colors.gray[500] : theme.colors.gray[800]}
              onPress={() => pickImage()}
            />
          </XStack>
        </FlexStyledBackgroundImage>
      </XStack>
      <YStack
        flex={1}
        paddingHorizontal={16}
        justifyContent="flex-start"
        alignItems="flex-start">
        <StyledInput
          label={'Firstname'}
          keyboardType="default"
          placeholder="Enter your firstname"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          marginVertical={4}
          value={fields.first_name}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('first_name', text)}
          error={!!errorMessages?.first_name}
          errorMessage={errorMessages?.first_name?.message}
        />
        <StyledInput
          label={'Lastname'}
          keyboardType="default"
          placeholder="Enter your lastname"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          marginVertical={4}
          value={fields.last_name}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('last_name', text)}
          error={!!errorMessages?.last_name}
          errorMessage={errorMessages?.last_name?.message}
        />
        <StyledInput
          label={'Mobile'}
          keyboardType="default"
          placeholder="Enter your mobile"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          marginVertical={4}
          value={fields.mobile}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('mobile', text)}
          error={!!errorMessages?.mobile}
          errorMessage={errorMessages?.mobile?.message}
        />
        <StyledInput
          label={'Email'}
          keyboardType="default"
          placeholder="Enter your email"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          marginVertical={4}
          value={fields.email}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('email', text)}
          error={!!errorMessages?.email}
          errorMessage={errorMessages?.email?.message}
        />
        <StyledSpacer marginVertical={8} />
        <StyledButton
          width="100%"
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => onSubmit()}>
          <StyledText
            paddingHorizontal={20}
            paddingVertical={10}
            color={theme.colors.gray[1]}>
            Submit
          </StyledText>
        </StyledButton>
      </YStack>
      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Your profile was updated successfully"
          visible={true}
          onOk={() => {

          }}
        />
      )}
      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
      {loading && <StyledSpinner />}
      <ImagePickerModal
        onHandleImageSelect={onHandleImageSelect}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </StyledSafeAreaView>
  );
};

export default Profile;
