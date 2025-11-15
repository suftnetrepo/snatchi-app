import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import Svg, { Circle } from 'react-native-svg';

const ProgressCircleSvg = ({
  progress = 0, // default to 0
  size = 64,
  thickness = 6,
  color = '#3B82F6',
  trackColor = 'rgba(0,0,0,0.15)',
  showLabel = true,
  label,
  labelColor = '$textDark800',
  fontSize = '$sm',
  roundedCaps = true,
}) => {
  // ensure it's always a number between 0–100
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <Box
      width={size}
      height={size}
      position="relative"
      alignItems="center"
      justifyContent="center"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: isNaN(pct) ? 0 : Math.round(pct),
      }}
    >
      <Svg
        width={size}
        height={size}
        rotation={-90} // start at 12 o’clock
        originX={size / 2}
        originY={size / 2}
      >
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={roundedCaps ? 'round' : 'butt'}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </Svg>

      {showLabel && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={fontSize} fontWeight="$bold" color={labelColor}>
            {label ?? `${Math.round(pct)}%`}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ProgressCircleSvg;
