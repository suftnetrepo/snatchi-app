import React, {useCallback} from 'react';
import {Alert} from 'react-native';

// ── gluestack-ui v3 component imports ────────────────────

import {
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  Card,
  Icon,
  Badge,
  BadgeText,
  BadgeIcon,
  Button,
  ButtonText,
  ButtonIcon,
  Heading,
} from '@gluestack-ui/themed';

// ── lucide-react-native icons ────────────────────────────
import {
  Calendar,
  MapPin,
  Wrench,
  ArrowRight,
  X,
  CircleDot,
  CheckCircle2,
} from 'lucide-react-native';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface JobNotification {
  id: string;
  _id: string;
  projectId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  completeAddress: string;
  siteName: string;
  description: string;
  action: boolean;
  screen: string;
  createdAt: number;
  dateString: string;
  read: boolean;
  title: string;
  project: {
    completeAddress: string;
  };
  status: string;
}

interface JobCardProps {
  job: JobNotification | null;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onStart?: (jobId: string) => void;
  onComplete?: (jobId: string) => void;
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════
// Section row component (icon + content)
// ═══════════════════════════════════════════════════════════

interface SectionRowProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}

function SectionRow({
  icon: IconComponent,
  iconBg,
  iconColor,
  children,
}: SectionRowProps) {
  return (
    <HStack space="md" alignItems="flex-start" py="$4">
      <Box
        width={40}
        height={40}
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        mt="$0.5"
        bg={iconBg}>
        <Icon as={IconComponent} size="sm" color={iconColor} />
      </Box>
      <VStack flex={1}>{children}</VStack>
    </HStack>
  );
}

// ═══════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════

export default function JobCard({job, onAccept, onDecline, onCancel, onStart, onComplete}: JobCardProps) {
  const jobId = job?._id;
  const status = String(job?.status || '').toLowerCase().replace(/[\s_-]/g, '');

  const handleAccept = useCallback(() => {
    if (!jobId) {
      return;
    }

    onAccept?.(jobId);
  }, [jobId, onAccept]);

  const handleDecline = useCallback(() => {
    if (!jobId) {
      return;
    }

    Alert.alert(
      'Decline job',
      'Are you sure you want to decline this job request?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            onDecline?.(jobId);
          },
        },
      ],
    );
  }, [jobId, onDecline]);

  const confirm = useCallback((title: string, message: string, action: string, callback?: (jobId: string) => void, destructive = false) => {
    if (!jobId) return;
    Alert.alert(title, message, [{text: 'Not now', style: 'cancel'}, {text: action, style: destructive ? 'destructive' : 'default', onPress: () => callback?.(jobId)}]);
  }, [jobId]);

  if (!job) {
    return (
      <Card size="lg" mx="$4" borderRadius={16} bg="$background0">
        <VStack space="md" alignItems="center" py="$8" px="$6">
          <Heading size="lg">No job data</Heading>
          <Text size="sm" color="$textLight500" textAlign="center">
            There is no job information available to display.
          </Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card size="lg" borderRadius={16} bg="$background0" overflow="hidden">
      {/* ── Header ────────────────────────────────────── */}
      <HStack alignItems="center" justifyContent="space-between">
          <VStack flex={1}>
            <Text
              size="xs"
              color="$textLight400"
              textTransform="uppercase"
              fontWeight="$medium">
              Booking details
            </Text>
            <Heading size="lg" mt="$0.5" numberOfLines={2}>
              {job.title || 'Scheduled job'}
            </Heading>
          </VStack>

        {!job.read && (
          <Badge
            size="sm"
            variant="solid"
            action="warning"
            borderRadius={999}
            px="$3">
            <BadgeIcon as={CircleDot} mr="$1" />
            <BadgeText fontSize="$xs" fontWeight="$semibold">
              New
            </BadgeText>
          </Badge>
        )}
      </HStack>

      <Divider height={0.5} />

      {/* ── Schedule ──────────────────────────────────── */}
      <SectionRow icon={Calendar} iconBg="$primary50" iconColor="$primary600">
        <Heading size="sm">{formatDate(job.startDate)}</Heading>
        <Text size="sm" color="$textLight500" mt="$0.5">
          {formatTime(job.startTime)} – {formatTime(job.endTime)}
        </Text>
      </SectionRow>

      <Divider height={0.5} />

      {/* ── Location ──────────────────────────────────── */}
      <SectionRow icon={MapPin} iconBg="$info50" iconColor="$info600">
        <Heading size="sm">Site Location</Heading>
        <Text size="sm" color="$textLight500" mt="$0.5">
          {job?.project?.completeAddress}
        </Text>
      </SectionRow>

      <Divider height={0.5} />

      {/* ── Job details ───────────────────────────────── */}
      <SectionRow icon={Wrench} iconBg="$warning50" iconColor="$warning600">
        <Heading size="sm">Work summary</Heading>
      </SectionRow>
      <HStack space="sm" px={'$2'} pb={'$2'} alignItems="flex-start">
        <Text size="xs" color="$textLight500" flex={1} lineHeight="$sm">
          {job?.description}
        </Text>
      </HStack>
      {status === 'pending' && (
        <HStack space="md" px="$5" pt="$2" pb="$5">
          {/* Decline */}
          <Button
            variant="outline"
            action="secondary"
            size="lg"
            flex={1}
            borderRadius={12}
            borderColor="$rose400"
            backgroundColor="$rose400"
            onPress={handleDecline}>
            <ButtonIcon color="$white" as={X} mr="$1.5" />
            <ButtonText color="$white">Decline</ButtonText>
          </Button>

          {/* Accept */}
          <Button
            variant="solid"
            action="primary"
            size="lg"
            flex={1.4}
            borderRadius={12}
            onPress={handleAccept}>
            <ButtonText color="$white">Accept </ButtonText>
            <ButtonIcon as={ArrowRight} ml="$1.5" />
          </Button>
        </HStack>
      )}

      {status === 'accepted' && (
        <HStack px="$5" pt="$2" pb="$5">
          <Button variant="outline" size="lg" flex={1} borderRadius={12} borderColor="$rose400" onPress={() => confirm('Cancel accepted booking?', 'The integrator will need to arrange another engineer.', 'Cancel booking', onCancel, true)}><ButtonIcon color="$rose600" as={X} mr="$1.5" /><ButtonText color="$rose600">Cancel booking</ButtonText></Button>
        </HStack>
      )}

      {(status === 'readytostart' || status === 'ready') && (
        <HStack px="$5" pt="$2" pb="$5"><Button size="lg" flex={1} borderRadius={12} backgroundColor="#4f46e5" onPress={() => confirm('Start this job?', 'The booking will be marked as in progress.', 'Start job', onStart)}><ButtonText color="$white">Start job</ButtonText><ButtonIcon as={ArrowRight} ml="$1.5" /></Button></HStack>
      )}

      {(status === 'inprogress' || status === 'progress') && (
        <HStack px="$5" pt="$2" pb="$5"><Button size="lg" flex={1} borderRadius={12} backgroundColor="#4f46e5" onPress={() => confirm('Complete this job?', 'Only complete the booking when the scheduled work is finished.', 'Complete job', onComplete)}><ButtonIcon as={CheckCircle2} mr="$1.5" /><ButtonText color="$white">Complete job</ButtonText></Button></HStack>
      )}

      {/* ── Action buttons ────────────────────────────── */}
    </Card>
  );
}
