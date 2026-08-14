import React from 'react';
import {Alert, FlatList, Platform, Pressable} from 'react-native';
import {
  XStack, YStack, StyledCycle, StyledHeader, StyledSafeAreaView,
  StyledText, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useServiceRate} from '../../hooks/useServiceRate';
import {theme} from '../../utils/theme';

const INDIGO = '#4f46e5';
const formatRate = value => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `£${amount.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `£${value || '0.00'}`;
};

const ServiceRate = () => {
  const navigation = useNavigation();
  const {loading, error, data, handleDelete, handleReset} = useServiceRate(true);

  const confirmDelete = rate => Alert.alert(
    'Delete service rate?',
    `${rate.serviceName} will be removed from your rate list.`,
    [{text: 'Cancel', style: 'cancel'}, {text: 'Delete', style: 'destructive', onPress: () => handleDelete(rate._id)}],
  );

  const renderRate = ({item}) => (
    <YStack marginHorizontal={16} marginBottom={12} padding={16} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
      <XStack alignItems="flex-start">
        <StyledCycle height={44} width={44} borderColor="#e0e7ff" backgroundColor="#eef2ff"><Icon name="engineering" size={23} color={INDIGO} /></StyledCycle>
        <YStack flex={1} marginLeft={12}>
          <StyledText numberOfLines={1} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.normal} color={theme.colors.gray[900]}>{item.serviceName}</StyledText>
          <StyledText marginTop={4} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{item.description || 'No description added'}</StyledText>
        </YStack>
        <Pressable onPress={() => navigation.navigate('service-rate-form', {rate: item})} hitSlop={8}><Icon name="edit" size={22} color={INDIGO} /></Pressable>
        <Pressable onPress={() => confirmDelete(item)} hitSlop={8} style={{marginLeft: 18}}><Icon name="delete-outline" size={23} color={theme.colors.red[600]} /></Pressable>
      </XStack>
      <XStack marginTop={15} paddingTop={13} borderTopWidth={1} borderColor={theme.colors.gray[200]} justifyContent="space-between" alignItems="center">
        <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Your {item.rateType || 'standard'} rate</StyledText>
        <StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.medium} color={theme.colors.gray[900]}>{formatRate(item.rate)}<StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}> / {item.rateType === 'hourly' ? 'hour' : item.rateType === 'daily' ? 'day' : 'job'}</StyledText></StyledText>
      </XStack>
    </YStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" borderBottomWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}><StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}><Icon name="arrow-back" size={24} color={theme.colors.gray[900]} /></StyledCycle></Pressable>
            <YStack flex={1} marginLeft={13}><StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Service rates</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{data?.length || 0} rate{data?.length === 1 ? '' : 's'} configured</StyledText></YStack>
            <Pressable onPress={() => navigation.navigate('service-rate-form')}><StyledCycle height={42} width={42} borderColor={INDIGO} backgroundColor={INDIGO}><Icon name="add" size={24} color="#fff" /></StyledCycle></Pressable>
          </XStack>
        </StyledHeader.Full>
      </StyledHeader>

      <FlatList data={data} keyExtractor={item => item._id} renderItem={renderRate} contentContainerStyle={{paddingTop: 16, paddingBottom: 40, flexGrow: 1}} showsVerticalScrollIndicator={false} ListEmptyComponent={!loading ? <YStack flex={1} padding={40} justifyContent="center" alignItems="center"><StyledCycle height={72} width={72} borderColor="#e0e7ff" backgroundColor="#eef2ff"><Icon name="payments" size={31} color={INDIGO} /></StyledCycle><StyledText marginTop={16} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>No service rates yet</StyledText><StyledText marginTop={6} textAlign="center" color={theme.colors.gray[500]}>Add your rates so integrators understand your pricing.</StyledText><Pressable onPress={() => navigation.navigate('service-rate-form')} style={{marginTop: 20, paddingHorizontal: 20, height: 46, borderRadius: 13, backgroundColor: INDIGO, justifyContent: 'center'}}><StyledText color="#fff" fontWeight={theme.fontWeight.bold}>Add first rate</StyledText></Pressable></YStack> : null} />
      {loading && <StyledSpinner />}
      {error && <StyledOkDialog title="Unable to load service rates" description={typeof error === 'string' ? error : error?.message || 'Please try again.'} visible onOk={handleReset} />}
    </StyledSafeAreaView>
  );
};

export default ServiceRate;
