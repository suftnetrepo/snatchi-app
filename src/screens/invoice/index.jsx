import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlatList, Platform, Pressable} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  YStack, XStack, StyledHeader, StyledSafeAreaView, StyledText, StyledCycle,
  StyledSpacer, StyledCard, StyledBadge, StyledSpinner, StyledOkDialog,
} from 'fluent-styles';
import {fontStyles, theme} from '../../utils/theme';
import {formatCurrency, formatReadableDate, backgroundColorHelper, textColorHelper} from '../../utils/help';
import {useInvoice} from '../../hooks/useInvoice';
import useInvoicePDF from '../../hooks/useInvoicePDF';
import {useFocus} from '../../hooks/useFocus';
import {useAppContext} from '../../hooks/appContext';

const Invoices = () => {
  const {key} = useFocus();
  const {status, updateChangeStatus} = useAppContext();
  const navigation = useNavigation();
  const {shareInvoice, downloadInvoice} = useInvoicePDF();
  const {data, loading, error, handleDelete, handleFetchInvoices, handleReset} = useInvoice(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const actionsRef = useRef(null);
  const snapPoints = useMemo(() => ['38%'], []);

  useEffect(() => {
    if (status) {
      handleFetchInvoices().then(() => updateChangeStatus(false));
    }
    // Refresh is driven by the app focus key and successful form changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, key]);

  const openActions = invoice => {
    setSelectedInvoice(invoice);
    actionsRef.current?.snapToIndex(0);
  };

  const canModify = invoice => ['Draft', 'Rejected'].includes(invoice.status);
  const typeLabel = invoice => {
    if (!invoice?.invoice_type || ['Save', 'Draft'].includes(invoice.invoice_type)) {
      return 'Invoice';
    }
    return invoice.invoice_type;
  };

  const Header = () => (
    <XStack padding={16} alignItems="center" backgroundColor={theme.colors.gray[1]}>
      <YStack>
        <StyledText fontFamily={fontStyles.Roboto_Regular} fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Invoices & quotes</StyledText>
        <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Submit and track your job billing</StyledText>
      </YStack>
      <StyledSpacer flex={1} />
      <StyledCycle pressable pressableProps={{onPress: () => navigation.navigate('new-invoice')}} height={48} width={48} borderColor="#4f46e5" backgroundColor="#4f46e5">
        <Icon name="add" size={25} color="#ffffff" />
      </StyledCycle>
    </XStack>
  );

  const InvoiceCard = ({invoice}) => (
    <Pressable onPress={() => navigation.navigate('invoice-details', {invoice})}>
      <StyledCard borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]} padding={16} marginBottom={12}>
        <XStack alignItems="flex-start">
          <YStack flex={1}>
            <XStack alignItems="center" gap={8}>
              <StyledText fontSize={theme.fontSize.small} fontWeight={theme.fontWeight.semiBold} color="#4f46e5">{typeLabel(invoice).toUpperCase()}</StyledText>
              <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[400]}>#{invoice._id?.slice(-8).toUpperCase()}</StyledText>
            </XStack>
            <StyledText marginTop={8} numberOfLines={1} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>{invoice.project?.name || invoice.scheduler?.title || invoice.invoice_description || 'Job invoice'}</StyledText>
            <StyledText marginTop={3} numberOfLines={1} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{invoice.invoice_description}</StyledText>
          </YStack>
          <Pressable onPress={() => openActions(invoice)} hitSlop={12}>
            <Icon name="more-vert" size={26} color={theme.colors.gray[700]} />
          </Pressable>
        </XStack>
        <XStack marginTop={16} alignItems="center">
          <StyledBadge backgroundColor={backgroundColorHelper(invoice.status)} borderColor={backgroundColorHelper(invoice.status)} color={textColorHelper(invoice.status)}>{invoice.status}</StyledBadge>
          <StyledSpacer flex={1} />
          <YStack alignItems="flex-end">
            <StyledText fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{formatCurrency('£', invoice.totalAmount || 0)}</StyledText>
            <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{formatReadableDate(invoice.issueDate)}</StyledText>
          </YStack>
        </XStack>
      </StyledCard>
    </Pressable>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}><StyledHeader.Full><Header /></StyledHeader.Full></StyledHeader>
      <FlatList
        contentContainerStyle={{padding: 16, paddingBottom: 110}}
        showsVerticalScrollIndicator={false}
        data={Array.isArray(data) ? data : []}
        keyExtractor={item => item._id}
        renderItem={({item}) => <InvoiceCard invoice={item} />}
        ListEmptyComponent={!loading ? <YStack alignItems="center" paddingVertical={80}><Icon name="receipt-long" size={44} color={theme.colors.gray[300]} /><StyledText marginTop={12} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>No invoices or quotes yet</StyledText><StyledText marginTop={4} color={theme.colors.gray[500]}>Create one from an accepted job.</StyledText></YStack> : null}
      />
      {loading && <StyledSpinner />}
      {error && <StyledOkDialog title={typeof error === 'string' ? error : error?.message} description="Please try again" visible onOk={handleReset} />}
      <BottomSheet ref={actionsRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetView style={{padding: 20}}>
          <StyledText fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Invoice actions</StyledText>
          {[
            ['visibility', 'View details', () => navigation.navigate('invoice-details', {invoice: selectedInvoice})],
            ['download', 'Download PDF', () => downloadInvoice(selectedInvoice)],
            ['share', 'Share PDF', () => shareInvoice(selectedInvoice)],
            ...(canModify(selectedInvoice || {}) ? [
              ['edit', 'Edit draft', () => navigation.navigate('new-invoice', {invoice: selectedInvoice})],
              ['delete-outline', 'Delete draft', () => handleDelete(selectedInvoice._id)],
            ] : []),
          ].map(([icon, label, action]) => (
            <Pressable key={label} onPress={() => {actionsRef.current?.close(); action();}}>
              <XStack paddingVertical={14} alignItems="center" gap={12}><Icon name={icon} size={23} color={label.includes('Delete') ? '#dc2626' : theme.colors.gray[800]} /><StyledText fontSize={theme.fontSize.normal} color={label.includes('Delete') ? '#dc2626' : theme.colors.gray[900]}>{label}</StyledText></XStack>
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </StyledSafeAreaView>
  );
};

export default Invoices;
