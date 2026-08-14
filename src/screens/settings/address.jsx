import React, {useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {
  XStack, YStack, StyledCycle, StyledHeader, StyledSafeAreaView,
  StyledText, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import AddressSearchBar from '../../components/addressSearchBar';
import {validate} from '../../validator';
import {addressValidator} from '../../validator/addressValidator';
import {useUser} from '../../hooks/useUser';
import {useAppContext} from '../../hooks/appContext';
import {fontStyles, theme} from '../../utils/theme';

const INDIGO = '#4f46e5';

const Field = ({label, error, ...props}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} style={[styles.input, error && styles.inputError]} placeholderTextColor={theme.colors.gray[400]} />
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const ProfileAddress = () => {
  const navigation = useNavigation();
  const {user, updateCurrentUser} = useAppContext();
  const [validationError, setValidationError] = useState({});
  const [fields, setFields] = useState({...addressValidator.fields});
  const [saved, setSaved] = useState(false);
  const {updateStoreAddress, loading, error, handleReset} = useUser();

  useEffect(() => {
    if (user?.address) {
      setFields(previous => ({...previous, ...user.address}));
    }
  }, [user]);

  const change = (name, value) => {
    setFields(previous => ({...previous, [name]: value}));
    setValidationError(previous => ({...previous, [name]: undefined}));
  };

  const handleSelectedAddress = selected => {
    const address = selected?.address || {};
    setFields(previous => ({
      ...previous,
      addressLine1: address.road || address.suburb || address.place || selected?.display_name?.split(',')?.[0] || '',
      town: address.city || address.town || address.state_district || address.state || '',
      county: address.county || '',
      postcode: address.postcode || '',
      country_code: address.country_code || '',
      country: address.country || '',
      longitude: Number(selected?.lon) || 0,
      latitude: Number(selected?.lat) || 0,
    }));
    setValidationError({});
  };

  const submit = async () => {
    setValidationError({});
    const {hasError, errors} = validate(fields, addressValidator.rules);
    if (hasError) {
      setValidationError(errors);
      return;
    }
    const result = await updateStoreAddress(fields, user?.user_id);
    if (result) {
      updateCurrentUser({...user, address: fields});
      setSaved(true);
    }
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" borderBottomWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <StyledCycle height={42} width={42} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}><Icon name="arrow-back" size={24} color={theme.colors.gray[900]} /></StyledCycle>
            </Pressable>
            <YStack flex={1} marginLeft={13}><StyledText fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Address</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Your primary work location</StyledText></YStack>
          </XStack>
        </StyledHeader.Full>
      </StyledHeader>

      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" enableOnAndroid bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <YStack padding={16} borderRadius={18} backgroundColor="#eef2ff">
          <XStack alignItems="center"><StyledCycle height={42} width={42} borderColor="#c7d2fe" backgroundColor="#e0e7ff"><Icon name="travel-explore" size={22} color={INDIGO} /></StyledCycle><YStack flex={1} marginLeft={12}><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Find your address</StyledText><StyledText marginTop={2} fontSize={theme.fontSize.small} color={theme.colors.gray[600]}>Search first, then check the details below.</StyledText></YStack></XStack>
          <View style={styles.search}><AddressSearchBar placeholder="Search by postcode or street" handleSelectedAddress={handleSelectedAddress} /></View>
        </YStack>

        <Text style={styles.section}>ADDRESS DETAILS</Text>
        <Field label="Street address" value={fields.addressLine1} onChangeText={value => change('addressLine1', value)} placeholder="Street and building" autoCapitalize="words" returnKeyType="next" error={validationError.addressLine1?.message} />
        <Field label="Town or city" value={fields.town} onChangeText={value => change('town', value)} placeholder="Town or city" autoCapitalize="words" returnKeyType="next" error={validationError.town?.message} />
        <Field label="County" value={fields.county} onChangeText={value => change('county', value)} placeholder="County (optional)" autoCapitalize="words" returnKeyType="next" error={validationError.county?.message} />
        <XStack gap={10}>
          <View style={styles.half}><Field label="Postcode" value={fields.postcode} onChangeText={value => change('postcode', value)} placeholder="Postcode" autoCapitalize="characters" returnKeyType="next" error={validationError.postcode?.message} /></View>
          <View style={styles.half}><Field label="Country" value={fields.country} onChangeText={value => change('country', value)} placeholder="Country" autoCapitalize="words" returnKeyType="done" error={validationError.country?.message} /></View>
        </XStack>

        <Pressable onPress={submit} disabled={loading} style={({pressed}) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}>
          <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Save address'}</Text>
        </Pressable>
      </KeyboardAwareScrollView>

      {loading && <StyledSpinner />}
      {saved && <StyledOkDialog title="Address updated" description="Your primary address has been saved." visible onOk={() => {setSaved(false); navigation.goBack();}} />}
      {error && <StyledOkDialog title="Unable to save address" description={typeof error === 'string' ? error : error?.message || 'Please try again.'} visible onOk={handleReset} />}
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16, paddingBottom: 48},
  search: {marginTop: 14},
  section: {marginTop: 24, marginBottom: 12, fontFamily: fontStyles.Roboto_Regular, fontWeight: '700', fontSize: 12, color: theme.colors.gray[500], letterSpacing: 0.8},
  field: {marginBottom: 14},
  half: {flex: 1},
  label: {marginBottom: 7, fontFamily: fontStyles.Roboto_Regular, fontSize: 14, fontWeight: '600', color: theme.colors.gray[800]},
  input: {height: 52, paddingHorizontal: 15, borderWidth: 1, borderColor: theme.colors.gray[300], borderRadius: 12, backgroundColor: theme.colors.gray[1], fontFamily: fontStyles.Roboto_Regular, fontSize: 16, color: theme.colors.gray[900]},
  inputError: {borderColor: theme.colors.red[500]},
  error: {marginTop: 5, fontSize: 12, color: theme.colors.red[600]},
  button: {height: 52, marginTop: 12, borderRadius: 14, backgroundColor: INDIGO, alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.88}, disabled: {opacity: 0.55},
  buttonText: {fontSize: 16, fontWeight: '700', color: '#fff'},
});

export default ProfileAddress;
