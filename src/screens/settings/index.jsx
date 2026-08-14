import React from 'react';
import {Platform, Pressable} from 'react-native';
import {
  XStack, YStack, StyledCycle, StyledHeader, StyledSafeAreaView,
  StyledScrollView, StyledSpacer, StyledText,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAppContext} from '../../hooks/appContext';
import {fontStyles, theme} from '../../utils/theme';

const INDIGO = '#4f46e5';

const Settings = () => {
  const navigation = useNavigation();
  const {user} = useAppContext();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your account';
  const location = [user?.address?.town, user?.address?.country].filter(Boolean).join(', ') || 'Add your business address';

  const rows = [
    {icon: 'person-outline', title: 'Edit profile', subtitle: 'Personal details, contact information and photo', screen: 'profile'},
    {icon: 'folder-open', title: 'My documents', subtitle: 'Upload and manage certificates and compliance records', screen: 'user-documents'},
    {icon: 'location-on', title: 'Address', subtitle: 'Set your primary work and billing location', screen: 'profile-address'},
    {icon: 'payments', title: 'Service rates', subtitle: 'Manage the rates used for quotes and invoices', screen: 'service-rate'},
    {icon: 'help-outline', title: 'Help centre', subtitle: 'Guides and answers for common workflows', screen: 'help-center'},
  ];

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" backgroundColor={theme.colors.gray[1]} borderBottomWidth={1} borderColor={theme.colors.gray[200]}>
            <Pressable onPress={() => navigation.navigate('Home')} hitSlop={12} accessibilityLabel="Back to home">
              <StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
                <Icon name="arrow-back" size={24} color={theme.colors.gray[900]} />
              </StyledCycle>
            </Pressable>
            <StyledSpacer marginHorizontal={7} />
            <StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Settings</StyledText>
          </XStack>
        </StyledHeader.Full>
      </StyledHeader>

      <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <YStack padding={16}>
          <XStack padding={18} borderRadius={18} backgroundColor="#eef2ff" alignItems="center">
            <StyledCycle height={58} width={58} borderColor="#c7d2fe" backgroundColor={INDIGO}>
              <StyledText color="#fff" fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large}>{displayName.charAt(0).toUpperCase()}</StyledText>
            </StyledCycle>
            <YStack flex={1} marginLeft={14}>
              <StyledText numberOfLines={1} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.medium} color={theme.colors.gray[900]}>{displayName}</StyledText>
              <StyledText numberOfLines={1} marginTop={4} fontSize={theme.fontSize.small} color={theme.colors.gray[600]}>{user?.email || location}</StyledText>
            </YStack>
            <Icon name="verified" size={22} color={INDIGO} />
          </XStack>

          <StyledText marginTop={26} marginBottom={10} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>ACCOUNT &amp; WORK</StyledText>
          <YStack borderRadius={18} borderWidth={1} borderColor={theme.colors.gray[200]} overflow="hidden" backgroundColor={theme.colors.gray[1]}>
            {rows.map((row, index) => (
              <Pressable key={row.title} onPress={() => navigation.navigate(row.screen)} accessibilityRole="button">
                <XStack minHeight={78} paddingHorizontal={16} alignItems="center" borderBottomWidth={index === rows.length - 1 ? 0 : 1} borderColor={theme.colors.gray[200]}>
                  <StyledCycle height={42} width={42} borderColor="#e0e7ff" backgroundColor="#eef2ff">
                    <Icon name={row.icon} size={22} color={INDIGO} />
                  </StyledCycle>
                  <YStack flex={1} marginLeft={13}>
                    <StyledText fontWeight={theme.fontWeight.semiBold} fontSize={theme.fontSize.normal} color={theme.colors.gray[900]}>{row.title}</StyledText>
                    <StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{row.subtitle}</StyledText>
                  </YStack>
                  <Icon name="chevron-right" size={25} color={theme.colors.gray[400]} />
                </XStack>
              </Pressable>
            ))}
          </YStack>
        </YStack>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default Settings;
