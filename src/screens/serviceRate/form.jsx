import React, {useState, useEffect} from 'react';
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
  StyledMultiInput
} from 'fluent-styles';
import {Dropdown} from '../../components/dropdown/dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useServiceRate} from '../../hooks/useServiceRate';
import {fontStyles, theme} from '../../utils/theme';
import {validate} from '../../validator';
import {useAppContext} from '../../hooks/appContext';
import {ServiceOptions} from '../../constants';

const RateForm = () => {
  const INDIGO = '#4f46e5';
  const navigation = useNavigation();
  const {user} = useAppContext();
  const [errorMessages, setErrorMessages] = useState({});
  const [value, setValue] = useState();
  const {
    success,
    error,
    loading,
    rules,
    fields,
    handleChange,
    handleAddRate,
    handleEditRate,
    handleReset,
    handleEditItem,
  } = useServiceRate(false);
  const route = useRoute();
  const params = route?.params;

   useEffect(() => {
      params?.rate && handleEditItem(params?.rate);
      // Populate the form only when a different rate is opened.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.rate]);

  const handleSubmit = async () => {
    setErrorMessages({});
    const {hasError, errors} = validate(fields, rules);

    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    if (fields?._id) {
      const updated = await handleEditRate(fields, fields?._id);
      if (updated) {
        navigation.reset({
          index: 0,
          routes: [{name: 'service-rate'}],
        });
      }
    } else {
      await handleAddRate(fields);
    }
  };

  const clearState = () => {
    setValue(null);
    setErrorMessages({});
    handleReset();
  };
  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[1]}
      borderBottomWidth={1}
      borderColor={theme.colors.gray[200]}>
      <Pressable onPress={() => {
        clearState();
        navigation.reset({
          index: 0,
          routes: [{name: 'service-rate'}],
        });
      }}>
        <StyledCycle
          height={42}
          width={42}
          borderColor={theme.colors.gray[200]}>
          <Icon name="arrow-back" size={24} color={theme.colors.gray[900]} />
        </StyledCycle>
      </Pressable>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.bold}
        color={theme.colors.gray[900]}
        fontSize={theme.fontSize.large}>
            {fields?._id ? 'Edit Service Rate' : 'Create Service Rate'}
        </StyledText>
        <StyledSpacer flex={1} />
        <StyledSpacer marginHorizontal={8} />
      </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <StyledHeader
          skipAndroid={Platform.OS === 'android' ? false : true}
          marginHorizontal={8}
          statusProps={{translucent: true}}>
          <StyledHeader.Full>
            <RenderHeader />
          </StyledHeader.Full>
        </StyledHeader>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
          <YStack
            flex={1}
            paddingHorizontal={16}
            justifyContent="flex-start"
            alignItems="center"
            backgroundColor={theme.colors.gray[1]}>
            <YStack width="100%" marginTop={16} marginBottom={18} padding={16} borderRadius={16} backgroundColor="#eef2ff">
              <XStack alignItems="center"><StyledCycle height={42} width={42} borderColor="#c7d2fe" backgroundColor="#e0e7ff"><Icon name="payments" size={22} color={INDIGO} /></StyledCycle><YStack flex={1} marginLeft={12}><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Set clear pricing</StyledText><StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[600]}>This rate can be used when preparing quotes and invoices.</StyledText></YStack></XStack>
            </YStack>
            <Dropdown
              borderRadius={12}
              borderColor={theme.colors.gray[300]}
              data={ServiceOptions.map(option => ({
                label: option.label,
                value: option.label,
              }))}
              fontSize={theme.fontSize.normal}
              backgroundColor={theme.colors.gray[1]}
              placeholderTextColor={theme.colors.gray[300]}
              value={fields.serviceName}
              onChange={item => { handleChange('serviceName', item.value)}}
              placeholder={'Select service type'}
              ></Dropdown>
            <StyledSpacer marginVertical={4} />
            <StyledInput
              label={'Name'}
              labelProps={{
                fontSize: theme.fontSize.small,
              }}
              keyboardType="default"
              placeholder="Enter name"
              returnKeyType="next"
              maxLength={50}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[300]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={12}
              height={52}
              textAlignVertical="center"
              paddingHorizontal={16}
              value={fields.serviceName}
              placeholderTextColor={theme.colors.gray[300]}
              onChangeText={text => handleChange('serviceName', text)}
              error={!!errorMessages?.serviceName}
              errorMessage={errorMessages?.serviceName?.message}
            />
            <StyledSpacer marginVertical={4} /> 
             <Dropdown
              label="Rate Type"
              borderRadius={12}
              borderColor={theme.colors.gray[300]}
              data={["hourly", "daily", "fixed"].map(option => ({
                label: option,
                value: option,
              }))}
              fontSize={theme.fontSize.normal}
              backgroundColor={theme.colors.gray[1]}
              placeholderTextColor={theme.colors.gray[300]}
              value={fields.rateType}
              onChange={item => { handleChange('rateType', item.value)}}
              placeholder={'Select rate type'}
               error={!!errorMessages?.rate}
              errorMessage={errorMessages?.rate?.message}
              ></Dropdown>
                    <StyledSpacer marginVertical={4} />
            <StyledInput
              label={'Rate'}
              labelProps={{
                fontSize: theme.fontSize.small,
              }}
              keyboardType="decimal-pad"
              placeholder="Enter rate "
              returnKeyType="done"
              maxLength={50}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[300]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={12}
              marginTop={8}
              height={52}
              textAlignVertical="center"
              paddingHorizontal={16}
              value={fields.rate}
              placeholderTextColor={theme.colors.gray[300]}
              onChangeText={text => handleChange('rate', text)}
              error={!!errorMessages?.rate}
              errorMessage={errorMessages?.rate?.message}
            />
            <StyledMultiInput
              label={'Description'}
              labelProps={{
                fontSize: theme.fontSize.small,
              }}
              keyboardType="default"
              placeholder="Enter short description"
              returnKeyType="next"
              maxLength={200}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[300]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={12}
              height={110}
              textAlignVertical="top"
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
                flex={2}
                backgroundColor={INDIGO}
                borderColor={INDIGO}
                borderRadius={14}
                disabled={loading}
                onPress={handleSubmit}>
                <StyledText
                  paddingHorizontal={20}
                  paddingVertical={10}
                  color={ theme.colors.gray[1]}>
                  {loading ? 'Saving…' : fields?._id ? 'Save rate' : 'Add service rate'}
                </StyledText>
              </StyledButton>
            </XStack>
          </YStack>
        </ScrollView>

        {error && (
          <StyledOkDialog
            title="Unable to save service rate"
            description={typeof error === 'string' ? error : error?.message || 'Please try again.'}
            visible={!!error}
            onOk={() => {
              clearState();
            }}
          />
        )}
        {success && (
          <StyledOkDialog
            title="Service rate added"
            description="Your new service rate is ready to use."
            visible={!!success}
            onOk={() => {
              clearState();
              navigation.reset({index: 0, routes: [{name: 'service-rate'}]});
            }}
          />
        )}
        {loading && <StyledSpinner />}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default RateForm;
