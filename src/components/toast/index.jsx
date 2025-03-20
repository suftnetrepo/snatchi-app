/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React from "react";
import { View } from "react-native";
import { Toast } from "react-native-toast-notifications";
import {styled, StyledSpacer, StyledText } from 'fluent-styles';
import { theme } from '../../utils/theme';

const ToastView = styled(View, {
    base: {
        maxWidth: "95%",
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginVertical: 4,
        borderRadius: 8,
        borderLeftWidth: 6,
        justifyContent: "center",
        paddingLeft: 16,
    },
    variants: {
        type: {
            'error': {
                borderLeftColor: theme.colors.red[500],
                backgroundColor: theme.colors.gray[800],
            },
            'success': {
                borderLeftColor: theme.colors.green[500],
                backgroundColor: theme.colors.gray[100],
            }
        }
    }
})

const StyledToast = ({ toast }) => {
    return (
        <ToastView
            type={toast.data.message_type}
        >
            <StyledText
                fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.large} color={toast.data.message_type ==="error" ? theme.colors.gray[1]: theme.colors.gray[800]}
            >
                {toast.data.title}
            </StyledText>
            <StyledSpacer marginVertical={1} />
            <StyledText  fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.large} color={toast.data.message_type ==="error" ? theme.colors.gray[1]: theme.colors.gray[800]}>{toast.message}</StyledText>
        </ToastView>
    )
}

const ShowToast = (title = 'Confirmation', message, message_type = 'success') => {
    Toast.show(
        message,
        {
            type: "custom_toast",
            placement: 'bottom',
            animationDuration: 100,
            data: {
                title,
                message_type
            },
        }
    )
}

export { StyledToast, ShowToast }