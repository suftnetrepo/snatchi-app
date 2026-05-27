# Engineer Timeline Status Color Coding Implementation

## Overview

The engineer mobile schedule timeline now uses a centralized schedule status theme, a reusable status badge component, and subtle per-status timeline indicators. The layout and navigation remain unchanged.

## Status Theme Mapping

Shared theme source:

- `Pending`: soft indigo, schedule icon
- `Accepted`: green, check-circle icon
- `Approved`: blue, verified icon
- `AwaitingPayment`: orange, payments icon
- `ReadyToStart`: bright green, play-circle-filled icon
- `InProgress`: yellow/gold, autorenew icon
- `Completed`: green, task-alt icon
- `Cancelled`: red, cancel icon
- `PaymentFailed`: red, error icon
- `Declined`: red, thumb-down icon
- `Paid`: green, payments icon
- `Unknown`: neutral gray fallback

## Normalization Logic

Shared normalization now supports legacy scheduler values:

- `Progress` -> `InProgress`
- `In Progress` -> `InProgress`
- `Ready` -> `ReadyToStart`
- `Canceled` -> `Cancelled`

This keeps badge styling, timeline indicators, and schedule marker colors aligned even when backend values vary.

## Reusable Components Added

### `ScheduleStatusBadge`

Reusable component added for schedule status display:

- icon + text for non-color-only communication
- themed background, text, and border
- normalized status lookup
- accessible label for screen readers
- small and medium size variants

### Timeline enhancement

The shared timeline component now accepts a per-item color resolver so each row can tint:

- timeline dot
- connector line
- optional time text colors in future without further API changes

## Screens Updated

### Engineer schedule timeline

Updated the engineer schedule timeline cards to:

- replace the old flat badge styling with `ScheduleStatusBadge`
- tint card border accents by normalized status
- color timeline dots and connector lines by status

### Engineer dashboard recent timeline

Updated the recent schedule timeline on the dashboard to use the same badge and row coloring so both schedule surfaces remain consistent.

### Engineer dashboard aggregate badges

Updated the dashboard aggregate summary badges so `Accepted`, `ReadyToStart`, and `InProgress` no longer fall back to gray.

## Accessibility Considerations

- Status communication is no longer color-only; badges include both icon and readable text.
- Badge palettes use high-contrast text against light backgrounds.
- A neutral fallback theme is used for unknown statuses.
- The implementation works with the current light-theme UI without changing screen structure.

## Files Updated

- `src/constants/scheduleStatusTheme.ts`
- `src/components/shared/ScheduleStatusBadge.jsx`
- `src/components/timeline/index.jsx`
- `src/components/calender/calendarStripe.jsx`
- `src/components/dashboard/index.jsx`
- `src/hooks/useScheduler.jsx`

## Future Enhancements

- Extend the shared schedule theme into other schedule-related filters and cards.
- Add dark-theme token variants if the app introduces runtime theme switching.
- Use per-status calendar day dots in the week strip if the UX needs date-level status emphasis.