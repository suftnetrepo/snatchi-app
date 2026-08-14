import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  XStack, YStack, StyledCycle, StyledHeader, StyledSafeAreaView,
  StyledText, StyledSpinner, StyledOkDialog, StyledMultiInput,
} from 'fluent-styles';
import {StyledDropdown} from '../../../components/dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useUserDocuments} from '../../../hooks/useUserDocuments';
import {ImagePickerModal} from '../../../components/imagePickerModal';
import {personalDocumentsArray} from '../../../utils/help';
import {useAppContext} from '../../../hooks/appContext';
import {theme} from '../../../utils/theme';

const INDIGO = '#4f46e5';
const MAX_BYTES = 15 * 1024 * 1024;

const UploadUserDocument = () => {
  const navigation = useNavigation();
  const {user} = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [documentName, setDocumentName] = useState();
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const {success, error, loading, fields, handleChange, handleUpload, handleReset} = useUserDocuments();

  const selectFile = response => {
    const asset = response?.assets?.[0];
    if (!asset?.uri) return;
    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      setLocalError('Choose a file that is 15 MB or smaller.');
      return;
    }
    setFile(asset);
    setLocalError(null);
  };

  const submit = async () => {
    const description = String(fields.description || '').trim();
    if (!documentName) {
      setLocalError('Select a document type.');
      return;
    }
    if (!file?.uri) {
      setLocalError('Take a photo or choose an image to upload.');
      return;
    }
    if (description.length > 500) {
      setLocalError('Description must not exceed 500 characters.');
      return;
    }
    if (!user?.user_id) {
      setLocalError('Your account could not be identified. Please sign in again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {uri: file.uri, type: file.type || 'image/jpeg', name: file.fileName || `document-${Date.now()}.jpg`});
    formData.append('description', description);
    formData.append('name', documentName);
    formData.append('userId', user.user_id);
    await handleUpload(formData);
  };

  const reset = () => {
    setFile(null);
    setDocumentName(null);
    setLocalError(null);
    handleReset();
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
          <StyledHeader.Full>
            <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" borderBottomWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
              <Pressable onPress={() => navigation.goBack()} hitSlop={12}><StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}><Icon name="arrow-back" size={24} color={theme.colors.gray[900]} /></StyledCycle></Pressable>
              <YStack flex={1} marginLeft={13}><StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Upload document</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Add a record to your profile</StyledText></YStack>
            </XStack>
          </StyledHeader.Full>
        </StyledHeader>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <YStack padding={16} borderRadius={18} backgroundColor="#eef2ff">
            <XStack alignItems="center"><StyledCycle height={44} width={44} borderColor="#c7d2fe" backgroundColor="#e0e7ff"><Icon name="security" size={23} color={INDIGO} /></StyledCycle><YStack flex={1} marginLeft={12}><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Secure document record</StyledText><StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[600]}>Upload a clear image. Maximum file size is 15 MB.</StyledText></YStack></XStack>
          </YStack>

          <Text style={styles.label}>Document type</Text>
          <StyledDropdown borderRadius={12} borderColor={theme.colors.gray[300]} items={personalDocumentsArray} value={documentName} setValue={setDocumentName} selectedValue={documentName} onChangeValue={setDocumentName} placeholder="Select document type" listMode="SCROLLVIEW" />

          <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
          <StyledMultiInput keyboardType="default" placeholder="Add expiry details or other useful information" returnKeyType="done" maxLength={500} fontSize={theme.fontSize.normal} borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} borderRadius={12} height={112} textAlignVertical="top" paddingHorizontal={15} value={fields.description} placeholderTextColor={theme.colors.gray[400]} onChangeText={text => {handleChange('description', text); setLocalError(null);}} />
          <StyledText alignSelf="flex-end" marginTop={5} fontSize={theme.fontSize.micro} color={theme.colors.gray[400]}>{String(fields.description || '').length}/500</StyledText>

          <Pressable onPress={() => setModalVisible(true)} style={({pressed}) => [styles.fileCard, pressed && styles.pressed]}>
            <StyledCycle height={48} width={48} borderColor={file ? '#c7d2fe' : theme.colors.gray[200]} backgroundColor={file ? '#eef2ff' : theme.colors.gray[100]}><Icon name={file ? 'check-circle' : 'add-a-photo'} size={25} color={file ? INDIGO : theme.colors.gray[500]} /></StyledCycle>
            <YStack flex={1} marginLeft={12}><StyledText numberOfLines={1} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>{file?.fileName || (file ? 'Photo selected' : 'Choose document image')}</StyledText><StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{file ? `${file.type || 'Image'}${file.fileSize ? ` · ${(file.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}` : 'Use camera or photo library'}</StyledText></YStack>
            <Icon name="chevron-right" size={24} color={theme.colors.gray[400]} />
          </Pressable>

          {!!localError && <XStack marginTop={12} padding={12} borderRadius={12} backgroundColor={theme.colors.red[50]} alignItems="center"><Icon name="error-outline" size={20} color={theme.colors.red[600]} /><StyledText flex={1} marginLeft={8} fontSize={theme.fontSize.small} color={theme.colors.red[700]}>{localError}</StyledText></XStack>}

          <Pressable onPress={submit} disabled={loading} style={({pressed}) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? 'Uploading…' : 'Upload document'}</Text></Pressable>
        </ScrollView>

        {loading && <StyledSpinner />}
        {error && <StyledOkDialog title="Upload failed" description={typeof error === 'string' ? error : error?.message || 'Your document was not uploaded. Please try again.'} visible onOk={handleReset} />}
        {success && <StyledOkDialog title="Document uploaded" description="Your document is now available in My Documents." visible onOk={() => {reset(); navigation.goBack();}} />}
        <ImagePickerModal onHandleImageSelect={selectFile} modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1}, content: {padding: 16, paddingBottom: 44},
  label: {marginTop: 22, marginBottom: 8, fontSize: 14, fontWeight: '600', color: theme.colors.gray[800]}, optional: {fontWeight: '400', color: theme.colors.gray[500]},
  fileCard: {minHeight: 76, marginTop: 18, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.gray[200], backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center'},
  button: {height: 52, marginTop: 22, borderRadius: 14, backgroundColor: INDIGO, alignItems: 'center', justifyContent: 'center'},
  buttonText: {fontSize: 16, fontWeight: '700', color: '#fff'}, pressed: {opacity: 0.88}, disabled: {opacity: 0.55},
});

export default UploadUserDocument;
