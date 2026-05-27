import React from 'react';
import {View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StyledText} from 'fluent-styles';
import {fontStyles} from '../../utils/fontStyles';
import {theme} from '../../utils/theme';
import {
  getScheduleStatusLabel,
  getScheduleStatusTheme,
  normalizeScheduleStatus,
} from '../../constants/scheduleStatusTheme';

const badgeSizes = {
  sm: {
    icon: 14,
    fontSize: theme.fontSize.micro,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  md: {
    icon: 16,
    fontSize: theme.fontSize.micro,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
};

const ScheduleStatusBadge = ({status, size = 'md', style}) => {
  const normalizedStatus = normalizeScheduleStatus(status);
  const statusTheme = getScheduleStatusTheme(normalizedStatus);
  const statusLabel = getScheduleStatusLabel(normalizedStatus);
  const dimensions = badgeSizes[size] || badgeSizes.md;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Schedule status ${statusLabel}`}
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: dimensions.gap,
          paddingHorizontal: dimensions.paddingHorizontal,
          paddingVertical: dimensions.paddingVertical,
          borderRadius: 999,
          backgroundColor: statusTheme.bg,
          borderWidth: 1,
          borderColor: statusTheme.border,
        },
        style,
      ]}>
      <Icon
        name={statusTheme.icon}
        size={dimensions.icon}
        color={statusTheme.text}
      />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.medium}
        fontSize={dimensions.fontSize}
        color={statusTheme.text}>
        {statusLabel}
      </StyledText>
    </View>
  );
};

export default ScheduleStatusBadge;