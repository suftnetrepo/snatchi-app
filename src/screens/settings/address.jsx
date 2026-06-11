import React, {useState, useEffect} from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledButton,
  StyledText,
  StyledSpinner,
  StyledOkDialog,
} from 'fluent-styles';
import {View, Text, StyleSheet, TextInput, Platform} from 'react-native';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {useNavigation, CommonActions} from '@react-navigation/native';
import AddressSearchBar from '../../components/addressSearchBar';
import {validate} from '../../validator';
import {addressValidator} from '../../validator/addressValidator';
import {useUser} from '../../hooks/useUser';
import {useAppContext} from '../../hooks/appContext';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const ProfileAddress = () => {
  const navigator = useNavigation();
  const {user, updateCurrentUser} = useAppContext();
  const [validationError, setValidationError] = useState({});
  const [fields, setFields] = useState(addressValidator.fields);
  const {updateStoreAddress, loading, error, handleReset} = useUser();

  console.log('User in ProfileAddress:', user); // Debugging log

  useEffect(() => {
    if (user) {
      setFields(pre => {
        return {
          ...pre,
          ...(user && {...user.address}),
        };
      });
    }
  }, [user]);

  const handleSelectedAddress = selectedAddress => {
    console.log('Selected Address:', selectedAddress);
    setFields(prev => {
      return {
        ...prev,
        addressLine1:
          selectedAddress?.address?.country_code === 'gb' ||
          selectedAddress?.address?.country_code === 'us'
            ? selectedAddress?.address?.suburb
            : selectedAddress?.address?.place,
        county:
          selectedAddress?.address?.county || selectedAddress?.address?.city,
        town:
          selectedAddress?.address?.state_district ||
          selectedAddress?.address?.state,
        postcode:
          selectedAddress?.address?.country_code === 'gb' ||
          selectedAddress?.address?.country_code === 'us'
            ? selectedAddress?.address?.postcode
            : '',
        country_code: selectedAddress?.address?.country_code,
        country: selectedAddress?.address?.country,
        longitude: parseFloat(selectedAddress?.lon),
        latitude: parseFloat(selectedAddress?.lat),
      };
    });
  };

  const onSubmit = async () => {
    const {hasError, errors} = validate(fields, addressValidator.rules);
    if (hasError) {
      setValidationError(errors);
      return;
    }

    updateStoreAddress(fields, user?.user_id).then(result => {
      if (result) {
        const copyUser = {
          ...user,
          address: fields,
        };
        updateCurrentUser(copyUser);
        navigator.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'bottom-tabs', params: {screen: 'Settings'}}],
          }),
        );
      }
    });
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Header
          backgroundColor={theme.colors.gray[1]}
          onPress={() => navigator.goBack()}
          title="Edit Address"
          icon
          cycleProps={{
            borderColor: theme.colors.gray[400],
            marginRight: 8,
          }}
        />
      </StyledHeader>

      <XStack
        paddingHorizontal={16}
        justifyContent="flex-start"
        alignItems="center"
        backgroundColor={theme.colors.gray[50]}>
        <AddressSearchBar
          placeholder="Search for address"
          handleSelectedAddress={j => handleSelectedAddress(j)}
        />
      </XStack>
      <StyledSpacer marginVertical={8} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <View style={{...styles.inputContainer}}>
          <View style={styles.flexContainer}>
            <Text style={styles.label}>Street address</Text>
            <View style={{...styles.input}}>
              <TextInput
                value={fields.addressLine1}
                placeholder="Street address"
                placeholderTextColor={styles.placeholder}
                maxLength={50}
                autoCapitalize={'none'}
                autoCorrect={false}
                returnKeyType="next"
                onChangeText={value =>
                  setFields({...fields, addressLine1: value})
                }
                style={{...styles.inputText}}></TextInput>
            </View>
            {validationError.addressLine1 && (
              <ValidationMessage
                message={validationError.addressLine1.message}
              />
            )}
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.label}>Town</Text>
            <View style={{...styles.input}}>
              <TextInput
                value={fields.town}
                placeholder="Town"
                placeholderTextColor={styles.placeholder}
                maxLength={50}
                autoCapitalize={'none'}
                autoCorrect={false}
                returnKeyType="next"
                onChangeText={value => setFields({...fields, town: value})}
                style={{...styles.inputText}}></TextInput>
            </View>
            {validationError.town && (
              <ValidationMessage message={validationError.town.message} />
            )}
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.label}>County</Text>
            <View style={[styles.input]}>
              <TextInput
                value={fields.county}
                placeholder="County"
                placeholderTextColor={styles.placeholder}
                maxLength={50}
                autoCapitalize={'none'}
                autoCorrect={false}
                returnKeyType="next"
                onChangeText={value => setFields({...fields, county: value})}
                style={{...styles.inputText}}></TextInput>
            </View>
            {validationError.county && (
              <ValidationMessage message={validationError.county.message} />
            )}
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.flexContainer}>
              <Text style={styles.label}>Postcode</Text>
              <View style={[styles.input]}>
                <TextInput
                  value={fields.postcode}
                  placeholder="PostCode"
                  maxLength={25}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  returnKeyType="done"
                  onChangeText={value =>
                    setFields({...fields, postcode: value})
                  }
                  style={{...styles.inputText}}></TextInput>
              </View>
              {validationError.postcode && (
                <ValidationMessage message={validationError.postcode.message} />
              )}
            </View>
            <View style={{marginHorizontal: 4}}></View>
            <View style={styles.flexContainer}>
              <Text style={styles.label}>Country</Text>
              <View style={[styles.input]}>
                <TextInput
                  value={fields.country}
                  placeholder="Country"
                  maxLength={25}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  returnKeyType="done"
                  onChangeText={value => setFields({...fields, country: value})}
                  style={{...styles.inputText}}></TextInput>
              </View>
              {validationError?.country && (
                <ValidationMessage message={validationError?.country.message} />
              )}
            </View>
          </View>
          <StyledSpacer marginVertical={8} />
          <View style={{...styles.columnContainer}}>
            <StyledButton
              width="100%"
              backgroundColor={theme.colors.cyan[500]}
              onPress={() => onSubmit()}>
              <StyledText
                paddingHorizontal={20}
                paddingVertical={10}
                color={theme.colors.gray[1]}>
                Save Changes
              </StyledText>
            </StyledButton>
          </View>
        </View>
      </KeyboardAwareScrollView>
      {loading && <StyledSpinner />}
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
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.large,
    fontFamily: fontStyles.crimson_text_regular,
    color: theme.colors.gray[800],
    marginLeft: 16,
  },
  flexContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: theme.colors.gray[100],
    flex: 1,
    position: 'relative',
  },
  continue: {
    backgroundColor: theme.colors.cyan[500],
    borderColor: theme.colors.cyan[500],
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '90%',
  },
  continueContainer: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
  },
  columnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.gray[1],
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.fontSize.medium,
    paddingVertical: 8,
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    borderColor: theme.colors.gray[500],
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'column',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  rowContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginHorizontal: 16,
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: theme.colors.gray[500],
    backgroundColor: theme.colors.gray[1],
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    marginVertical: 5,
    height: Platform.OS === 'ios' ? 40 : null,
  },
  inputText: {
    flex: 1,
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray[900],
    backgroundColor: theme.colors.gray[1],
  },
  placeholder: {
    color: theme.colors.gray[600],
  },
  button: {
    width: '98%',
    backgroundColor: theme.colors.green[1000],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: theme.fontSize.normal,
    fontFamily: fontStyles.crimson_text_regular,
    color: theme.colors.gray[100],
    fontWeight: 'bold',
  },
});

export default ProfileAddress;
