import React, { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {
  YStack,
  XStack,
  StyledText,
} from 'fluent-styles';
import { theme, palettes } from '../../utils/theme';
import { Pressable} from 'react-native'

const LIME      = '#c6ef3e';
const LIME_DARK = '#8bc34a';
const DARK      = '#1a1a1e';
const MUTED     = '#9ca3af';

const DAY_LABELS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toISO(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isoToday() {
  return toISO(new Date());
}

function shiftDate(iso, days) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function getWeekDates(iso) {
  const d      = fromISO(iso);
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return toISO(day);
  });
}

function monthLabel(iso) {
  const d = fromISO(iso);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── WeekStrip ────────────────────────────────────────────────────────────────

export default function WeekStrip({
  selectedDate: selectedDateProp,
  anchorDate: anchorDateProp,
  onSelect,
  onAnchorChange,
  markedDates = {},
}) {
  // Support both controlled and uncontrolled usage
  const [internalSelected, setInternalSelected] = useState(isoToday);
  const [internalAnchor,   setInternalAnchor]   = useState(isoToday);

  const selectedDate = selectedDateProp ?? internalSelected;
  const anchorDate   = anchorDateProp   ?? internalAnchor;

  const handleSelect = useCallback((iso) => {
    setInternalSelected(iso);
    setInternalAnchor(iso);
    onSelect?.(iso);
    onAnchorChange?.(iso);
  }, [onSelect, onAnchorChange]);

  const handleAnchorChange = useCallback((iso) => {
    setInternalAnchor(iso);
    onAnchorChange?.(iso);
  }, [onAnchorChange]);

  const weekDates  = getWeekDates(anchorDate);
  const todayIso   = isoToday();
  const isThisWeek = getWeekDates(todayIso)[0] === weekDates[0];

  const prevWeek = () => handleAnchorChange(shiftDate(anchorDate, -7));
  const nextWeek = () => handleAnchorChange(shiftDate(anchorDate,  7));
  const goToday  = () => handleSelect(todayIso);

  return (
    <YStack
      backgroundColor={palettes.white}
      borderBottomWidth={1}
      borderBottomColor={theme.colors.gray[100]}
    >
      {/* ── Header row ── */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={16}
        paddingTop={10}
        paddingBottom={4}
      >
        <NavButton onPress={prevWeek} icon="chevron-left" />

        <XStack alignItems="center" gap={10}>
          <StyledText fontSize={14} fontWeight="700" color={DARK}>
            {monthLabel(weekDates[3])}
          </StyledText>

          {!isThisWeek && (
            <Pressable
              onPress={goToday}
              paddingHorizontal={10}
              paddingVertical={3}
              borderRadius={12}
              backgroundColor={LIME}
            >
              <StyledText fontSize={11} fontWeight="700" color={DARK}>
                Today
              </StyledText>
            </Pressable>
          )}
        </XStack>

        <NavButton onPress={nextWeek} icon="chevron-right" />
      </XStack>

      {/* ── Day cells ── */}
      <XStack alignItems="center" paddingHorizontal={4} paddingBottom={10}>
        {weekDates.map((iso) => {
          const d          = fromISO(iso);
          const isSelected = iso === selectedDate;
          const isToday    = iso === todayIso;
          const hasDot     = !!markedDates[iso];

          return (
            <DayCell
              key={iso}
              label={DAY_LABELS[d.getDay()]}
              dayNum={d.getDate()}
              isSelected={isSelected}
              isToday={isToday}
              hasDot={hasDot}
              onPress={() => handleSelect(iso)}
            />
          );
        })}
      </XStack>
    </YStack>
  );
}

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({ onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      width={32}
      height={32}
      borderRadius={16}
      backgroundColor={theme.colors.gray[100]}
      alignItems="center"
      justifyContent="center"
    >
      <Icon name={icon} size={16} color={DARK} />
    </Pressable>
  );
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

function DayCell({ label, dayNum, isSelected, isToday, hasDot, onPress }) {
  return (
    <Pressable
      flex={1}
      alignItems="center"
      paddingVertical={2}
      onPress={onPress}
    >
      {/* Day name */}
      <StyledText
        fontSize={11}
        fontWeight="500"
        color={isSelected ? LIME_DARK : MUTED}
        marginBottom={5}
      >
        {label}
      </StyledText>

      {/* Date circle */}
      <XStack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={isSelected ? LIME : 'transparent'}
        alignItems="center"
        justifyContent="center"
      >
        <StyledText
          fontSize={17}
          fontWeight={isSelected || isToday ? '800' : '600'}
          color={isSelected ? DARK : isToday ? LIME_DARK : theme.colors.gray[800]}
        >
          {dayNum}
        </StyledText>
      </XStack>

      {/* Workout dot */}
      <XStack
        width={5}
        height={5}
        borderRadius={2.5}
        marginTop={4}
        backgroundColor={
          hasDot
            ? isSelected ? DARK : LIME_DARK
            : 'transparent'
        }
      />
    </Pressable>
  );
}