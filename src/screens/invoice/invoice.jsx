import React, {useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';
import {
  YStack, XStack, StyledSafeAreaView, StyledHeader, StyledText, StyledCycle,
  StyledSpacer, StyledCard, StyledInput, StyledMultiInput, StyledButton,
  StyledSpinner, StyledOkDialog, validate,
} from 'fluent-styles';
import {fontStyles, theme} from '../../utils/theme';
import {formatCurrency, formatReadableDate, dateConverter} from '../../utils/help';
import {useInvoice} from '../../hooks/useInvoice';
import {useScheduler} from '../../hooks/useScheduler';
import {itemValidator} from '../../validator/invoiceValidator';
import {useAppContext} from '../../hooks/appContext';

const INDIGO = '#4f46e5';
const acceptedStatuses = new Set(['Accepted', 'Approved', 'Paid', 'ReadyToStart', 'InProgress', 'Progress', 'Completed', 'Ready']);

const Invoice = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const existing = params?.invoice;
  const {updateChangeStatus} = useAppContext();
  const {
    fields, onChange, handleAddItem, handleDeleteItem, handleEditItem,
    handleAddInvoice, handleEditInvoice, loading, error, handleReset,
  } = useInvoice(false);
  const {data: schedules, loading: schedulesLoading, handleAllSchedules} = useScheduler();
  const [step, setStep] = useState(0);
  const [itemFields, setItemFields] = useState(itemValidator.fields);
  const [itemErrors, setItemErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [jobSearch, setJobSearch] = useState('');
  const [dateTarget, setDateTarget] = useState(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const itemSheet = useRef(null);
  const jobSheet = useRef(null);
  const itemSnapPoints = useMemo(() => ['78%', '94%'], []);
  const jobSnapPoints = useMemo(() => ['70%', '92%'], []);

  useEffect(() => {
    handleAllSchedules();
    if (existing) handleEditItem({...existing, scheduler: existing.scheduler?._id || existing.scheduler});
    // Load once for this form instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?._id]);

  const jobs = (Array.isArray(schedules) ? schedules : []).filter(job => acceptedStatuses.has(job.status));
  const matchingJobs = jobs.filter(job => {
    const search = jobSearch.trim().toLowerCase();
    if (!search) return true;
    return [job.title, job.project?.name, job.status]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search));
  });
  const selectedJob = jobs.find(job => job._id === fields.scheduler) || existing?.scheduler;
  const subtotal = fields.items.reduce((sum, item) => sum + (Number(item.duration) * Number(item.rate)), 0);
  const discount = Number(fields.discount) || 0;
  const tax = Math.max(0, subtotal - discount) * 0.2;
  const total = Math.max(0, subtotal - discount) + tax;

  const setItem = (name, value) => setItemFields(previous => ({...previous, [name]: value}));
  const openDate = (target, value) => {
    setDateTarget(target);
    setPickerDate(value instanceof Date ? value : new Date(value || Date.now()));
  };

  const addItem = () => {
    const {hasError, errors} = validate(itemFields, itemValidator.rules);
    if (hasError) return setItemErrors(errors);
    handleAddItem({...itemFields, _id: uuid.v4(), duration: Number(itemFields.duration), rate: Number(itemFields.rate)});
    setItemFields(itemValidator.reset());
    setItemErrors({});
    itemSheet.current?.close();
  };

  const continueFromDetails = () => {
    const errors = {};
    if (!fields.scheduler) errors.scheduler = 'Choose an accepted job';
    if (!fields.invoice_description?.trim()) errors.invoice_description = 'Description is required';
    if (!fields.invoice_type) errors.invoice_type = 'Choose Invoice or Quote';
    if (!fields.due_on) errors.due_on = 'Due date is required';
    setFormErrors(errors);
    if (!Object.keys(errors).length) setStep(1);
  };

  const submit = async status => {
    if (!fields.items.length) return setFormErrors({items: 'Add at least one line item'});
    const body = {
      scheduler: fields.scheduler,
      invoice_type: fields.invoice_type === 'Quote' ? 'Quote' : 'Invoice',
      invoice_description: fields.invoice_description,
      issueDate: fields.issueDate,
      due_on: fields.due_on,
      items: fields.items.map(({description, unit, duration, rate, date}) => ({description, unit, duration, rate, date})),
      discount,
      notes: fields.notes,
      status,
    };
    const saved = existing
      ? await handleEditInvoice(body, existing._id)
      : await handleAddInvoice(body);
    if (saved) {
      updateChangeStatus(true);
      navigation.goBack();
    }
  };

  const Header = () => (
    <XStack padding={16} alignItems="center" backgroundColor={theme.colors.gray[1]}>
      <StyledCycle pressable pressableProps={{onPress: () => step ? setStep(step - 1) : navigation.goBack()}} height={48} width={48} borderColor={theme.colors.gray[300]}>
        <Icon name="arrow-back" size={20} color={theme.colors.gray[900]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={6} />
      <YStack><StyledText fontFamily={fontStyles.Roboto_Regular} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{existing ? 'Edit draft' : 'New invoice or quote'}</StyledText><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Step {step + 1} of 3</StyledText></YStack>
    </XStack>
  );

  const StepBar = () => <XStack paddingHorizontal={16} gap={6}>{[0, 1, 2].map(index => <YStack key={index} flex={1} height={4} borderRadius={2} backgroundColor={index <= step ? INDIGO : theme.colors.gray[200]} />)}</XStack>;

  const DetailsStep = () => (
    <YStack gap={14}>
      <StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Choose the job</StyledText>
      <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Invoices and quotes must belong to work assigned to you.</StyledText>
      {schedulesLoading ? <StyledSpinner /> : jobs.length ? (
        <Pressable onPress={() => jobSheet.current?.snapToIndex(0)}>
          <StyledCard padding={14} borderRadius={14} borderWidth={fields.scheduler ? 2 : 1} borderColor={fields.scheduler ? INDIGO : theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
            <XStack alignItems="center">
              <YStack flex={1}>
                <StyledText fontWeight={theme.fontWeight.semiBold} color={selectedJob ? theme.colors.gray[900] : theme.colors.gray[500]}>{selectedJob?.title || 'Select an accepted job'}</StyledText>
                <StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{selectedJob ? `${formatReadableDate(selectedJob.startDate)} · ${selectedJob.status}` : `${jobs.length} available job${jobs.length === 1 ? '' : 's'}`}</StyledText>
              </YStack>
              <Icon name="unfold-more" size={24} color={INDIGO} />
            </XStack>
          </StyledCard>
        </Pressable>
      ) : null}
      {!schedulesLoading && !jobs.length && <StyledCard padding={16} borderRadius={14} borderWidth={1} borderColor={theme.colors.gray[200]}><StyledText color={theme.colors.gray[700]}>No accepted jobs are available for invoicing.</StyledText></StyledCard>}
      {!!formErrors.scheduler && <StyledText color="#dc2626">{formErrors.scheduler}</StyledText>}
      <StyledText fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>Document type</StyledText>
      <XStack gap={10}>{['Invoice', 'Quote'].map(type => <StyledButton key={type} flex={1} borderRadius={12} borderColor={fields.invoice_type === type ? INDIGO : theme.colors.gray[300]} backgroundColor={fields.invoice_type === type ? INDIGO : theme.colors.gray[1]} onPress={() => onChange('invoice_type', type)}><StyledText padding={8} color={fields.invoice_type === type ? '#fff' : theme.colors.gray[900]}>{type}</StyledText></StyledButton>)}</XStack>
      <StyledMultiInput
        label="Description"
        value={fields.invoice_description}
        onChangeText={value => onChange('invoice_description', value)}
        placeholder="Describe the work, materials or billing period"
        maxLength={500}
        multiline
        numberOfLines={5}
        height={120}
        textAlignVertical="top"
        borderColor={formErrors.invoice_description ? '#dc2626' : theme.colors.gray[300]}
        backgroundColor={theme.colors.gray[1]}
      />
      <StyledText textAlign="right" fontSize={theme.fontSize.small} color={theme.colors.gray[400]}>{fields.invoice_description?.length || 0}/500</StyledText>
      <XStack gap={10}>
        <Pressable style={{flex: 1}} onPress={() => openDate('issueDate', fields.issueDate)}><StyledCard padding={12} borderRadius={12} borderWidth={1} borderColor={theme.colors.gray[300]}><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Issue date</StyledText><StyledText marginTop={4} color={theme.colors.gray[900]}>{formatReadableDate(fields.issueDate)}</StyledText></StyledCard></Pressable>
        <Pressable style={{flex: 1}} onPress={() => openDate('due_on', fields.due_on || new Date())}><StyledCard padding={12} borderRadius={12} borderWidth={1} borderColor={formErrors.due_on ? '#dc2626' : theme.colors.gray[300]}><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Due date</StyledText><StyledText marginTop={4} color={theme.colors.gray[900]}>{fields.due_on ? formatReadableDate(fields.due_on) : 'Select date'}</StyledText></StyledCard></Pressable>
      </XStack>
      <StyledButton borderRadius={12} borderColor={INDIGO} backgroundColor={INDIGO} onPress={continueFromDetails}><StyledText padding={10} color="#fff">Continue to line items</StyledText></StyledButton>
    </YStack>
  );

  const ItemsStep = () => (
    <YStack gap={12}>
      <XStack alignItems="center"><YStack flex={1}><StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Line items</StyledText><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Add labour, materials or expenses.</StyledText></YStack><StyledButton borderRadius={12} borderColor={INDIGO} backgroundColor={INDIGO} onPress={() => itemSheet.current?.snapToIndex(0)}><StyledText padding={7} color="#fff">+ Add item</StyledText></StyledButton></XStack>
      {fields.items.map(item => <StyledCard key={item._id || item.description} padding={14} borderRadius={14} borderWidth={1} borderColor={theme.colors.gray[200]}><XStack alignItems="center"><YStack flex={1}><StyledText color={theme.colors.gray[900]} fontWeight={theme.fontWeight.semiBold}>{item.description}</StyledText><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{item.duration} {item.unit} × {formatCurrency('£', item.rate)}</StyledText></YStack><StyledText marginRight={12} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{formatCurrency('£', item.duration * item.rate)}</StyledText><Pressable onPress={() => handleDeleteItem(item._id)}><Icon name="delete-outline" size={23} color="#dc2626" /></Pressable></XStack></StyledCard>)}
      {!fields.items.length && <YStack alignItems="center" paddingVertical={60}><Icon name="playlist-add" size={42} color={theme.colors.gray[300]} /><StyledText marginTop={10} color={theme.colors.gray[600]}>No line items added</StyledText></YStack>}
      {!!formErrors.items && <StyledText color="#dc2626">{formErrors.items}</StyledText>}
      <StyledCard padding={16} borderRadius={14} backgroundColor={theme.colors.gray[100]}><XStack justifyContent="space-between"><StyledText color={theme.colors.gray[700]}>Running subtotal</StyledText><StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>{formatCurrency('£', subtotal)}</StyledText></XStack></StyledCard>
      <StyledButton borderRadius={12} borderColor={INDIGO} backgroundColor={INDIGO} onPress={() => fields.items.length ? setStep(2) : setFormErrors({items: 'Add at least one line item'})}><StyledText padding={10} color="#fff">Review invoice</StyledText></StyledButton>
    </YStack>
  );

  const ReviewStep = () => (
    <YStack gap={14}>
      <StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Review and submit</StyledText>
      <StyledCard padding={16} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]}><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{fields.invoice_type?.toUpperCase()} FOR</StyledText><StyledText marginTop={5} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>{selectedJob?.title || selectedJob?.project?.name}</StyledText><StyledText marginTop={8} color={theme.colors.gray[600]}>{fields.invoice_description}</StyledText></StyledCard>
      <StyledCard padding={16} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]}>{fields.items.map(item => <XStack key={item._id || item.description} paddingVertical={8} justifyContent="space-between"><YStack flex={1}><StyledText color={theme.colors.gray[900]}>{item.description}</StyledText><StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{item.duration} {item.unit} × {formatCurrency('£', item.rate)}</StyledText></YStack><StyledText color={theme.colors.gray[900]}>{formatCurrency('£', item.duration * item.rate)}</StyledText></XStack>)}<YStack marginTop={10} paddingTop={12} borderTopWidth={1} borderColor={theme.colors.gray[200]} gap={7}><XStack justifyContent="space-between"><StyledText color={theme.colors.gray[600]}>Subtotal</StyledText><StyledText>{formatCurrency('£', subtotal)}</StyledText></XStack><XStack justifyContent="space-between"><StyledText color={theme.colors.gray[600]}>VAT (20%)</StyledText><StyledText>{formatCurrency('£', tax)}</StyledText></XStack><XStack justifyContent="space-between"><StyledText fontWeight={theme.fontWeight.bold}>Total</StyledText><StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold}>{formatCurrency('£', total)}</StyledText></XStack></YStack></StyledCard>
      <StyledMultiInput label="Notes (optional)" value={fields.notes} onChangeText={value => onChange('notes', value)} placeholder="Add information for the integrator" borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} />
      <XStack gap={10}><StyledButton flex={1} borderRadius={12} borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} onPress={() => submit('Draft')}><StyledText padding={9} color={theme.colors.gray[900]}>Save draft</StyledText></StyledButton><StyledButton flex={1} borderRadius={12} borderColor={INDIGO} backgroundColor={INDIGO} onPress={() => submit('Submitted')}><StyledText padding={9} color="#fff">Submit</StyledText></StyledButton></XStack>
      <StyledText textAlign="center" fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>Submitted documents are locked while the integrator reviews them.</StyledText>
    </YStack>
  );

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <StyledHeader skipAndroid={Platform.OS !== 'android'} statusProps={{translucent: true}}><StyledHeader.Full>{Header()}</StyledHeader.Full></StyledHeader>
        {StepBar()}
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{padding: 16, paddingBottom: 120}}>{step === 0 ? DetailsStep() : step === 1 ? ItemsStep() : ReviewStep()}</ScrollView>
        {(loading || schedulesLoading) && <StyledSpinner />}
        {error && <StyledOkDialog title={typeof error === 'string' ? error : error?.message} description="Your changes are still here. Please try again." visible onOk={handleReset} />}
        <DatePicker modal open={!!dateTarget && dateTarget !== 'itemDate'} date={pickerDate} mode="date" minimumDate={dateTarget === 'due_on' ? new Date(fields.issueDate || Date.now()) : undefined} onConfirm={date => {onChange(dateTarget, date); setDateTarget(null);}} onCancel={() => setDateTarget(null)} />
        <BottomSheet ref={itemSheet} index={-1} snapPoints={itemSnapPoints} enablePanDownToClose keyboardBehavior="interactive">
          <BottomSheetScrollView contentContainerStyle={{padding: 20, paddingBottom: 80}}>
            <StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Add line item</StyledText>
            <YStack marginTop={16} gap={12}>
              <StyledInput placeholder="Service or expense" value={itemFields.description} onChangeText={value => setItem('description', value)} borderColor={itemErrors.description ? '#dc2626' : theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} />
              <Pressable onPress={() => openDate('itemDate', itemFields.date || new Date())}><StyledCard padding={13} borderRadius={12} borderWidth={1} borderColor={itemErrors.date ? '#dc2626' : theme.colors.gray[300]}><StyledText color={itemFields.date ? theme.colors.gray[900] : theme.colors.gray[400]}>{itemFields.date || 'Work date'}</StyledText></StyledCard></Pressable>
              <XStack gap={8}>{['day', 'hour'].map(unit => <StyledButton key={unit} flex={1} borderRadius={12} borderColor={itemFields.unit === unit ? INDIGO : theme.colors.gray[300]} backgroundColor={itemFields.unit === unit ? INDIGO : theme.colors.gray[1]} onPress={() => setItem('unit', unit)}><StyledText padding={7} color={itemFields.unit === unit ? '#fff' : theme.colors.gray[900]}>{unit === 'day' ? 'Daily' : 'Hourly'}</StyledText></StyledButton>)}</XStack>
              <XStack gap={10}><YStack flex={1}><StyledText marginBottom={5} color={theme.colors.gray[600]}>Quantity</StyledText><StyledInput keyboardType="decimal-pad" value={String(itemFields.duration || '')} onChangeText={value => setItem('duration', value)} borderColor={itemErrors.duration ? '#dc2626' : theme.colors.gray[300]} /></YStack><YStack flex={1}><StyledText marginBottom={5} color={theme.colors.gray[600]}>Rate (£)</StyledText><StyledInput keyboardType="decimal-pad" value={String(itemFields.rate || '')} onChangeText={value => setItem('rate', value)} borderColor={itemErrors.rate ? '#dc2626' : theme.colors.gray[300]} /></YStack></XStack>
              <StyledButton borderRadius={12} borderColor={INDIGO} backgroundColor={INDIGO} onPress={addItem}><StyledText padding={10} color="#fff">Add line item</StyledText></StyledButton>
            </YStack>
          </BottomSheetScrollView>
        </BottomSheet>
        <BottomSheet ref={jobSheet} index={-1} snapPoints={jobSnapPoints} enablePanDownToClose keyboardBehavior="interactive">
          <BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding: 20, paddingBottom: 80}}>
            <StyledText fontSize={theme.fontSize.large} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Select a job</StyledText>
            <StyledText marginTop={4} marginBottom={14} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{jobs.length} accepted or active job{jobs.length === 1 ? '' : 's'} available</StyledText>
            <StyledInput placeholder="Search jobs" value={jobSearch} onChangeText={setJobSearch} borderColor={theme.colors.gray[300]} backgroundColor={theme.colors.gray[1]} />
            <YStack marginTop={12} gap={10}>
              {matchingJobs.map(job => (
                <Pressable key={job._id} onPress={() => {onChange('scheduler', job._id); setFormErrors(previous => ({...previous, scheduler: null})); jobSheet.current?.close();}}>
                  <StyledCard padding={14} borderRadius={14} borderWidth={fields.scheduler === job._id ? 2 : 1} borderColor={fields.scheduler === job._id ? INDIGO : theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
                    <XStack alignItems="center"><YStack flex={1}><StyledText fontWeight={theme.fontWeight.semiBold} color={theme.colors.gray[900]}>{job.title}</StyledText><StyledText marginTop={3} fontSize={theme.fontSize.small} color={theme.colors.gray[500]}>{formatReadableDate(job.startDate)} · {job.status}</StyledText></YStack>{fields.scheduler === job._id && <Icon name="check-circle" size={24} color={INDIGO} />}</XStack>
                  </StyledCard>
                </Pressable>
              ))}
              {!matchingJobs.length && <YStack alignItems="center" paddingVertical={40}><Icon name="search-off" size={36} color={theme.colors.gray[300]} /><StyledText marginTop={8} color={theme.colors.gray[500]}>No jobs match your search</StyledText></YStack>}
            </YStack>
          </BottomSheetScrollView>
        </BottomSheet>
        <DatePicker modal open={dateTarget === 'itemDate'} date={pickerDate} mode="date" onConfirm={date => {setItem('date', dateConverter(date.toISOString())); setDateTarget(null);}} onCancel={() => setDateTarget(null)} />
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default Invoice;
