/**
 * StyledTimeline.jsx
 * ──────────────────
 * A fully reusable, data-driven vertical timeline component for fluent-styles.
 *
 * Features:
 *  • Accepts JSON data OR React children (or both)
 *  • Animated dot entrance on mount
 *  • Customisable dot size, colour, line style, connector colour
 *  • Time label column on the left (start + end)
 *  • Right content slot: any ReactNode per item
 *  • Variants: default · compact · spacious
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, Pressable } from 'react-native';

// ─── Size tokens ──────────────────────────────────────────────────────────────

const VARIANT_GAP = {
  compact:  12,
  default:  20,
  spacious: 32,
};

// ─── Animated dot ─────────────────────────────────────────────────────────────

const TimelineDot = ({ size, color, borderColor, shape, animated: anim, delay }) => {
  const scale = useRef(new Animated.Value(anim ? 0 : 1)).current;

  useEffect(() => {
    if (!anim) return;
    Animated.timing(scale, {
      toValue:         1,
      duration:        300,
      delay,
      easing:          Easing.out(Easing.back(1.8)),
      useNativeDriver: true,
    }).start();
  }, []);

  const dotStyle = (() => {
    const base = { width: size, height: size, borderRadius: size / 2 };
    if (shape === 'circle') {
      return { ...base, backgroundColor: 'transparent', borderWidth: 2, borderColor: color };
    }
    if (shape === 'ring') {
      return { ...base, backgroundColor: borderColor, borderWidth: 2.5, borderColor: color };
    }
    // filled (default)
    return { ...base, backgroundColor: color };
  })();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={dotStyle} />
    </Animated.View>
  );
};

// ─── Default item renderer ────────────────────────────────────────────────────

const DefaultItemContent = ({ item }) => (
  <View style={{ flex: 1, gap: 4 }}>
    {item.title && (
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
        {item.title}
      </Text>
    )}
    {item.subtitle && (
      <Text style={{ fontSize: 13, color: '#6B7280' }}>
        {item.subtitle}
      </Text>
    )}
    {item.description && (
      <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
        {item.description}
      </Text>
    )}
  </View>
);

// ─── StyledTimeline ───────────────────────────────────────────────────────────

/**
 * StyledTimeline — vertical data-driven timeline.
 *
 * @example JSON-driven (minimal)
 * ```jsx
 * <StyledTimeline
 *   items={[
 *     { id: '1', time: '09:00', title: 'Morning Run',    subtitle: 'Cardio · 5km' },
 *     { id: '2', time: '11:30', title: 'Strength Class', subtitle: 'Upper body'   },
 *     { id: '3', time: '14:00', title: 'Yoga',           subtitle: 'Recovery'     },
 *   ]}
 * />
 * ```
 *
 * @example Custom renderItem
 * ```jsx
 * <StyledTimeline
 *   items={scheduleItems}
 *   renderItem={(item) => <ScheduleCard item={item} />}
 * />
 * ```
 *
 * @example Mixed: data + inline children
 * ```jsx
 * <StyledTimeline items={scheduleItems}>
 *   <NoteCard note="Don't forget to hydrate!" />
 * </StyledTimeline>
 * ```
 *
 * @example Custom colours
 * ```jsx
 * <StyledTimeline
 *   items={items}
 *   colors={{ dot: '#2196f3', line: '#bbdefb' }}
 *   dotShape="ring"
 *   variant="spacious"
 * />
 * ```
 *
 * Props
 * ─────
 * items            TimelineItem[]   Array of timeline entries (id + time required)
 * renderItem       func             Custom renderer (item, index) => ReactNode
 * children         ReactNode        Appended as time-less entries after items
 * variant          string           'default' | 'compact' | 'spacious'  (default: 'default')
 * dotShape         string           'filled' | 'circle' | 'ring'        (default: 'filled')
 * dotSize          number           Dot diameter in px                  (default: 10)
 * timeColumnWidth  number           Width of the time label column      (default: 56)
 * timeGap          number           Gap between time column and content (default: 16)
 * animated         bool             Animate dots on mount               (default: true)
 * colors           object           { line, dot, dotBorder, timeText, endTimeText }
 * fonts            object           { startFontSize, endFontSize, startFontWeight, endFontWeight }
 * onItemPress      func             Called with item when a row is pressed
 *
 * TimelineItem shape
 * ──────────────────
 * id          string        Required. Unique key.
 * time        string        Required. Primary time label e.g. "09:00".
 * endTime     string        Optional. Secondary time label e.g. "11:00".
 * content     ReactNode     Optional. Fully custom content (overrides renderItem + defaults).
 * title       string        Optional. Used by default renderer.
 * subtitle    string        Optional. Used by default renderer.
 * description string        Optional. Used by default renderer.
 * meta        object        Optional. Pass-through for extra data.
 */
