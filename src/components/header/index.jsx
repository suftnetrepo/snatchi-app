/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-redeclare */
/* eslint-disable no-import-assign */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React from 'react'
import { View } from 'react-native'
import { StatusBar } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { YStack, styled, XStack, StyledText, isValidNumber, getStatusBarHeight, StyledCycle, StyledSpacer } from 'fluent-styles';
import { theme } from '../../utils/theme';

const Headers = styled(View, {
  base: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  variants: {
    marginTop: (size = 0) => {
      if (!isValidNumber(size)) {
        throw new Error('Invalid marginTop value')
      }
      return { marginTop: size }
    },
    statusHeight: (height = 0) => {
      return { paddingTop: height }
    }
  }
})

const StyledHeader = ({ statusProps, skipAndroid = false, ...rest }) => {
  return (
    <YStack>
      <StatusBar
        translucent={true}
        backgroundColor={theme.colors.gray[1]}
        barStyle={'dark-content'}
        {...statusProps}
      />
      <Headers statusHeight={getStatusBarHeight(skipAndroid)} {...rest} />
    </YStack>
  )
}

const Header = ({ navigator, fontWeight = theme.fontWeight.normal, fontSize = theme.fontSize.normal, color = theme.colors.gray[800], textProps, title, icon = false, cycleProps, rightIcon, rightIconProps, onPress, ...rest }) => {

  return (
    <XStack justifyContent='flex-start' alignItems='center' flex={1} paddingHorizontal={8}
      paddingVertical={8} {...rest}>
      {
        icon && (
          <StyledCycle  {...cycleProps}>
            <>
              <Icon
                name={'arrow-back'}
                size={30}
                color={theme.colors.gray[700]}
                onPress={() => onPress && onPress()}
              />
              <StyledSpacer marginHorizontal={4} />
            </>
          </StyledCycle>
        )
      }
      {title &&
        <StyledText
          color={color}
          fontWeight={fontWeight}
          fontSize={fontSize}
        >
          {title}
        </StyledText>}
      {
        rightIcon && (
          <>{rightIcon}</>
        )
      }

    </XStack>
  )
}

const Full = ({ children }) => {
  return (
    <>{children}</>
  )
}

StyledHeader.Header = Header
StyledHeader.Full = Full

export { StyledHeader }
