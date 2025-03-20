/* eslint-disable prettier/prettier */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useMemo } from 'react';
import { FlatList } from 'react-native'
import { theme, palettes } from '../../utils/theme';
import { YStack, XStack, StyledSpacer, StyledText, StyledButton } from 'fluent-styles';

const ColorPicker = React.memo(({ color, onPress }) => {
    const [selectedColor, setSelectedColor] = useState(color);

    useEffect(() => {
        setSelectedColor(color);
    }, [color]);

    const handleClick = (color) => {
        setSelectedColor(color);
        if (onPress) onPress(color);
    };

    const colorData = useMemo(() => {
        return Object.keys(palettes).reduce((acc, colorFamily) => {
            const shades = Object.keys(palettes[colorFamily])
                .filter((key) => parseInt(key) >= 600 && parseInt(key) <= 900)
                .map((shade) => ({
                    color: palettes[colorFamily][shade],
                    shade
                }));
            return [...acc, ...shades];
        }, []);
    }, [palettes]);

    const renderItem = ({ item }) => (
        <StyledButton
            height={48}
            width={48}
            borderRadius={5}
            marginVertical={10}
            marginHorizontal={5}
            backgroundColor={item.color}
            onPress={() => handleClick(item.color)}
        />
    );

    return (
        <YStack padding={10} justifyContent='center' alignItems='center'>
            {selectedColor && (
                <XStack flex={1} justifyContent='center' alignItems='center' height={100} width={100} marginTop={20} borderRadius={10} backgroundColor={selectedColor}>
                    <StyledText fontSize={theme.fontSize.small} color={theme.colors.gray[1]}>
                        {selectedColor}
                    </StyledText>
                </XStack>
            )}
            <StyledSpacer marginVertical={8} />
            <FlatList
                data={colorData}
                renderItem={renderItem}
                keyExtractor={(item) => item.color}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
            <StyledSpacer marginVertical={4} />
        </YStack>
    );
});

export default ColorPicker;
