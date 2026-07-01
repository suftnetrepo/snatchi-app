import React, {useState, useCallback} from 'react';
import {Alert, ScrollView} from 'react-native';

// ── gluestack-ui v3 component imports ────────────────────

import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
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
  Clock,
  MapPin,
  Wrench,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  CircleDot,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface JobNotification {
  id: string;
  scheduleId: string;
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
  projectName: string;
  projectDescription: string;
}

interface JobCardProps {
  job: JobNotification | null;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
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

function getDurationHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 1440; // wrap past midnight (24 * 60)

  return Math.round((mins / 60) * 100) / 100;
}

function parseLocation(raw: string): {
  postcode: string;
  area: string;
  city: string;
} {
  const parts = raw.split(',').map(s => s.trim());
  return {
    postcode: parts[0] ?? '',
    area: parts[1] ?? '',
    city: parts[2] ? parts[2].replace('City of ', '') : '',
  };
}

function parseDescription(raw: string): string[] {
  // Split on capital-letter boundaries that signal new task items
  const items = raw
    .split(
      /(?=Video Conferencing|Wireless Presentation|Smart Audio|Automated Lighting|Touch Panel)/,
    )
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length >= 2) return items;

  // Fallback: split on any capital letter sequence that looks like a title
  return raw
    .split(/(?=[A-Z][a-z]+\s[A-Z])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function truncateSiteName(name: string): {title: string; subtitle: string} {
  const cleaned = name.replace(/\.$/, '');
  if (cleaned.length <= 42) return {title: cleaned, subtitle: ''};

  const breakpoint = cleaned.lastIndexOf(' ', 42);
  const title =
    breakpoint > 0 ? cleaned.slice(0, breakpoint) : cleaned.slice(0, 42);
  const subtitle = cleaned.slice(title.length).trim();
  return {title, subtitle};
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
// Main component
// ═══════════════════════════════════════════════════════════

export default function JobCard({job, onAccept, onDecline}: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>(
    'pending',
  );

  const jobId = job?.id ?? '';

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

  console.log('JobCard job data:', job); // Debugging log

  // Derived data
  const {title: jobTitle, subtitle: jobSubtitle} = truncateSiteName(
    job.siteName,
  );

  // const location = parseLocation(job.siteLocation);
  // const tasks = parseDescription(job.projectDescription);
  const duration = getDurationHours(job.startTime, job.endTime);
  // const visibleTasks = expanded ? tasks : tasks.slice(0, 3);
  // const hiddenCount = tasks.length - 3;

  // ─── Main card ──────────────────────────────────────

  return (
    <Card size="lg" borderRadius={16} bg="$background0" overflow="hidden">
      {/* ── Header ────────────────────────────────────── */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
  
      >
        <VStack>
          <Text
            size="xs"
            color="$textLight400"
            textTransform="uppercase"
            fontWeight="$medium">
            Incoming request
          </Text>
          <Heading size="lg" mt="$0.5">
            New job
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
          {job.completeAddress}
        </Text>
      </SectionRow>

      <Divider height={0.5} />

      {/* ── Job details ───────────────────────────────── */}
      <SectionRow icon={Wrench} iconBg="$warning50" iconColor="$warning600">
        <Heading size="sm">{job.projectName}</Heading>
        {/* Task checklist */}
        <VStack space="xs" mt="$2.5">
          <HStack space="sm" alignItems="flex-start">
            <Box
              width={6}
              height={6}
              borderRadius={999}
              bg="$primary400"
              mt="$1.5"
              opacity={0.6}
            />
            <Text size="xs" color="$textLight500" flex={1} lineHeight="$sm">
              {job?.projectDescription}
            </Text>
          </HStack>
        </VStack>
      </SectionRow>

      {/* ── Action buttons ────────────────────────────── */}
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
    </Card>
  );
}
