import React, {Fragment} from 'react';
import {useNavigation} from '@react-navigation/native';
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
  StyledBadge,
  StyledSpinner,
  StyledOkDialog,
} from 'fluent-styles';
import {FlatList, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import InvoiceProvider, {useInvoiceContext} from '../../hooks/invoiceContext';
import {StyledMIcon} from '../../components/icon';
import {
  formatCurrency,
  formatReadableDate,
  backgroundColorHelper,
  textColorHelper,
} from '../../utils/help';
import {useInvoice} from '../../hooks/useInvoice';
import {Swipeable} from 'react-native-gesture-handler';

const Invoices = () => {
  const navigator = useNavigation();
  const {data, loading, error, handleDelete} = useInvoice(true);

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
        borderColor={theme.colors.gray[200]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        My Invoices
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
          onPress={() => navigator.navigate('new-invoice')}
        />
      </StyledCycle>
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  const renderRightActions = id => {
    return (
      <Pressable onPress={async () => await handleDelete(id)}>
        <YStack height="100%" justifyContent="center" alignItems="center">
          <StyledCycle
            height={48}
            width={48}
            borderColor={theme.colors.pink[600]}
            backgroundColor={theme.colors.pink[600]}>
            <Icon name="delete" size={24} color={theme.colors.pink[100]} />
          </StyledCycle>
        </YStack>
      </Pressable>
    );
  };

  const Render = ({invoice}) => {
    const {selected, onValueChange} = useInvoiceContext();
    return (
      <Swipeable renderRightActions={() => renderRightActions(invoice._id)}>
        <YStack marginBottom={8}>
          <YStack
            borderRadius={8}
            borderWidth={1}
            borderColor={theme.colors.gray[100]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={8}
            paddingHorizontal={8}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack flex={1}>
                <YStack>
                  <StyledText
                    paddingHorizontal={8}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.normal}
                    color={theme.colors.gray[800]}>
                    {formatReadableDate(invoice.issueDate)}
                  </StyledText>
                  <XStack>
                    <StyledBadge
                      marginVertical={4}
                      marginHorizontal={6}
                      paddingHorizontal={8}
                      fontFamily={fontStyles.Roboto_Regular}
                      fontWeight={theme.fontWeight.medium}
                      fontSize={theme.fontSize.small}
                      backgroundColor={backgroundColorHelper(invoice.status)}
                      borderColor={backgroundColorHelper(invoice.status)}
                      color={textColorHelper(invoice.status)}>
                      {invoice.status}
                    </StyledBadge>
                  </XStack>
                </YStack>
              </XStack>
              <Pressable
                onPress={() =>
                  navigator.navigate('new-invoice', {
                    invoice: invoice,
                  })
                }>
                <StyledCycle
                  height={48}
                  width={48}
                  marginHorizontal={8}
                  borderColor={theme.colors.gray[300]}>
                  <StyledMIcon
                    size={16}
                    name={'create'}
                    color={theme.colors.gray[600]}
                    onPress={() =>
                      navigator.navigate('new-invoice', {
                        invoice: invoice,
                      })
                    }
                  />
                </StyledCycle>
              </Pressable>
              <StyledCycle
                height={48}
                width={48}
                borderColor={theme.colors.gray[300]}>
                <StyledMIcon
                  size={32}
                  name={
                    selected === invoice._id
                      ? 'arrow-drop-down'
                      : 'arrow-drop-up'
                  }
                  color={theme.colors.gray[600]}
                  pointerEvents="box-none"
                  onPress={() =>
                    selected === invoice._id
                      ? onValueChange('')
                      : onValueChange(invoice._id)
                  }
                />
              </StyledCycle>
            </XStack>
            <XStack paddingHorizontal={8}>
              <StyledText
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[600]}>
                {invoice.invoice_description}
              </StyledText>
            </XStack>
          </YStack>

          {selected === invoice._id && (
            <>
              <StyledSeparator
                left={
                  <StyledText
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.large}
                    color={theme.colors.gray[400]}>
                    Items
                  </StyledText>
                }
              />
              <StyledCard
                flex={1}
                borderTopLeftRadius={8}
                borderTopRightRadius={8}
                borderColor={theme.colors.gray[100]}
                backgroundColor={theme.colors.gray[1]}
                borderWidth={1}>
                <XStack
                  borderTopLeftRadius={8}
                  borderTopRightRadius={8}
                  backgroundColor={theme.colors.gray[100]}
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical={12}
                  paddingHorizontal={16}>
                  <StyledText
                    flex={3}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    color={theme.colors.gray[800]}>
                    Date
                  </StyledText>
                  <StyledText
                    flex={3}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    color={theme.colors.gray[800]}>
                    Item
                  </StyledText>
                  <StyledText
                    flex={1}
                    paddingHorizontal={2}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    textAlign="center"
                    color={theme.colors.gray[800]}>
                    Hour
                  </StyledText>
                  <StyledText
                    flex={2}
                    paddingHorizontal={2}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    textAlign="right"
                    color={theme.colors.gray[800]}>
                    Rate
                  </StyledText>
                </XStack>
                <StyledSpacer marginVertical={1} />
                {invoice.items.map((invoice, index) => {
                  return (
                    <Fragment key={index}>
                      <XStack
                        backgroundColor={theme.colors.gray[1]}
                        justifyContent="space-between"
                        alignItems="center"
                        paddingVertical={8}
                        paddingHorizontal={16}>
                        <StyledText
                          flex={3}
                          fontWeight={theme.fontWeight.normal}
                          fontSize={theme.fontSize.small}
                          color={theme.colors.gray[800]}>
                          {invoice.date}
                        </StyledText>

                        <StyledText
                          flex={3}
                          fontWeight={theme.fontWeight.normal}
                          fontSize={theme.fontSize.small}
                          textAlign="left"
                          color={theme.colors.gray[800]}>
                          {invoice.description}
                        </StyledText>

                        <StyledText
                          flex={1}
                          fontWeight={theme.fontWeight.normal}
                          fontSize={theme.fontSize.small}
                          textAlign="center"
                          color={theme.colors.gray[800]}>
                          {invoice.hour}
                        </StyledText>
                        <StyledText
                          flex={2}
                          paddingHorizontal={2}
                          fontWeight={theme.fontWeight.normal}
                          fontSize={theme.fontSize.small}
                          textAlign="right"
                          color={theme.colors.gray[800]}>
                          {formatCurrency('£', invoice.rate || 0)}
                        </StyledText>
                      </XStack>
                      <StyledSpacer marginVertical={1} />
                      <StyledSeparator
                        line
                        lineProps={{
                          borderTopColor: theme.colors.gray[200],
                        }}
                      />
                    </Fragment>
                  );
                })}
                <XStack
                  backgroundColor={theme.colors.gray[1]}
                  justifyContent="space-between"
                  alignItems="center"
                  paddingTop={8}
                  paddingHorizontal={8}>
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
                    {formatCurrency('£', invoice.subtotal || 0)}
                  </StyledText>
                </XStack>
                <XStack
                  backgroundColor={theme.colors.gray[1]}
                  justifyContent="space-between"
                  alignItems="center"
                  paddingTop={8}
                  paddingBottom={8}
                  paddingHorizontal={8}>
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
                    {formatCurrency('£', invoice.tax || 0)}
                  </StyledText>
                </XStack>
                <XStack
                  backgroundColor={theme.colors.gray[1]}
                  justifyContent="space-between"
                  alignItems="center"
                  paddingBottom={8}
                  paddingHorizontal={8}>
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
                    fontSize={theme.fontSize.normal}
                    textAlign="right"
                    color={theme.colors.gray[900]}>
                    Total
                  </StyledText>
                  <StyledText
                    flex={2}
                    paddingHorizontal={8}
                    fontWeight={theme.fontWeight.medium}
                    fontSize={theme.fontSize.normal}
                    textAlign="right"
                    color={theme.colors.gray[900]}>
                    {formatCurrency('£', invoice.totalAmount || 0)}
                  </StyledText>
                </XStack>
              </StyledCard>
            </>
          )}
        </YStack>
      </Swipeable>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={true}
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
        <InvoiceProvider>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            keyExtractor={item => item._id}
            renderItem={({item, index}) => {
              return <Render invoice={item} key={item._id} />;
            }}
          />
        </InvoiceProvider>
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

export default Invoices;
