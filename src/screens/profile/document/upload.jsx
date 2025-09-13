import React, { useState } from 'react';
import {
  YStack,
  XStack,
  StyledSafeAreaView,
  StyledText,
  StyledHeader,
  StyledSpacer,
  StyledOkDialog,
  StyledCycle,
  StyledSpinner,
  StyledButton,
  StyledMultiInput,
} from 'fluent-styles';
import { StyledDropdown } from '../../../components/dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserDocuments } from '../../../hooks/useUserDocuments';
import { ImagePickerModal } from '../../../components/imagePickerModal';
import { fontStyles, theme } from '../../../utils/theme';
import { validate } from '../../../validator';
import { personalDocumentsArray } from '../../../utils/help';
import { useAppContext } from '../../../hooks/appContext';

const UploadUserDocument = () => {
  const navigation = useNavigation();
  const { user } = useAppContext();
  const [imageUrl, setImageUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState();
  const {
    success,
    error,
    loading,
    rules,
    fields,
    handleChange,
    handleUpload,
    handleReset,
  } = useUserDocuments();
  const [errorMessages, setErrorMessages] = useState({});
  const [file, setFile] = useState(null);

  const onHandleImageSelect = async response => {
    if (response.assets[0].uri) {
      setImageUrl(response.assets[0].uri);
      setFile(response.assets[0]);
    }
  };

  const pickImage = async () => {
    setModalVisible(true);
  };

  const handleSubmit = async () => {

    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.fileName || 'upload.jpg',
    });

    formData.append('description', fields.description);
    formData.append('name', value);
    formData.append('userId', user.user_id);

    handleUpload(formData).then(result => {
    
    });
  };

  const clearState = () => {
    setFile(null);
    setImageUrl(null);
    setValue(null);
    setErrorMessages({});
    handleReset();
  }
  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <Pressable onPress={() => navigation.goBack()}>
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
        Upload Document
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <StyledHeader
          skipAndroid={true}
          marginHorizontal={8}
          statusProps={{ translucent: true }}>
          <StyledHeader.Full>
            <RenderHeader />
          </StyledHeader.Full>
        </StyledHeader>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack
            flex={1}
            paddingVertical={8}
            paddingHorizontal={8}
            justifyContent="flex-start"
            alignItems="center"
            backgroundColor={theme.colors.gray[100]}>
            <StyledSpacer marginVertical={8} />
            <StyledDropdown
              borderRadius={8}
              borderColor={theme.colors.gray[400]}
              items={personalDocumentsArray}
              value={value}
              setValue={setValue}
              selectedValue={value}
              onChangeValue={value => setValue(value)}
              placeholder={'Select document type ...'}
              listMode="SCROLLVIEW"></StyledDropdown>
            <StyledSpacer marginVertical={4} />
            <StyledMultiInput
              label={'Description'}
              labelProps={{
                fontSize: theme.fontSize.small
              }}
              keyboardType="default"
              placeholder="Enter short description"
              returnKeyType="next"
              maxLength={200}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              height={80}
              textAlignVertical='center'
              paddingHorizontal={16}
              value={fields.description}
              placeholderTextColor={theme.colors.gray[300]}
              onChangeText={text => handleChange('description', text)}
              error={!!errorMessages?.description}
              errorMessage={errorMessages?.description?.message}
            />
            <StyledSpacer marginVertical={8} />
            <XStack justifyContent="center" alignItems="center" gap={4}>
              <StyledButton
                flex={1}
                backgroundColor={theme.colors.orange[500]}
                borderColor={theme.colors.orange[500]}
                onPress={() => pickImage()}>
                <StyledText
                  paddingHorizontal={20}
                  paddingVertical={10}
                  color={theme.colors.gray[1]}>
                  Choose
                </StyledText>
              </StyledButton>
              <StyledButton
                flex={2}
                backgroundColor={file ? theme.colors.cyan[500] : theme.colors.gray[300]}
                borderColor={file ? theme.colors.cyan[500] : theme.colors.gray[300]}
                onPress={() => handleSubmit()}>
                <StyledText
                  paddingHorizontal={20}
                  paddingVertical={10}
                  color={file ? theme.colors.gray[1] : theme.colors.gray[400]}>
                  Upload
                </StyledText>
              </StyledButton>
            </XStack>
          </YStack>
        </ScrollView>

        {error && (
          <StyledOkDialog
            title={error?.message}
            description="please try again"
            visible={true}
            onOk={() => {
              clearState();
            }}
          />
        )}
        {success && (
          <StyledOkDialog
            title="Confirmation"
            description="Document uploaded successfully"
            visible={true}
            onOk={() => {
              clearState();
            }}
          />
        )}
        {loading && <StyledSpinner />}
        <ImagePickerModal
          onHandleImageSelect={onHandleImageSelect}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default UploadUserDocument;