const StyledTimeline = ({
  items           = [],
  renderItem,
  children,
  variant         = 'default',
  dotShape        = 'filled',
  dotSize         = 10,
  timeColumnWidth = 56,
  timeGap         = 16,
  animated        = true,
  colors: colorsProp,
  getItemColors,
  onItemPress,
  fonts: fontsProp,
}) => {
  const C = {
    line:        colorsProp?.line        ?? '#E5E7EB',
    dot:         colorsProp?.dot         ?? '#8bc34a',
    dotBorder:   colorsProp?.dotBorder   ?? '#FFFFFF',
    timeText:    colorsProp?.timeText    ?? '#111827',
    endTimeText: colorsProp?.endTimeText ?? '#9CA3AF',
  };

  const F = {
    startFontSize:   fontsProp?.startFontSize   ?? 14,
    endFontSize:     fontsProp?.endFontSize     ?? 12,
    startFontWeight: fontsProp?.startFontWeight ?? '400',
    endFontWeight:   fontsProp?.endFontWeight   ?? '400',
  };

  const gap = VARIANT_GAP[variant] ?? VARIANT_GAP.default;

  // Convert React children into pseudo-items (no time label)
  const childItems = React.Children.toArray(children).map((child, i) => ({
    id:      `__child_${i}`,
    time:    '',
    content: child,
  }));

  const allItems = [...items, ...childItems];

  return (
    <View>
      {allItems.map((item, index) => {
        const isLast  = index === allItems.length - 1;
        const hasTime = !!item.time;
        const itemColors = getItemColors?.(item, index) || {};
        const resolvedColors = {
          line: itemColors.line ?? C.line,
          dot: itemColors.dot ?? C.dot,
          dotBorder: itemColors.dotBorder ?? C.dotBorder,
          timeText: itemColors.timeText ?? C.timeText,
          endTimeText: itemColors.endTimeText ?? C.endTimeText,
        };

        const resolvedContent = item.content
          ? item.content
          : renderItem
          ? renderItem(item, index)
          : <DefaultItemContent item={item} />;

        return (
          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'stretch' }}>

            {/* ── Left: time labels ── */}
            <View style={{ width: timeColumnWidth, alignItems: 'flex-end', paddingRight: 8 }}>
              <View style={{ alignItems: 'flex-end', gap: 2, paddingTop: 2 }}>
                {hasTime && (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize:   F.startFontSize,
                      fontWeight: F.startFontWeight,
                      color:      resolvedColors.timeText,
                    }}
                  >
                    {item.time}
                  </Text>
                )}
                {item.endTime ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize:   F.endFontSize,
                      fontWeight: F.endFontWeight,
                      color:      resolvedColors.endTimeText,
                    }}
                  >
                    {item.endTime}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* ── Centre: dot + connector line ── */}
            <View style={{ alignItems: 'center', width: dotSize + 12 }}>
              <View style={{ paddingTop: 4 }}>
                <TimelineDot
                  size={dotSize}
                  color={resolvedColors.dot}
                  borderColor={resolvedColors.dotBorder}
                  shape={dotShape}
                  animated={animated}
                  delay={index * 60}
                />
              </View>
              {!isLast && (
                <View
                  style={{
                    flex:            1,
                    width:           1.5,
                    backgroundColor: resolvedColors.line,
                    marginTop:       4,
                    minHeight:       gap,
                  }}
                />
              )}
            </View>

            {/* ── Right: content ── */}
            <View style={{ flex: 1, paddingLeft: timeGap, paddingBottom: isLast ? 0 : gap }}>
              <Pressable
                onPress={() => onItemPress?.(item)}
                style={{ flex: 1 }}
              >
                {resolvedContent}
              </Pressable>
            </View>

          </View>
        );
      })}
    </View>
  );
};

export { StyledTimeline };
export default StyledTimeline;