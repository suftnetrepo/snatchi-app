import React from 'react';
import {ScrollView, Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  YStack, XStack, StyledSafeAreaView, StyledHeader, StyledText, StyledCycle,
  StyledSpacer, StyledCard, StyledBadge, StyledButton,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {fontStyles, theme} from '../../utils/theme';
import {formatCurrency, formatReadableDate, backgroundColorHelper, textColorHelper} from '../../utils/help';
import useInvoicePDF from '../../hooks/useInvoicePDF';

const InvoiceDetails = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const invoice = params?.invoice;
  const {shareInvoice, downloadInvoice} = useInvoicePDF();
  if (!invoice) return null;

  const reference = invoice._id?.slice(-8).toUpperCase();
  const type = !invoice.invoice_type || ['Save', 'Draft'].includes(invoice.invoice_type)
    ? 'Invoice'
    : invoice.invoice_type;

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <XStack padding={16} alignItems="center" backgroundColor={theme.colors.gray[1]}>
            <StyledCycle pressable pressableProps={{onPress: () => navigation.goBack()}} height={48} width={48} borderColor={theme.colors.gray[300]}>
              <Icon name="arrow-back" size={20} color={theme.colors.gray[900]} />
            </StyledCycle>
            <StyledSpacer marginHorizontal={6} />
            <YStack>
              <StyledText fontFamily={fontStyles.Roboto_Regular} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>
                {type} #{reference}
              </StyledText>
              <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{invoice.project?.name || invoice.scheduler?.title || 'Job invoice'}</StyledText>
            </YStack>
          </XStack>
        </StyledHeader.Full>
      </StyledHeader>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 16, paddingBottom: 120}}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
          <StyledBadge backgroundColor={backgroundColorHelper(invoice.status)} borderColor={backgroundColorHelper(invoice.status)} color={textColorHelper(invoice.status)}>{invoice.status}</StyledBadge>
          <StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{formatCurrency('£', invoice.totalAmount || 0)}</StyledText>
        </XStack>

        <StyledCard borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]} padding={16} marginBottom={16}>
          <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>DESCRIPTION</StyledText>
          <StyledText marginTop={6} fontSize={theme.fontSize.normal} color={theme.colors.gray[900]}>{invoice.invoice_description || 'No description'}</StyledText>
          <XStack marginTop={18} justifyContent="space-between">
            <YStack><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>ISSUED</StyledText><StyledText color={theme.colors.gray[900]}>{formatReadableDate(invoice.issueDate)}</StyledText></YStack>
            <YStack alignItems="flex-end"><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>DUE</StyledText><StyledText color={theme.colors.gray[900]}>{formatReadableDate(invoice.due_on)}</StyledText></YStack>
          </XStack>
        </StyledCard>

        <StyledText marginBottom={8} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>Line items</StyledText>
        <StyledCard borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]} padding={16}>
          {(invoice.items || []).map((item, index) => (
            <XStack key={`${item.description}-${index}`} paddingVertical={10} borderBottomWidth={index < invoice.items.length - 1 ? 1 : 0} borderColor={theme.colors.gray[100]} alignItems="center">
              <YStack flex={1}>
                <StyledText fontSize={theme.fontSize.normal} color={theme.colors.gray[900]}>{item.description}</StyledText>
                <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{item.duration} {item.unit}{item.duration === 1 ? '' : 's'} × {formatCurrency('£', item.rate || 0)}</StyledText>
              </YStack>
              <StyledText fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>{formatCurrency('£', (item.duration || 0) * (item.rate || 0))}</StyledText>
            </XStack>
          ))}
          <YStack marginTop={16} gap={8}>
            <XStack justifyContent="space-between"><StyledText color={theme.colors.gray[600]}>Subtotal</StyledText><StyledText color={theme.colors.gray[900]}>{formatCurrency('£', invoice.subtotal || 0)}</StyledText></XStack>
            <XStack justifyContent="space-between"><StyledText color={theme.colors.gray[600]}>VAT</StyledText><StyledText color={theme.colors.gray[900]}>{formatCurrency('£', invoice.tax || 0)}</StyledText></XStack>
            {!!invoice.discount && <XStack justifyContent="space-between"><StyledText color={theme.colors.gray[600]}>Discount</StyledText><StyledText color={theme.colors.gray[900]}>-{formatCurrency('£', invoice.discount)}</StyledText></XStack>}
            <XStack justifyContent="space-between" paddingTop={10} borderTopWidth={1} borderColor={theme.colors.gray[200]}><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Total</StyledText><StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{formatCurrency('£', invoice.totalAmount || 0)}</StyledText></XStack>
          </YStack>
        </StyledCard>
        {!!invoice.notes && <StyledCard marginTop={16} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]} padding={16}><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>NOTES</StyledText><StyledText marginTop={6} color={theme.colors.gray[900]}>{invoice.notes}</StyledText></StyledCard>}
      </ScrollView>
      <XStack padding={16} gap={10} borderTopWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
        <StyledButton flex={1} borderRadius={12} borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} onPress={() => downloadInvoice(invoice)}><StyledText padding={8} color={theme.colors.gray[900]}>Download</StyledText></StyledButton>
        <StyledButton flex={1} borderRadius={12} borderColor={theme.colors.indigo?.[600] || '#4f46e5'} backgroundColor={theme.colors.indigo?.[600] || '#4f46e5'} onPress={() => shareInvoice(invoice)}><StyledText padding={8} color={theme.colors.gray[1]}>Share</StyledText></StyledButton>
      </XStack>
    </StyledSafeAreaView>
  );
};

export default InvoiceDetails;
