/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React from 'react';
import {
    YStack,
    XStack,
    StyledText,
    StyledBadge,
    StyledSpacer,
    StyledCycle
} from 'fluent-styles';
import { fontStyles, theme } from '../../utils/theme';
import { StyledMIcon } from '../icon';
import { generateShades, shortDateConverter, formatTimeFromDate } from '../../utils/help';

const EventDetails = ({ event, onCancel }) => {
    const { title, date, description, category, startTime, endTime, location } = event

    const RenderHeader = ({ category, onCancel }) => {
        const { lighter, darker } = generateShades(category?.color_code || theme.colors.gray[300])
        return (
            <XStack justifyContent='space-between' alignItems='center' >
                <StyledBadge
                    fontFamily={fontStyles.Roboto_Regular}
                    color={darker}
                    backgroundColor={lighter}
                    fontWeight={theme.fontWeight.bold}
                    fontSize={theme.fontSize.normal}
                    paddingHorizontal={5}
                    paddingVertical={2}
                >
                    {category?.name}
                </StyledBadge>
                <StyledMIcon
                    name="cancel"
                    size={48}
                    color={theme.colors.gray[900]}
                    onPress={() => onCancel && onCancel()}
                />
            </XStack>
        )
    }
  
    return (
        <YStack paddingHorizontal={16} >
            <RenderHeader category={category} onCancel={() => onCancel && onCancel()} />         
            <StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.bold} fontSize={theme.fontSize.normal} color={theme.colors.gray[800]}>
                {title}
            </StyledText>
            <StyledSpacer marginVertical={2} />
            <StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.normal} color={theme.colors.gray[500]}>
                {description}
            </StyledText>
            <XStack justifyContent='flex-start' marginTop={16} paddingVertical={8} paddingHorizontal={8} alignItems='center' borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[100]} borderRadius={32}>
                <StyledCycle borderWidth={1} borderColor={theme.colors.gray[400]}>
                    <StyledMIcon
                        name="calendar-today"
                        size={16}
                        color={theme.colors.gray[900]}
                    />
                </StyledCycle>
                <StyledSpacer marginHorizontal={4} />
                <StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.normal} color={theme.colors.gray[800]}>
                    {shortDateConverter(date)}
                </StyledText>            
                <XStack justifyContent='flex-start' alignItems='center' gap={2} paddingVertical={8} paddingHorizontal={8}  >
                    <XStack justifyContent='flex-start' alignItems='center' gap={1}>
                        <StyledText paddingHorizontal={2} fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.medium} color={theme.colors.gray[800]}>
                            {formatTimeFromDate(startTime)}
                        </StyledText>
                    </XStack>
                    <StyledText paddingHorizontal={1} fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.normal} color={theme.colors.gray[800]}>
                        -
                    </StyledText>
                    <XStack justifyContent='flex-start' alignItems='center' gap={1}>
                        <StyledText fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.medium} color={theme.colors.gray[800]}>
                            {formatTimeFromDate(endTime)}
                        </StyledText>
                    </XStack>
                </XStack>
            </XStack>
            <XStack  justifyContent='flex-start' marginTop={8} paddingHorizontal={8} paddingVertical={8} alignItems='center' borderColor={theme.colors.gray[200]} backgroundColor={theme.colors.gray[100]} borderRadius={32}>
                <StyledCycle borderWidth={1} borderColor={theme.colors.gray[400]}>
                    <StyledMIcon
                        name="my-location"
                        size={24}
                        color={theme.colors.gray[900]}
                    />
                </StyledCycle>
                <StyledSpacer marginHorizontal={4} />
                <StyledText flex={1} fontFamily={fontStyles.Roboto_Regular} fontWeight={theme.fontWeight.normal} fontSize={theme.fontSize.normal} color={theme.colors.gray[800]}>
                    {location}
                </StyledText>
            </XStack>
        </YStack>
    )
}

export default EventDetails