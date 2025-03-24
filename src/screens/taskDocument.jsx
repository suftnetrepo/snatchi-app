import React, {useState} from 'react';
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
  StyledInput,
  FlexStyledBackgroundImage,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../utils/theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTaskDocument} from '../hooks/useTaskDocument';
import {ImagePickerModal} from '../components/imagePickerModal';
import {validate} from '../validator';
import { Pressable } from 'react-native';

const TaskDocument = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [imageUrl, setImageUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {task_id, project_id} = route.params;
  const {
    success,
    error,
    loading,
    rules,
    fields,
    handleChange,
    handleUpload,
    handleReset,
  } = useTaskDocument(task_id, project_id);
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
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.fileName || 'upload.jpg',
    });

    formData.append('document_type', fields.document_type);
    formData.append('document_name', fields.document_name);
    formData.append('projectId', project_id);
    formData.append('taskId', task_id);

    const reset = () => {
      handleReset();
      setFile(null);
    };

    handleUpload(formData).then(result => {
      result && reset();
    });
  };

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
        Upload Photo
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack
        flex={1}
        paddingVertical={8}
        paddingHorizontal={8}
        justifyContent="flex-start"
        alignItems="center"
        backgroundColor={theme.colors.gray[100]}>
        <XStack justifyContent="center" alignItems="center">
          <FlexStyledBackgroundImage
            relative
            borderRadius={15}
            borderWidth={1}
            borderColor={theme.colors.gray[100]}
            height={250}
            width={'100%'}
            imageUrl={imageUrl}>
            <XStack absolute right={-300} bottom={-188}>
              <Icon
                size={48}
                name="add-a-photo"
                color={imageUrl ? theme.colors.gray[1] : theme.colors.gray[800]}
                onPress={() => pickImage()}
              />
            </XStack>
          </FlexStyledBackgroundImage>
        </XStack>
        <StyledSpacer marginVertical={8} />
        <StyledInput
          label={'Description'}
          keyboardType="default"
          placeholder="Enter short description about photo"
          returnKeyType="next"
          maxLength={200}
          fontSize={theme.fontSize.normal}
          borderColor={theme.colors.gray[800]}
          backgroundColor={theme.colors.gray[1]}
          borderRadius={32}
          paddingHorizontal={8}
          value={fields.document_name}
          placeholderTextColor={theme.colors.gray[300]}
          onChangeText={text => handleChange('document_name', text)}
          error={!!errorMessages?.document_name}
          errorMessage={errorMessages?.document_name?.message}
        />
        <StyledSpacer marginVertical={8} />
        <StyledButton
          width={'100%'}
          backgroundColor={theme.colors.cyan[500]}
          onPress={() => imageUrl && handleSubmit()}>
          <StyledText
            paddingHorizontal={20}
            paddingVertical={10}
            color={theme.colors.gray[1]}>
            Upload
          </StyledText>
        </StyledButton>
      </YStack>
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
      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Document uploaded successfully"
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

export default TaskDocument;
