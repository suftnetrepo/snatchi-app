import React, {useState, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledText,
  StyledCycle,
  StyledSpacer,
  StyledCard,
  StyledSeparator,
  StyledInput,
  StyledMultiInput,
  StyledOkDialog,
  StyledCheckBox,
  StyledButton,
  validate,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {StyledMIcon} from '../../components/icon';
import DatePicker from 'react-native-date-picker';
import uuid from 'react-native-uuid';
import {formatCurrency, dateConverter} from '../../utils/help';
import {useInvoice} from '../../hooks/useInvoice';
import {ScrollView} from 'react-native';
import {itemValidator, invoiceValidator} from '../../validator/invoiceValidator';

const Invoice = () => {
  const navigator = useNavigation();
  const route = useRoute();
  const {
    fields,
    onChange,
    handleAddItem,
    handleDeleteItem,
    handleEditItem,
    handleAddInvoice,
    handleReset,
    success,
    handleEditInvoice,
  } = useInvoice();
  const [selectedIssueDate, setSelectedIssueDate] = useState(new Date());
  const [selecteDate, setSelectedDate] = useState(new Date());
  const [openIssueDate, setOpenIssueDate] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openPanel, setPanel] = useState(false);
  const [itemFields, setItemFields] = useState(itemValidator.fields);
  const [errorMessages, setErrorMessages] = useState({});
  const [errorMainMessages, setErrorMainMessages] = useState({});
  const params = route.params;

  useEffect(() => {
    params?.invoice && handleEditItem(params?.invoice);
  }, [params?.invoice]);

  const handleChange = (name, value) => {
    setItemFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onDeleteItem = id => {
    handleDeleteItem(id);
  };

  const calculateSubtotal = () => {
    const result = fields.items.reduce(
      (total, item) => total + item.hour * item.rate,
      0,
    );
    return result;
  };

  const calculateTax = () => {
    const result = calculateSubtotal() * 0.1;
    return result;
  };

  const calculateTotal = () => {
    const result = calculateSubtotal() + calculateTax();
    return result;
  };

  const handleSubmit = async () => {
    setErrorMessages({});
    const {hasError, errors} = validate(itemFields, itemValidator.rules);
    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    const newItem = {
      _id: uuid.v4(),
      ...itemFields,
    };

    handleAddItem(newItem);

    setItemFields(pre => {
      return {
        ...pre,
        ...itemValidator.reset(),
      };
    });
  };

  const onSubmit = () => {
    setErrorMainMessages({});
    const {hasError, errors} = validate(fields, invoiceValidator.rules);
  
    if (hasError) {
      setErrorMainMessages(errors);
      return false;
    }

    fields.totalAmount = calculateTotal();
    fields.subtotal = calculateSubtotal();
    fields.tax = calculateTax();
    fields.due_on = new Date();
    fields.items = fields.items.map(item => {
      return {
        hour: item.hour,
        rate: item.rate,
        date: item.date,
        description: item.description,
      };
    });

    if (params?.invoice) {
      handleEditInvoice(fields, params?.invoice?._id).then(result => {
        result &&
          navigator.reset({
            index: 0,
            routes: [{name: 'bottom-tabs', params: {screen: 'invoice'}}],
          });
      });
    } else {
      handleAddInvoice(fields).then(result => {});
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
          onPress: () =>
            navigator.reset({
              index: 0,
              routes: [{name: 'bottom-tabs', params: {screen: 'invoice'}}],
            }),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.gray[200]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.medium}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        {params?.invoice
          ? `Invoice - ${params?.invoice?._id?.toString().slice(-8) || ''}`
          : 'New Invoice'}
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledCycle
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon
          name="done"
          size={25}
          color={theme.colors.gray[1]}
          onPress={() => onSubmit()}
        />
      </StyledCycle>
    </XStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[200]}>
      <StyledHeader skipAndroid={true} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack
          flex={1}
          borderRadius={16}
          marginTop={8}
          paddingHorizontal={16}
          paddingVertical={16}
          marginHorizontal={8}
          backgroundColor={theme.colors.gray[1]}>
          <StyledInput
            label={'Description'}
            labelProps={{
              fontSize: theme.fontSize.small,
            }}
            keyboardType="default"
            placeholder="Enter short description about invoice"
            returnKeyType="next"
            maxLength={100}
            fontSize={theme.fontSize.small}
            borderColor={theme.colors.gray[400]}
            backgroundColor={theme.colors.gray[1]}
            borderRadius={8}
            paddingHorizontal={16}
            value={fields.invoice_description}
            placeholderTextColor={theme.colors.gray[400]}
            height={40}Shell
            onChangeText={value => onChange('invoice_description', value)}
            error={errorMainMessages?.invoice_description ? true : false}
          />
          <StyledText
            paddingHorizontal={6}
            marginTop={4}
            marginBottom={4}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.small}
            textAlign="left"
            readOnly
            color={theme.colors.gray[700]}>
            Issue Date
          </StyledText>
          <XStack justifyContent="flex-start" alignItems="center">
            <StyledInput
              fontSize={theme.fontSize.small}
              borderColor={theme.colors.gray[400]}
              backgroundColor={theme.colors.gray[1]}
              borderRadius={8}
              height={40}
              value={dateConverter(fields?.issueDate?.toISOString())}
              flex={1}
            />
            <StyledMIcon
              size={44}
              name="date-range"
              color={theme.colors.gray[800]}
              onPress={() => {
                setOpenIssueDate(true);
              }}
            />
          </XStack>
          <XStack
            justifyContent="flex-start"
            alignItems="center"
            borderRadius={8}
            marginTop={4}
            paddingHorizontal={8}
            paddingVertical={8}
            borderColor={theme.colors.gray[400]}
            borderWidth={1}>
            <StyledMIcon size={24} name="add" color={theme.colors.gray[600]} />
            <StyledText
              paddingHorizontal={2}
              fontWeight={theme.fontWeight.normal}
              fontSize={theme.fontSize.small}
              color={theme.colors.gray[800]}>
              Add Item
            </StyledText>
            <StyledSpacer flex={1} />
            <StyledMIcon
              size={24}
              name={openPanel ? 'arrow-drop-down' : 'arrow-drop-up'}
              color={theme.colors.gray[600]}
              pointerEvents="box-none"
              onPress={() => setPanel(!openPanel)}
            />
          </XStack>
          {openPanel && (
            <YStack
              marginTop={8}
              backgroundColor={theme.colors.gray[100]}
              borderRadius={16}
              paddingHorizontal={16}
              paddingVertical={16}>
              <StyledInput
                label={'Item'}
                labelProps={{
                  fontSize: theme.fontSize.small,
                }}
                keyboardType="default"
                placeholder=""
                returnKeyType="next"
                maxLength={200}
                fontSize={theme.fontSize.small}
                borderColor={theme.colors.gray[400]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={8}
                paddingHorizontal={8}
                value={itemFields.description}
                placeholderTextColor={theme.colors.gray[300]}
                onChangeText={value => handleChange('description', value)}
                error={!!errorMessages?.description}
              />
              <YStack>
                <StyledText
                  paddingHorizontal={8}
                  marginTop={8}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  textAlign="left"
                  readOnly
                  color={theme.colors.gray[800]}>
                  Date
                </StyledText>
                <XStack justifyContent="flex-start" alignItems="center">
                  <StyledInput
                    fontSize={theme.fontSize.micro}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    value={itemFields?.date}
                    error={!!errorMessages?.date}
                    flex={1}
                    readOnly
                  />
                  <StyledMIcon
                    size={44}
                    name="date-range"
                    color={theme.colors.gray[800]}
                    onPress={() => {
                      setOpenDate(true);
                    }}
                  />
                </XStack>
              </YStack>
              <XStack justifyContent="flex-start" alignItems="center">
                <YStack flex={1}>
                  <StyledText
                    paddingHorizontal={8}
                    marginBottom={4}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    textAlign="left"
                    readOnly
                    color={theme.colors.gray[800]}>
                    Hour
                  </StyledText>
                  <StyledInput
                    keyboardType="default"
                    placeholder=""
                    returnKeyType="next"
                    maxLength={9}
                    fontSize={theme.fontSize.small}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={8}
                    marginHorizontal={1}
                    placeholderTextColor={theme.colors.gray[300]}
                    value={itemFields.hour}
                    onChangeText={value =>
                      value && handleChange('hour', parseFloat(value))
                    }
                    error={!!errorMessages?.rate}
                  />
                </YStack>
                <YStack flex={1} marginLeft={8}>
                  <StyledText
                    paddingHorizontal={8}
                    marginBottom={4}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    textAlign="left"
                    readOnly
                    color={theme.colors.gray[800]}>
                    Rate
                  </StyledText>
                  <StyledInput
                    keyboardType="default"
                    placeholder=""
                    returnKeyType="next"
                    maxLength={6}
                    fontSize={theme.fontSize.small}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={8}
                    marginHorizontal={1}
                    placeholderTextColor={theme.colors.gray[300]}
                    value={itemFields.rate}
                    onChangeText={value =>
                      value && handleChange('rate', parseFloat(value))
                    }
                    error={!!errorMessages?.rate}
                  />
                </YStack>
              </XStack>
              <XStack marginTop={8}>
                <StyledButton
                  flex={2}
                  borderRadius={32}
                  borderColor={theme.colors.cyan[500]}
                  backgroundColor={theme.colors.cyan[500]}
                  onPress={() => handleSubmit()}>
                  <StyledText
                    paddingHorizontal={20}
                    paddingVertical={10}
                    color={theme.colors.gray[1]}>
                    Save Changes
                  </StyledText>
                </StyledButton>
                <StyledSpacer marginLeft={8} />
                <StyledButton
                  flex={1}
                  borderColor={theme.colors.gray[400]}
                  backgroundColor={theme.colors.gray[400]}
                  onPress={() => {
                    setItemFields(itemValidator.reset());
                    setPanel(false);
                  }}>
                  <StyledText
                    paddingHorizontal={20}
                    paddingVertical={10}
                    color={theme.colors.gray[1]}>
                    Close
                  </StyledText>
                </StyledButton>
              </XStack>
            </YStack>
          )}

          <StyledCard
            borderTopLeftRadius={16}
            borderTopRightRadius={16}
            borderColor={theme.colors.gray[100]}
            backgroundColor={theme.colors.gray[1]}
            borderWidth={1}
            marginTop={8}
            marginBottom={8}>
            <XStack
              borderTopLeftRadius={8}
              borderTopRightRadius={8}
              backgroundColor={theme.colors.gray[100]}
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
              paddingHorizontal={8}>
              <StyledText
                flex={3}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[800]}>
                Date
              </StyledText>
              <StyledText
                flex={3}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[800]}>
                Item
              </StyledText>
              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                textAlign="left"
                color={theme.colors.gray[800]}>
                Hour
              </StyledText>
              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                textAlign="left"
                color={theme.colors.gray[800]}>
                Rate
              </StyledText>
              <StyledSpacer marginRight={32} />
            </XStack>
            <StyledSpacer marginVertical={1} />
            {fields?.items.map((item, index) => {
              return (
                <XStack
                  key={item._id}
                  backgroundColor={theme.colors.gray[1]}
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical={8}
                  paddingHorizontal={8}>
                  <StyledInput
                    flex={2}
                    keyboardType="default"
                    placeholder=""
                    returnKeyType="next"
                    maxLength={10}
                    fontSize={theme.fontSize.nano}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={8}
                    marginHorizontal={1}
                    value={item.date}
                    placeholderTextColor={theme.colors.gray[300]}
                    readOnly
                  />
                  <StyledInput
                    flex={2}
                    keyboardType="default"
                    placeholder=""
                    returnKeyType="next"
                    maxLength={100}
                    fontSize={theme.fontSize.nano}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={8}
                    marginHorizontal={1}
                    value={item.description}
                    placeholderTextColor={theme.colors.gray[300]}
                    readOnly
                  />
                  <StyledInput
                    flex={1}
                    keyboardType="numeric"
                    placeholder=""
                    returnKeyType="next"
                    inputMode="numeric"
                    maxLength={50}
                    fontSize={theme.fontSize.nano}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={8}
                    marginHorizontal={1}
                    value={item.hour ? item.hour.toFixed() : ''}
                    placeholderTextColor={theme.colors.gray[300]}
                    readOnly
                  />
                  <StyledInput
                    flex={1}
                    keyboardType="numeric"
                    placeholder=""
                    returnKeyType="next"
                    maxLength={50}
                    fontSize={theme.fontSize.nano}
                    borderColor={theme.colors.gray[400]}
                    backgroundColor={theme.colors.gray[1]}
                    borderRadius={8}
                    paddingHorizontal={2}
                    marginHorizontal={1}
                    value={item.rate ? item.rate.toFixed() : ''}
                    placeholderTextColor={theme.colors.gray[300]}
                    readOnly
                  />
                  <StyledSpacer marginLeft={4} />
                  <Icon
                    name="cancel"
                    size={32}
                    color={theme.colors.cyan[500]}
                    onPress={() => {
                      onDeleteItem(item._id);
                    }}
                  />
                </XStack>
              );
            })}

            <StyledSeparator
              line
              lineProps={{
                borderTopColor: theme.colors.gray[100],
              }}
            />
            <XStack
              backgroundColor={theme.colors.gray[1]}
              justifyContent="space-between"
              alignItems="center"
              paddingTop={8}>
              <StyledText
                flex={3}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[1]}></StyledText>

              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.semiBold}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                Subtotal
              </StyledText>
              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                {formatCurrency('£', calculateSubtotal() || 0)}
              </StyledText>
            </XStack>
            <StyledSeparator
              line
              lineProps={{
                borderTopColor: theme.colors.gray[100],
                paddingTop: 4,
              }}
            />
            <XStack
              backgroundColor={theme.colors.gray[1]}
              justifyContent="space-between"
              alignItems="center">
              <StyledText
                flex={3}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[1]}></StyledText>

              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.semiBold}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                Tax
              </StyledText>
              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                {formatCurrency('£', calculateTax() || 0)}
              </StyledText>
            </XStack>
            <StyledSeparator
              line
              lineProps={{
                borderTopColor: theme.colors.gray[100],
                paddingTop: 4,
              }}
            />
            <XStack
              backgroundColor={theme.colors.gray[1]}
              justifyContent="space-between"
              alignItems="center"
              paddingBottom={8}>
              <StyledText
                flex={3}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[1]}></StyledText>

              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.bold}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                Total
              </StyledText>
              <StyledText
                flex={2}
                paddingHorizontal={8}
                fontWeight={theme.fontWeight.bold}
                fontSize={theme.fontSize.small}
                textAlign="right"
                color={theme.colors.gray[900]}>
                {formatCurrency('£', calculateTotal() || 0)}
              </StyledText>
            </XStack>
          </StyledCard>
          <StyledMultiInput
            label={'Note (optional)'}
            labelProps={{
              fontSize: theme.fontSize.small,
            }}
            keyboardType="default"
            placeholder="Enter note"
            returnKeyType="done"
            maxLength={100}
            fontSize={theme.fontSize.small}
            borderColor={theme.colors.gray[400]}
            backgroundColor={theme.colors.gray[1]}
            borderRadius={8}
            paddingHorizontal={16}
            value={fields.notes}
            placeholderTextColor={theme.colors.gray[400]}
            height={60}
            onChangeText={text => onChange('notes', text)}
          />
          <XStack
            backgroundColor={theme.colors.gray[1]}
            justifyContent="flex-start"
            marginVertical={8}
            paddingHorizontal={4}
            alignItems="center">
            <StyledCheckBox
              checked={fields.invoice_type}
              checkedColor={theme.colors.cyan[500]}
              borderColor={theme.colors.gray[400]}
              onPress={value => onChange('invoice_type', value)}
            />
            <StyledText
              paddingHorizontal={8}
              fontWeight={theme.fontWeight.normal}
              fontSize={theme.fontSize.small}
              color={theme.colors.gray[600]}>
              Quote
            </StyledText>
          </XStack>
          <DatePicker
            modal
            open={openIssueDate}
            date={selectedIssueDate}
            mode="datetime"
            onConfirm={selectedDate => {
              setOpenIssueDate(false);
              setSelectedIssueDate(selectedDate);
              onChange('issueDate', selectedDate);
            }}
            onCancel={() => setOpenIssueDate(false)}
          />
          <DatePicker
            modal
            open={openDate}
            date={selecteDate}
            mode="datetime"
            onConfirm={selectedDate => {
              setOpenDate(false);
              setSelectedDate(selectedDate);
              handleChange('date', dateConverter(selectedDate.toISOString()));
            }}
            onCancel={() => setOpenDate(false)}
          />
        </YStack>
      </ScrollView>

      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Invoice was save successfully"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
    </StyledSafeAreaView>
  );
};

export default Invoice;
