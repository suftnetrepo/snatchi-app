/* eslint-disable prettier/prettier */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { forwardRef } from 'react';
import { TextInput, Platform } from 'react-native';
import { YStack, XStack, StyledSpacer, StyledText } from 'fluent-styles';
import { isValidColor, isValidNumber, isValidString } from '../../utils/help';
import { styled } from '../../utils/styled';
import { theme } from '../../utils/theme';


const StyledInputText = styled(TextInput, {
    base: {
        borderColor: theme.colors.gray[800],
        borderWidth: 1,
        borderRadius: 30,
        backgroundColor: theme.colors.gray[1],
        width: '100%',
        height : 40,
        color: theme.colors.gray[800],
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: theme.fontSize.normal,
        placeholderTextColor: theme.colors.gray[1],
    },
    variants: {
        fontWeight: (size = theme.fontWeight.normal) => {
            if (!isValidString(size)) {
                throw new Error('Invalid fontWeight value');
            }
            return { fontWeight: size };
        },
        color: (color = theme.colors.gray[800]) => {
            if (!isValidColor(color)) {
                throw new Error('Invalid color value');
            }
            return { color: color };
        },
        fontSize: (size = theme.fontSize.normal) => {
            if (!isValidNumber(size)) {
                throw new Error('Invalid fontSize value');
            }
            return { fontSize: size };
        },
        fontFamily: font => {
            if (!font) return
            return {
                fontFamily: font
            }
        },
        textAlign: (align = 'left') => {
            const validAlignments = ['auto', 'left', 'right', 'center', 'justify'];
            if (!validAlignments.includes(align)) {
                throw new Error('Invalid textAlign value');
            }
            return { textAlign: align };
        },
        borderRadius: (value = 16) => {
            if (!isValidNumber(value)) {
                throw new Error('Invalid borderRadius value');
            }
            return { borderRadius: value };
        },
        borderColor: (value = theme.colors.gray[100]) => {
            if (!isValidColor(value)) {
                throw new Error('Invalid borderColor value');
            }
            return { borderColor: value };
        },
        backgroundColor: (value = theme.colors.gray[1]) => {
            if (!isValidColor(value)) {
                throw new Error('Invalid backgroundColor value');
            }
            return { backgroundColor: value };
        },
        noBorder: {
            true: { borderWidth: 0 }
        },
        placeholderTextColor: (value = theme.colors.gray[800]) => {
            if (!isValidColor(value)) {
                throw new Error('Invalid placeholderTextColor value');
            }
            return { placeholderTextColor: value };
        }
    }
});

const StyledInput = forwardRef(({ label, icon, containerProps, borderColor, errorMessage, error, errorProps, labelProps, ...rest }, ref) => {
    return (
        <>
            {
                label && (
                    <YStack width={'100%'} justifyContent='flex-start' alignItems='flex-start' {...containerProps} >
                        <StyledText paddingHorizontal={8} color={theme.colors.gray[800]} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.normal} {...labelProps}>
                            {label}
                        </StyledText>
                        <StyledSpacer marginVertical={4} />
                    </YStack>
                )
            }
            <XStack>
                <StyledInputText placeholderTextColor={theme.colors.gray[400]} ref={ref} {...rest} borderColor={error ? theme.colors.pink[500] : borderColor} />
                {
                    icon && (
                        <>{icon}</>
                    )
                }
            </XStack>          
            {
                errorMessage && (
                    <YStack width={'100%'} justifyContent='flex-start' alignItems='flex-start' {...containerProps} >
                        <StyledSpacer marginVertical={1} />
                        <StyledText marginHorizontal={8} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.small} color={theme.colors.pink[500]} {...errorProps}>
                            {errorMessage}
                        </StyledText>
                    </YStack>
                )
            }
        </>
    )
})

const StyledIconInput = forwardRef(({ label, icon, containerProps, borderColor, errorMessage, error, errorProps, labelProps, ...rest }, ref) => {
    return (
        <YStack flex={1} justifyContent='flex-start' alignItems='flex-start'>
            {
                label && (
                    <YStack justifyContent='flex-start' alignItems='flex-start' {...containerProps} >
                        <StyledText paddingHorizontal={8} color={theme.colors.gray[800]} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.normal} {...labelProps}>
                            {label}
                        </StyledText>
                        <StyledSpacer marginVertical={4} />
                    </YStack>
                )
            }
            <XStack gap={2} justifyContent='flex-start' alignItems='flex-start'>
                <StyledInputText placeholderTextColor={theme.colors.gray[400]} ref={ref} {...rest} borderColor={error ? theme.colors.pink[500] : borderColor} />
                {
                    icon && (
                        <>{icon}</>
                    )
                }
            </XStack>          
            {
                errorMessage && (
                    <YStack justifyContent='flex-start' alignItems='flex-start' {...containerProps} >
                        <StyledSpacer marginVertical={1} />
                        <StyledText marginHorizontal={8} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.small} color={theme.colors.pink[500]} {...errorProps}>
                            {errorMessage}
                        </StyledText>
                    </YStack>
                )
            }
        </YStack>
    )
})

const StyledMultiInput = ({ label, errorMessage, borderColor, error, errorProps, labelProps, ...rest }) => {
    return (
        <YStack width={'100%'} justifyContent='flex-start' alignItems='flex-start'>
            {
                label && (
                    <>
                        <StyledSpacer marginVertical={4} />
                        <StyledText paddingHorizontal={8} color={theme.colors.gray[800]} fontSize={theme.fontSize.normal} fontWeight={theme.fontWeight.normal} {...labelProps}>
                            {label}
                        </StyledText>
                        <StyledSpacer marginVertical={4} />
                    </>

                )
            }
            <StyledInputText borderRadius={16} textAlignVertical='top' multiline numberOfLines={5} inputMode='text' {...rest} borderColor={error ? theme.colors.pink[500] : borderColor} />
            {
                errorMessage && (
                    <>
                        <StyledSpacer marginVertical={1} />
                        <StyledText marginHorizontal={8} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.small} color={theme.colors.pink[500]} {...errorProps}>
                            {errorMessage}
                        </StyledText>
                    </>
                )
            }

        </YStack>
    )
}

export { StyledInput, StyledMultiInput, StyledIconInput }
export default StyledInputText