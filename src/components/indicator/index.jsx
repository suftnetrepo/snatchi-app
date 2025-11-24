import React from 'react';
import {
    YStack,
    StyledHeader,
    StyledSafeAreaView,
    StyledSpinner
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { Platform } from 'react-native';

const StyledIndicator = () => {

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader
                skipAndroid={Platform.OS === 'android' ? false : true}
                marginHorizontal={8}
                statusProps={{ translucent: true, hidden: true }}>
                <StyledHeader.Full>
                </StyledHeader.Full>
            </StyledHeader>
            <YStack flex={1} justifyContent="flex-start"
                alignItems="center" backgroundColor={theme.colors.gray[1]}>
                <StyledSpinner />
            </YStack>
        </StyledSafeAreaView>
    )
}

export { StyledIndicator }