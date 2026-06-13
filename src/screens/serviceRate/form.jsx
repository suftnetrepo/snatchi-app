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
  StyledMultiInput
} from 'fluent-styles';
import {StyledDropdown} from '../../components/dropdown';
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
  } = useServiceRate(false);
  const route = useRoute();
  const params = route?.params;

  const handleSubmit = () => {
    setErrorMessages({});
    const {hasError, errors} = validate(fields, rules);

    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    if (params?.rateId) {
      handleEditRate(fields, params?.rateId).then(() => {
        navigation.canGoBack() && navigation.goBack();
      });
    } else {
      handleAddRate(fields).then(() => {
        navigation.canGoBack() && navigation.goBack();
      });
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
        Create Service Rate
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack
            flex={1}
            paddingVertical={8}
            paddingHorizontal={16}
            justifyContent="flex-start"
            alignItems="center"
            backgroundColor={theme.colors.gray[100]}>
            <StyledSpacer marginVertical={8} />
            <StyledDropdown
              borderRadius={8}
              borderColor={theme.colors.gray[400]}
              items={ServiceOptions.map(option => ({
                label: option.label,
                value: option.label,
              }))}
              fontSize={theme.fontSize.small}
              backgroundColor={theme.colors.gray[1]}
              placeholderTextColor={theme.colors.gray[300]}
              value={value}
              setValue={setValue}
              selectedValue={value}
              onChangeValue={value => {setValue(value); handleChange('serviceName', value)}}
              placeholder={'Select service type ...'}
              listMode="SCROLLVIEW"></StyledDropdown>
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
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              height={48}
              textAlignVertical="center"
              paddingHorizontal={16}
              value={fields.serviceName}
              placeholderTextColor={theme.colors.gray[300]}
              onChangeText={text => handleChange('serviceName', text)}
              error={!!errorMessages?.serviceName}
              errorMessage={errorMessages?.serviceName?.message}
            />
            <StyledSpacer marginVertical={4} /> 
            <StyledInput
              label={'Rate'}
              labelProps={{
                fontSize: theme.fontSize.small,
              }}
              keyboardType="decimal-pad"
              placeholder="Enter rate "
              returnKeyType="next"
              maxLength={50}
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              marginTop={8}
              height={48}
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
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              height={80}
              textAlignVertical="center"
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
                backgroundColor={
                 theme.colors.cyan[500]
                }
                borderColor={
                  theme.colors.cyan[500]
                }
                onPress={() => handleSubmit()}>
                <StyledText
                  paddingHorizontal={20}
                  paddingVertical={10}
                  color={ theme.colors.gray[1]}>
                  Submit
                </StyledText>
              </StyledButton>
            </XStack>
          </YStack>
        </ScrollView>

        {error && (
          <StyledOkDialog
            title={error?.message}
            description="please try again"
            visible={!!error}
            onOk={() => {
              clearState();
            }}
          />
        )}
        {success && (
          <StyledOkDialog
            title="Confirmation"
            description="Rate was successfully submitted"
            visible={!!success}
            onOk={() => {
              clearState();
            }}
          />
        )}
        {loading && <StyledSpinner />}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default RateForm;
