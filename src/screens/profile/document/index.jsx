import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledText,
  StyledCycle,
  StyledSpacer,
  StyledSpinner,
  StyledOkDialog,
} from 'fluent-styles';
import {
  Linking,
  Pressable,
} from 'react-native';
import {FlatList, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../../utils/theme';
import {StyledMIcon} from '../../../components/icon';
import {useUserDocuments} from '../../../hooks/useUserDocuments';
import { useAppContext } from '../../../hooks/appContext';
import { useFocus } from '../../../hooks/useFocus';

const UserDocuments = () => {
  const {key} = useFocus();
  const navigator = useNavigation();
  const { user} = useAppContext()
  const {data, loading, error, handleDelete} = useUserDocuments(key, user?.user_id);

  const handleDeepLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        if (__DEV__) console.error("Don't know how to open this URL: " + url);
      }
    } catch (error) {
      if (__DEV__)
        console.error('An error occurred while opening the URL: ', error);
    }
  };


  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <StyledCycle
        pressable
        pressableProps={{
          onPress: () => navigator.goBack(),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.gray[400]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={4} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        My Documents
      </StyledText>
      <StyledSpacer flex={1} />

      <StyledCycle
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon
          name="add"
          size={25}
          color={theme.colors.gray[1]}
          onPress={() => navigator.navigate('upload-user-documents')}
        />
      </StyledCycle>
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  const Render = ({document}) => {
    return (
      <XStack justifyContent="space-between" alignItems="center" borderColor={theme.colors.gray[100]} backgroundColor={theme.colors.gray[1]} marginBottom={8} paddingVertical={8} paddingHorizontal={8} borderRadius={8}>
        <YStack flex={1}>
          <StyledText
            paddingHorizontal={8}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.medium}
            color={theme.colors.gray[800]}>
            {document.name}
          </StyledText>
          <StyledText
            paddingHorizontal={8}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.small}
            color={theme.colors.gray[600]}>
            {document.description}
          </StyledText>
        </YStack>
        <XStack justifyContent="space-between" alignItems="center" gap={4}>
          <Pressable onPress={() => {}}>
            <StyledCycle
              height={48}
              width={48}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}>
              <StyledMIcon
                name="link"
                size={25}
                color={theme.colors.gray[600]}
                onPress={() =>document?.secure_url && handleDeepLink(document.secure_url)}
              />
            </StyledCycle>
          </Pressable>
            <StyledSpacer marginVertical={8} />
          <Pressable onPress={() => handleDelete(document._id)}>
            <StyledCycle
              height={48}
              width={48}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}>
              <Icon name="delete" size={25} color={theme.colors.gray[600]} />
            </StyledCycle>
          </Pressable>
        </XStack>
      </XStack>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
       skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack
        flex={1}
        paddingHorizontal={8}
        paddingVertical={8}
        backgroundColor={theme.colors.gray[200]}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          keyExtractor={item => item._id}
          renderItem={({item, index}) => {
            return <Render document={item} key={`${item._id}-${index}`} />;
          }}
        />
      </YStack>
      {loading && <StyledSpinner />}
      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            navigator.goBack();
          }}
        />
      )}
    </StyledSafeAreaView>
  );
};

export default UserDocuments;
