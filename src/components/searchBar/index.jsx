/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { styled, StyledSpacer, isValidColor, StyledCycle, isValidNumber, InputText } from 'fluent-styles';
import { theme } from '../../utils/theme';
import { StyledMIcon } from "../icon";
import { View } from "react-native";

const SearchBar = styled(View, {
    base: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 1,
        paddingHorizontal: 1,
        height: 50,
        borderRadius: 100,
        backgroundColor: theme.colors.gray[1],
    },
    variants: {
        borderColor: color => {
            if (!color) return
            if (!isValidColor(color)) {
                throw new Error('Invalid color value')
            }
            return { borderColor: color }
        },
        borderRadius: (size = 32) => {
            if (!isValidNumber(size)) {
                throw new Error('Invalid borderRadius value')
            }
            return { borderRadius: size }
        },
        backgroundColor: color => {
            if (!color) return
            if (!isValidColor(color)) {
                throw new Error('Invalid color value')
            }
            return { backgroundColor: color }
        }
    }
})

const StyledSearchBar = ({ size = 24, name = 'search', placeholder = 'Search item by name', onPress, ...rest }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = () => {
        if (onPress && searchQuery) {
            onPress(searchQuery)
        }
    }

    return (
        <SearchBar flex={1} borderWidth={1} borderColor={theme.colors.gray[400]} {...rest}>
            <InputText marginHorizontal={8} flex={1} placeholder={placeholder} fontSize={theme.fontSize.normal} value={searchQuery}
                onChangeText={setSearchQuery} returnKeyType='search' noBorder={true} onSubmitEditing={handleSubmit} />
            <StyledSpacer marginHorizontal={2} />
            <StyledCycle borderWidth={1} borderColor={theme.colors.cyan[400]} backgroundColor={theme.colors.cyan[500]}>
                {
                    <StyledMIcon size={size} name={name} color={theme.colors.gray[1]} onPress={() => handleSubmit()} />
                }
            </StyledCycle>
        </SearchBar>
    )
}

export { StyledSearchBar }