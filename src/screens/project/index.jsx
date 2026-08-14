import React, {Fragment, useMemo, useState} from 'react';
import {
  YStack,
  XStack,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledCycle,
  StyledOkDialog,
  StyledSpinner,
  StyledCard,
  StyledScrollView,
} from 'fluent-styles';
import {Alert, Platform, Pressable, ScrollView} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {useScheduler} from '../../hooks/useScheduler';
import {useAppContext} from '../../hooks/appContext';
import {schedulesTransformal, formatOnlyDate} from '../../utils/help';
import ScheduleStatusBadge from '../../components/shared/ScheduleStatusBadge';
import {getScheduleStatusLabel} from '../../constants/scheduleStatusTheme';

const INDIGO = '#4f46e5';
const TAB_GROUPS = [
  {key: 'action', label: 'Needs Action', statuses: ['Pending', 'ReadyToStart']},
  {key: 'upcoming', label: 'Upcoming', statuses: ['Accepted', 'Approved', 'AwaitingPayment']},
  {key: 'progress', label: 'In Progress', statuses: ['InProgress']},
  {key: 'history', label: 'History', statuses: ['Completed', 'Declined', 'Cancelled']},
];

const tabForStatus = status =>
  TAB_GROUPS.find(group => group.statuses.includes(status))?.key || 'action';

