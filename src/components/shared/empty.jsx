/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React from "react";
import { YStack, StyledText } from 'fluent-styles';
import { StyledMIcon } from "../icon";
import { fontStyles, theme } from '../../utils/theme';

const EmptyView = ({ icon = "notifications-active", title, description }) => {
 
    return (
        <YStack flex={1}  justifyContent="center" paddingHorizontal={32} paddingVertical={1}
            alignItems="center">
            {
                icon && (
                    <StyledMIcon
                        size={60}
                        name={icon}
                        color={theme.colors.gray[800]}
                    />
                )
            }
            {
                title && (
                    <StyledText
                        fontFamily={fontStyles.Roboto_Regular}
                        fontSize={theme.fontSize.large}
                        fontWeight={theme.fontWeight.bold}
                        paddingHorizontal={8}
                        color={theme.colors.gray[800]}>
                        {title}
                    </StyledText>
                )
            }
            {
                description && (
                    <StyledText
                        fontFamily={fontStyles.Roboto_Regular}
                        fontSize={theme.fontSize.normal}
                        fontWeight={theme.fontWeight.normal}
                        paddingHorizontal={8}
                        paddingVertical={8}
                        color={theme.colors.gray[800]}>
                        {description}
                    </StyledText>
                )
            }
          
        </YStack>
    )

}

export default EmptyView