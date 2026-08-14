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
import { Pressable, Platform } from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const INDIGO = '#4f46e5';

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
    user && handleEdit(user);
    // Initialise the editable form when this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (file) {
      formData.append('file', {
        uri: file?.uri,
        type: file?.type,
        name: file?.fileName,
      });
    }

    formData.append('first_name', fields.first_name);
    formData.append('last_name', fields.last_name);
    formData.append('email', fields.email);
    formData.append('mobile', fields.mobile);

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
      backgroundColor={theme.colors.gray[1]}
      borderBottomWidth={1}
      borderColor={theme.colors.gray[200]}>
      <Pressable onPress={() => navigator.goBack()}>
        <StyledCycle
          height={42}
          width={42}
          borderColor={theme.colors.gray[200]}>
          <Icon name="arrow-back" size={24} color={theme.colors.gray[900]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={4} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.bold}
        color={theme.colors.gray[900]}
        fontSize={theme.fontSize.large}>
        Edit profile
      </StyledText>
      <StyledSpacer flex={1} />
    </XStack>
  );

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
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" enableOnAndroid showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 44}}>
      <StyledSpacer marginVertical={16} />
      <XStack justifyContent="center" alignItems="center">
        <FlexStyledBackgroundImage
          relative
          borderRadius={100}
          borderWidth={1}
          borderColor={theme.colors.gray[100]}
          height={120}
          width={120}
          imageUrl={imageUrl ? imageUrl : fields.secure_url}>
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
          borderColor={theme.colors.gray[400]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={12}
          height={52}
          paddingHorizontal={14}
          marginVertical={6}
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
          borderColor={theme.colors.gray[400]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={12}
          height={52}
          paddingHorizontal={14}
          marginVertical={6}
          value={fields.last_name}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('last_name', text)}
          error={!!errorMessages?.last_name}
          errorMessage={errorMessages?.last_name?.message}
        />
        <StyledInput
          label={'Mobile'}
          keyboardType="phone-pad"
          placeholder="Enter your mobile"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[400]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={12}
          height={52}
          paddingHorizontal={14}
          marginVertical={6}
          value={fields.mobile}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('mobile', text)}
          error={!!errorMessages?.mobile}
          errorMessage={errorMessages?.mobile?.message}
        />
        <StyledInput
          label={'Email'}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
          returnKeyType="next"
          maxLength={50}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[400]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={12}
          height={52}
          paddingHorizontal={14}
          marginVertical={6}
          value={fields.email}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('email', text)}
          error={!!errorMessages?.email}
          errorMessage={errorMessages?.email?.message}
        />
        <StyledSpacer marginVertical={8} />
        <StyledButton
          width="100%"
          borderColor={INDIGO}
          borderRadius={14}
          backgroundColor={INDIGO}
          disabled={loading}
          onPress={onSubmit}>
          <StyledText
            paddingHorizontal={20}
            paddingVertical={10}
            color={theme.colors.gray[1]}>
            {loading ? 'Saving…' : 'Save profile'}
          </StyledText>
        </StyledButton>
      </YStack>
      </KeyboardAwareScrollView>
      {success && (
        <StyledOkDialog
          title="Profile updated"
          description="Your changes have been saved successfully."
          visible={true}
          onOk={() => {
            handleReset();
            navigator.goBack();
          }}
        />
      )}
      {error && (
        <StyledOkDialog
          title="Unable to update profile"
          description={typeof error === 'string' ? error : error?.message || 'Please try again.'}
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