const Schedules = () => {
  const {user} = useAppContext();
  const navigator = useNavigation();
  const route = useRoute();
  const requestedStatus = route.params?.status;
  const [activeTab, setActiveTab] = useState(tabForStatus(requestedStatus));
  const [statusFilter, setStatusFilter] = useState(requestedStatus || null);
  const [showFilters, setShowFilters] = useState(false);
  const listScheduler = useScheduler();
  const aggregateScheduler = useScheduler();
  const activeGroup = TAB_GROUPS.find(group => group.key === activeTab) || TAB_GROUPS[0];
  const mySchedules = schedulesTransformal(listScheduler.data);

  const refresh = React.useCallback(async () => {
    if (!user?.user_id) return;
    const statuses = statusFilter && activeGroup.statuses.includes(statusFilter)
      ? [statusFilter]
      : activeGroup.statuses;
    await Promise.all([
      listScheduler.handleSchedules({engineerId: user.user_id, statuses}),
      aggregateScheduler.handleScheduleStatus({engineerId: user.user_id}),
    ]);
    // Hook methods intentionally excluded: their identities are recreated per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, activeTab, statusFilter]);

  React.useEffect(() => {
    if (!requestedStatus) {
      return;
    }
    setActiveTab(tabForStatus(requestedStatus));
    setStatusFilter(requestedStatus);
    navigator.setParams({status: undefined});
  }, [navigator, requestedStatus]);

  useFocusEffect(React.useCallback(() => {
    refresh();
  }, [refresh]));

  const counts = useMemo(() => {
    const byStatus = aggregateScheduler.data?.byStatus || {};
    return TAB_GROUPS.reduce((result, group) => ({
      ...result,
      [group.key]: group.statuses.reduce((total, status) => total + (Number(byStatus[status]) || 0), 0),
    }), {});
  }, [aggregateScheduler.data]);

  const selectTab = group => {
    setActiveTab(group.key);
    setStatusFilter(null);
    setShowFilters(false);
  };

  const updateStatus = (schedule, status, title, message) => {
    Alert.alert(title, message, [
      {text: 'Not now', style: 'cancel'},
      {
        text: title,
        style: status === 'Declined' ? 'destructive' : 'default',
        onPress: async () => {
          const updated = await listScheduler.handleUpdateStatus(status, schedule?._id);
          if (updated) await refresh();
        },
      },
    ]);
  };

  const openDetails = data => navigator.navigate('project-details', {
    id: data?.metta?.project,
    schedule: data?.metta?.schedule,
  });

  const ActionButton = ({label, outline, destructive, onPress}) => (
    <Pressable
      onPress={event => {
        event.stopPropagation?.();
        onPress();
      }}
      style={{
        height: 44,
        minWidth: 100,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: outline ? 1 : 0,
        borderColor: destructive ? '#ef4444' : INDIGO,
        backgroundColor: outline ? theme.colors.gray[1] : INDIGO,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <StyledText
        color={outline ? (destructive ? '#dc2626' : INDIGO) : theme.colors.white}
        fontWeight={theme.fontWeight.bold}>
        {label}
      </StyledText>
    </Pressable>
  );

  const RenderActions = ({schedule}) => {
    if (schedule?.status === 'Pending') {
      return (
        <XStack gap={10} marginTop={16}>
          <ActionButton
            label="Decline"
            outline
            destructive
            onPress={() => updateStatus(schedule, 'Declined', 'Decline booking', 'Are you sure you cannot take this booking?')}
          />
          <YStack flex={1}>
            <ActionButton
              label="Accept booking"
              onPress={() => updateStatus(schedule, 'Accepted', 'Accept booking', 'Confirm that you are available for this work.')}
            />
          </YStack>
        </XStack>
      );
    }
    if (schedule?.status === 'ReadyToStart') {
      return (
        <YStack marginTop={16}>
          <ActionButton
            label="Start job"
            onPress={() => updateStatus(schedule, 'InProgress', 'Start job', 'This marks the booking in progress and starts site geofencing.')}
          />
        </YStack>
      );
    }
    if (schedule?.status === 'InProgress') {
      return (
        <YStack marginTop={16}>
          <ActionButton
            label="Complete job"
            onPress={() => updateStatus(schedule, 'Completed', 'Complete job', 'Confirm that the work for this booking is complete.')}
          />
        </YStack>
      );
    }
    return null;
  };

  const RenderCard = ({data}) => {
    const schedule = data?.metta?.schedule;
    return (
      <Pressable onPress={() => openDetails(data)}>
        <StyledCard
          borderRadius={20}
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
          paddingVertical={16}
          paddingHorizontal={16}
          backgroundColor={theme.colors.gray[1]}>
          <XStack alignItems="flex-start" gap={12}>
            <YStack flex={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.bold}
                color={theme.colors.gray[900]}
                fontSize={theme.fontSize.medium}
                numberOfLines={2}>
                {data.title || 'Untitled booking'}
              </StyledText>
              <StyledSpacer marginVertical={4} />
              <ScheduleStatusBadge status={schedule?.status} size="sm" />
            </YStack>
            <StyledCycle height={38} width={38} borderColor={theme.colors.gray[200]}>
              <Icon name="chevron-right" size={22} color={theme.colors.gray[700]} />
            </StyledCycle>
          </XStack>
          <XStack marginTop={14} gap={14} flexWrap="wrap">
            <XStack alignItems="center" gap={6}>
              <Icon name="event" size={18} color={theme.colors.gray[500]} />
              <StyledText color={theme.colors.gray[700]} fontSize={theme.fontSize.small}>
                {formatOnlyDate(data.startDate)}
              </StyledText>
            </XStack>
            <XStack alignItems="center" gap={6}>
              <Icon name="schedule" size={18} color={theme.colors.gray[500]} />
              <StyledText color={theme.colors.gray[700]} fontSize={theme.fontSize.small}>
                {data.time} – {data.endTime}
              </StyledText>
            </XStack>
          </XStack>
          <RenderActions schedule={schedule} />
        </StyledCard>
      </Pressable>
    );
  };

  const error = listScheduler.error || aggregateScheduler.error;
  const loading = listScheduler.loading || aggregateScheduler.loading;

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <YStack flex={1} backgroundColor={theme.colors.gray[1]}>
        <YStack paddingHorizontal={18} paddingTop={Platform.OS === 'android' ? 18 : 8} paddingBottom={14}>
          <XStack alignItems="center">
            <YStack flex={1}>
              <StyledText fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]} fontSize={theme.fontSize.xlarge}>
                Bookings
              </StyledText>
              <StyledText marginTop={3} color={theme.colors.gray[500]} fontSize={theme.fontSize.small}>
                Manage your assigned work
              </StyledText>
            </YStack>
            <Pressable
              onPress={() => setShowFilters(value => !value)}
              style={{height: 44, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: statusFilter ? INDIGO : theme.colors.gray[200], flexDirection: 'row', alignItems: 'center', gap: 7}}>
              <Icon name="tune" size={20} color={statusFilter ? INDIGO : theme.colors.gray[800]} />
              <StyledText color={statusFilter ? INDIGO : theme.colors.gray[800]} fontWeight={theme.fontWeight.bold}>Filters</StyledText>
            </Pressable>
          </XStack>
        </YStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{height: 62, flexGrow: 0, flexShrink: 0}}
          contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 10, gap: 8}}>
          {TAB_GROUPS.map(group => {
            const selected = group.key === activeTab;
            return (
              <Pressable
                key={group.key}
                onPress={() => selectTab(group)}
                style={{
                  height: 42,
                  minWidth: group.key === 'action' ? 142 : 122,
                  paddingHorizontal: 12,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor: selected ? INDIGO : theme.colors.gray[200],
                  backgroundColor: selected ? INDIGO : theme.colors.gray[1],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <StyledText
                  numberOfLines={1}
                  color={selected ? theme.colors.white : theme.colors.gray[700]}
                  fontWeight={selected ? theme.fontWeight.bold : theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}>
                  {group.label}
                </StyledText>
                <YStack
                  minWidth={24}
                  height={24}
                  paddingHorizontal={6}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={selected ? 'rgba(255,255,255,0.2)' : theme.colors.gray[100]}>
                  <StyledText
                    color={selected ? theme.colors.white : theme.colors.gray[700]}
                    fontSize={11}
                    fontWeight={theme.fontWeight.bold}>
                    {counts[group.key] || 0}
                  </StyledText>
                </YStack>
              </Pressable>
            );
          })}
        </ScrollView>

        {showFilters && (
          <YStack marginHorizontal={16} marginTop={12} padding={14} borderRadius={16} borderWidth={1} borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[1]}>
            <XStack alignItems="center" marginBottom={10}>
              <StyledText flex={1} fontWeight={theme.fontWeight.bold} color={theme.colors.gray[900]}>Filter {activeGroup.label.toLowerCase()}</StyledText>
              {statusFilter && <Pressable onPress={() => setStatusFilter(null)}><StyledText color={INDIGO} fontWeight={theme.fontWeight.bold}>Clear</StyledText></Pressable>}
            </XStack>
            <XStack gap={8} flexWrap="wrap">
              <Pressable onPress={() => setStatusFilter(null)} style={{paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: 'center', backgroundColor: !statusFilter ? INDIGO : theme.colors.gray[100]}}>
                <StyledText color={!statusFilter ? theme.colors.white : theme.colors.gray[800]}>All</StyledText>
              </Pressable>
              {activeGroup.statuses.map(status => (
                <Pressable key={status} onPress={() => setStatusFilter(status)} style={{paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: 'center', backgroundColor: statusFilter === status ? INDIGO : theme.colors.gray[100]}}>
                  <StyledText color={statusFilter === status ? theme.colors.white : theme.colors.gray[800]}>{getScheduleStatusLabel(status)}</StyledText>
                </Pressable>
              ))}
            </XStack>
          </YStack>
        )}

        <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 16, paddingBottom: 100}}>
          {mySchedules.map(schedule => (
            <Fragment key={schedule.id}>
              <RenderCard data={schedule} />
              <StyledSpacer marginVertical={6} />
            </Fragment>
          ))}
          {!loading && mySchedules.length === 0 && (
            <YStack paddingVertical={70} alignItems="center">
              <StyledCycle height={72} width={72} borderColor="#e0e7ff" backgroundColor="#eef2ff">
                <Icon name="event-available" size={32} color={INDIGO} />
              </StyledCycle>
              <StyledText marginTop={16} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={theme.colors.gray[900]}>Nothing here right now</StyledText>
              <StyledText marginTop={6} textAlign="center" color={theme.colors.gray[500]}>Bookings in {activeGroup.label.toLowerCase()} will appear here.</StyledText>
            </YStack>
          )}
        </StyledScrollView>
      </YStack>
      {error && (
        <StyledOkDialog
          title="Unable to load bookings"
          description={typeof error === 'string' ? error : error?.message || 'Please try again.'}
          visible
          onOk={() => {
            listScheduler.handleReset();
            aggregateScheduler.handleReset();
          }}
        />
      )}
      {loading && <StyledSpinner />}
    </StyledSafeAreaView>
  );
};

export default Schedules;
