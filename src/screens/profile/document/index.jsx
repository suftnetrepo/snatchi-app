import React from 'react';
import {Alert, FlatList, Linking, Platform, Pressable} from 'react-native';
import {
  XStack, YStack, StyledCycle, StyledHeader, StyledSafeAreaView,
  StyledText, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useUserDocuments} from '../../../hooks/useUserDocuments';
import {useAppContext} from '../../../hooks/appContext';
import {useFocus} from '../../../hooks/useFocus';
import {theme} from '../../../utils/theme';

const INDIGO = '#4f46e5';
const iconFor = type => {
  const value = String(type || '').toLowerCase();
  if (value.includes('pdf')) return 'picture-as-pdf';
  if (value.includes('word') || value.includes('text')) return 'description';
  if (value.includes('spreadsheet')) return 'table-chart';
  return 'image';
};
const sizeLabel = bytes => {
  const size = Number(bytes);
  if (!size) return '';
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
};

const UserDocuments = () => {
  const {key} = useFocus();
  const navigation = useNavigation();
  const {user} = useAppContext();
  const {data = [], loading, error, handleDelete, handleReset} = useUserDocuments(key, user?.user_id);

  const openDocument = async document => {
    if (!document?.secure_url) return;
    const supported = await Linking.canOpenURL(document.secure_url);
    if (!supported) {
      Alert.alert('Cannot open document', 'This file cannot be opened on this device.');
      return;
    }
    await Linking.openURL(document.secure_url);
  };

  const confirmDelete = document => Alert.alert(
    'Delete document?',
    `${document.name || 'This document'} will be permanently removed.`,
    [{text: 'Cancel', style: 'cancel'}, {text: 'Delete', style: 'destructive', onPress: () => handleDelete(document._id)}],
  );

  const renderDocument = ({item}) => (
    <Pressable onPress={() => openDocument(item)} accessibilityRole="button">
      <XStack marginHorizontal={16} marginBottom={12} padding={15} minHeight={92} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]} alignItems="center">
        <StyledCycle height={48} width={48} borderColor="#e0e7ff" backgroundColor="#eef2ff"><Icon name={iconFor(item.document_type || item.mime_type)} size={24} color={INDIGO} /></StyledCycle>
        <YStack flex={1} marginLeft={12}>
          <StyledText numberOfLines={1} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.normal} color={theme.colors.gray[900]}>{item.name || 'Document'}</StyledText>
          <StyledText numberOfLines={2} marginTop={4} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{item.description || item.original_filename || 'No description'}</StyledText>
          <XStack marginTop={6} alignItems="center"><StyledText fontSize={theme.fontSize.micro} color={INDIGO}>{item.document_type || 'Document'}</StyledText>{!!sizeLabel(item.bytes) && <StyledText marginLeft={8} fontSize={theme.fontSize.micro} color={theme.colors.gray[400]}>· {sizeLabel(item.bytes)}</StyledText>}</XStack>
        </YStack>
        <Pressable onPress={() => openDocument(item)} hitSlop={8}><Icon name="open-in-new" size={21} color={INDIGO} /></Pressable>
        <Pressable onPress={() => confirmDelete(item)} hitSlop={8} style={{marginLeft: 18}}><Icon name="delete-outline" size={23} color={theme.colors.red[600]} /></Pressable>
      </XStack>
    </Pressable>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" borderBottomWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}><StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}><Icon name="arrow-back" size={24} color={theme.colors.gray[900]} /></StyledCycle></Pressable>
            <YStack flex={1} marginLeft={13}><StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>My documents</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{data.length} document{data.length === 1 ? '' : 's'} uploaded</StyledText></YStack>
            <Pressable onPress={() => navigation.navigate('upload-user-documents')}><StyledCycle height={42} width={42} borderColor={INDIGO} backgroundColor={INDIGO}><Icon name="add" size={24} color="#fff" /></StyledCycle></Pressable>
          </XStack>
        </StyledHeader.Full>
      </StyledHeader>

      <FlatList data={data} keyExtractor={item => item._id} renderItem={renderDocument} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop: 16, paddingBottom: 40, flexGrow: 1}} ListEmptyComponent={!loading ? <YStack flex={1} padding={38} justifyContent="center" alignItems="center"><StyledCycle height={74} width={74} borderColor="#e0e7ff" backgroundColor="#eef2ff"><Icon name="folder-open" size={32} color={INDIGO} /></StyledCycle><StyledText marginTop={17} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>No documents yet</StyledText><StyledText marginTop={7} textAlign="center" color={theme.colors.gray[500]}>Keep certificates, identification and compliance records securely with your profile.</StyledText><Pressable onPress={() => navigation.navigate('upload-user-documents')} style={{marginTop: 20, height: 46, paddingHorizontal: 20, borderRadius: 13, backgroundColor: INDIGO, justifyContent: 'center'}}><StyledText color="#fff" fontWeight={theme.fontWeight.bold}>Upload a document</StyledText></Pressable></YStack> : null} />
      {loading && <StyledSpinner />}
      {error && <StyledOkDialog title="Unable to load documents" description={typeof error === 'string' ? error : error?.message || 'Please try again.'} visible onOk={handleReset} />}
    </StyledSafeAreaView>
  );
};

export default UserDocuments;
