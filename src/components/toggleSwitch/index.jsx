/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react"
import { XStack, StyledButton, StyledText } from 'fluent-styles';
import { theme } from '../../utils/theme';

const StyledToggleSwitch = ({ defaultTab, tabs, onPress }) => {
    const [selected, setSelected] = useState();
    const tabArray = tabs?.split(",");

    useEffect(() => {
        setSelected(defaultTab)
    }, [defaultTab])

    const onSelected = (tab) => {
        setSelected(tab);
        if (onPress) onPress(tab);
    };

    return (
        <XStack
            justifyContent="space-between"
            borderRadius={35}
            paddingVertical={0}
            paddingHorizontal={0}
            borderColor={theme.colors.gray[300]}
            backgroundColor={theme.colors.gray[300]}
            alignItems="center"
        >
            {
                tabArray.map((tab, index) => (
                    <StyledButton
                        key={index}
                        borderRadius={35}
                        selected={selected === tab}
                        flex={1}
                        onPress={() => onSelected(tab)}
                    >
                        <StyledText
                            paddingVertical={8}
                            paddingHorizontal={8}
                            color={theme.colors.gray[1]}
                            selected={selected === tab}
                        >
                            {tab}
                        </StyledText>
                    </StyledButton>
                ))
            }
        </XStack>
    );
};

export { StyledToggleSwitch }