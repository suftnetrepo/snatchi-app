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
import {Linking, Pressable} from 'react-native';
import {FlatList, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {StyledMIcon} from '../../components/icon';
import {useServiceRate} from '../../hooks/useServiceRate';
import {useAppContext} from '../../hooks/appContext';

const ServiceRate = () => {
  const navigator = useNavigation();
  const {user} = useAppContext();
  const {loading, error, data, handleDelete} = useServiceRate(true);

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
        My Service Rates
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledCycle
        pressable
        pressableProps={{
          onPress: () => navigator.navigate('service-rate-form'),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon name="add" size={24} color={theme.colors.gray[1]} />
      </StyledCycle>
    </XStack>
  );

  const Render = ({rate}) => {
    return (
      <XStack
        justifyContent="space-between"
        alignItems="center"
        borderColor={theme.colors.gray[100]}
        backgroundColor={theme.colors.gray[1]}
        marginBottom={8}
        paddingVertical={8}
        paddingHorizontal={8}
        borderRadius={8}>
        <YStack flex={1}>
          <StyledText
            paddingHorizontal={8}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.medium}
            color={theme.colors.gray[800]}>
            {rate.name}
          </StyledText>
          <StyledText
            paddingHorizontal={8}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.small}
            color={theme.colors.gray[600]}>
            {rate.description}
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
                name="create"
                size={25}
                color={theme.colors.gray[600]}
                onPress={() =>
                  navigator.navigate('service-rate-form', {rateId: rate._id})
                }
              />
            </StyledCycle>
          </Pressable>
          <StyledSpacer marginVertical={8} />
          <Pressable onPress={() => handleDelete(rate._id)}>
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
            return <Render rate={item} key={`${item._id}-${index}`} />;
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

export default ServiceRate;
