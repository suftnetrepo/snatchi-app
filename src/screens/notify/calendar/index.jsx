import React, { useRef, useMemo, useState } from 'react';
import { ScrollView, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
    Box,
    Text,
    VStack,
    HStack,
    Pressable,
    Divider,
} from '@gluestack-ui/themed';
import {
    YStack,
    XStack,
    StyledText,
    StyledCycle,
    StyledSpacer,
    StyledSpinner,
    StyledOkDialog,
    StyledButton,
    StyledInput,
    StyledMultiInput,
} from 'fluent-styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { validate } from '../../../validator/index';
import { useStorage, SCHEDULE_KEY } from '../../../hooks/useStorage';
import { theme, fontStyles } from '../../../utils/theme';
import { getRelativeTimeString, truncate, statusOptions } from '../../../utils/help';
import { useScheduler } from '../../../hooks/useScheduler';
import { useAppContext } from '../../../hooks/appContext';
import { Dimensions } from 'react-native';
import StyledPickerSelect from '../../../components/dropdown/StyledPickerSelect';
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CalendarNotification() {
    const bottomSheetRef = useRef(null);
    const { user } = useAppContext();
    const snapPoints = useMemo(() => ['90%', '100%'], []);
    const [errorMessages, setErrorMessages] = useState({});
    const { handleMarkAsRead, data, handleDelete } =
        useStorage(SCHEDULE_KEY);
    const {
        handleChange,
        handleNotifySave,
        handleReset,
        fields,
        rules,
        handlNotifyChange,
        loading, error, success
    } = useScheduler(SCHEDULE_KEY);

    const onhandleDelete = id => {
        handleDelete(SCHEDULE_KEY, id);
    };

    const handleSubmit = async () => {
        setErrorMessages({});
        const validationResult = validate(fields, rules);

        if (validationResult.hasError) {
            const formattedErrors = {
                ...validationResult.errors,
            };

            setErrorMessages(formattedErrors);
            return;
        }

        const body = {
            title: fields.title,
            status: fields.status,
            startDate: fields.startDate,
            endDate: fields.endDate || fields.startDate,
            description: fields.description,
            user: user?.user_id,
        };

        handleNotifySave(body).then(result => {
            if (result) {
                close();
            }
        });
    };

    const close = () => {
        bottomSheetRef.current?.close()
    };

    const renderRightActions = (progress, dragX, onPress) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <Pressable onPress={onPress}>
                <Animated.View
                    style={{
                        transform: [{ scale }],
                        backgroundColor: theme.colors.red[500],
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                        height: '100%',
                        borderRadius: 8,
                    }}>
                    <Icon name="delete" size={22} color="#fff" />
                </Animated.View>
            </Pressable>
        );
    };

    return (
        <>
            <ScrollView style={{ backgroundColor: '#fff' }}>
                <VStack height={SCREEN_HEIGHT} p={"$4"} space="lg">
                    {data?.map((body, index) => (
                        <Swipeable
                            key={index}
                            renderRightActions={(progress, dragX) =>
                                renderRightActions(progress, dragX, () => {
                                    onhandleDelete(body.id);
                                })
                            }>
                            <Box bg="$white" borderRadius="$md">
                                <HStack space="md" alignItems="flex-start">
                                    <VStack flex={1}>
                                        <HStack justifyContent="flex-start" alignItems="center">
                                            <Text
                                                flex={6}
                                                fontWeight="$bold"
                                                fontSize="$md"
                                                color="$black">
                                                {body.siteName}
                                            </Text>
                                            <Pressable
                                                marginLeft={8}
                                                flex={1}
                                                onPress={() => {
                                                    handleMarkAsRead(SCHEDULE_KEY, body.id).then(() => {
                                                        handlNotifyChange(body)
                                                        bottomSheetRef.current?.snapToIndex(1);
                                                    })
                                                }}>
                                                <StyledCycle
                                                    height={48}
                                                    width={48}
                                                    borderWidth={1}
                                                    backgroundColor={theme.colors.gray[50]}
                                                    borderColor={theme.colors.gray[400]}>
                                                    <Icon
                                                        name="chevron-right"
                                                        size={20}
                                                        color={theme.colors.gray[600]}
                                                    />
                                                </StyledCycle>
                                            </Pressable>
                                        </HStack>
                                        <Text color="$coolGray600" mb={'$1'} fontSize="$sm">
                                            {truncate(body.description, 100) ||
                                                'No description provided'}
                                        </Text>
                                        <Text color="$coolGray800" fontSize="$xs">
                                            {getRelativeTimeString(body.createdAt)}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                            <Divider mt={'$8'} />
                        </Swipeable>
                    ))}
                </VStack>

            </ScrollView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore">
                <YStack
                    flex={1}
                    paddingHorizontal={16}
                    paddingVertical={16}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    borderRadius={16}
                    borderWidth={1}
                    borderColor={theme.colors.gray[200]}
                    backgroundColor={theme.colors.gray[1]}>
                    <XStack
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                        borderColor={theme.colors.gray[1]}
                        backgroundColor={theme.colors.gray[1]}>
                        <YStack
                            flex={1}
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            borderColor={theme.colors.gray[1]}
                            backgroundColor={theme.colors.gray[1]}>
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.normal}
                                color={theme.colors.gray[600]}
                                paddingVertical={4}
                                paddingHorizontal={4}
                                fontSize={theme.fontSize.normal}>
                                Please fill out the form below to decline a scheduled task or
                                to block out the days you're unavailable on your calendar.
                            </StyledText>
                        </YStack>
                        <Icon
                            name="cancel"
                            size={48}
                            color={theme.colors.gray[600]}
                            onPress={() => {
                                close()
                            }}
                        />
                    </XStack>
                    <StyledSpacer marginVertical={8} />
                    <StyledInput
                        name="title"
                        key="title"
                        keyboardType="default"
                        placeholder="Enter a reason for blocking your availability"
                        returnKeyType="next"
                        maxLength={100}
                        fontSize={theme.fontSize.small}
                        borderColor={theme.colors.gray[400]}
                        backgroundColor={theme.colors.gray[1]}
                        borderRadius={8}
                        paddingHorizontal={16}
                        placeholderTextColor={theme.colors.gray[400]}
                        height={40}
                        value={fields.title}
                        onChangeText={text => handleChange('title', text)}
                        error={!!errorMessages?.title}
                        errorMessage={errorMessages?.title?.message}
                    />
                    <XStack gap={8} marginTop={8} justifyContent="space-between">
                        <StyledInput
                            flex={1}
                            keyboardType="default"
                            placeholder="Selected start date"
                            returnKeyType="next"
                            maxLength={100}
                            fontSize={theme.fontSize.small}
                            borderColor={theme.colors.gray[400]}
                            backgroundColor={theme.colors.gray[1]}
                            borderRadius={8}
                            paddingHorizontal={16}
                            placeholderTextColor={theme.colors.gray[400]}
                            height={40}
                            value={fields.startDate}
                            readOnly
                        />
                        <StyledInput
                            flex={1}
                            keyboardType="default"
                            placeholder="Selected end date"
                            returnKeyType="next"
                            maxLength={100}
                            fontSize={theme.fontSize.small}
                            borderColor={theme.colors.gray[400]}
                            backgroundColor={theme.colors.gray[1]}
                            borderRadius={8}
                            paddingHorizontal={16}
                            placeholderTextColor={theme.colors.gray[400]}
                            height={40}
                            value={fields.endDate}
                            readOnly
                        />
                    </XStack>
                    <StyledSpacer marginTop={8} />
                    <StyledMultiInput
                        height={100}
                        keyboardType="default"
                        placeholder="Enter additional details (optional)"
                        returnKeyType="next"
                        maxLength={100}
                        fontSize={theme.fontSize.small}
                        borderColor={theme.colors.gray[400]}
                        backgroundColor={theme.colors.gray[1]}
                        borderRadius={8}
                        paddingHorizontal={16}
                        placeholderTextColor={theme.colors.gray[400]}
                        onChangeText={text => handleChange('description', text)}
                        value={fields.description}
                    />
                    <YStack
                        marginTop={8}
                        justifyContent="flex-start"
                        position="relative"
                        zIndex={10} // 🔥 keeps dropdown on top
                        alignItems="flex-start">
                        <StyledPickerSelect
                            placeholder="Select status..."
                            value={fields.status}
                            items={statusOptions.pending}
                            onChange={text => handleChange('status', text)}
                            theme={theme}
                            error={!!errorMessages?.status}
                            errorMessage={errorMessages?.status?.message}
                        />
                        <XStack
                            marginTop={16}
                            gap={8}
                            justifyContent="flex-start"
                            zIndex={1}
                            position="relative"
                            alignItems="center">
                            <StyledButton
                                flex={1}
                                borderRadius={32}
                                backgroundColor={theme.colors.cyan[500]}
                                borderColor={theme.colors.cyan[500]}
                                onPress={() => handleSubmit()}>
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    color={theme.colors.gray[1]}
                                    fontWeight={theme.fontWeight.normal}
                                    paddingVertical={8}
                                    paddingHorizontal={8}
                                    textAlign="center"
                                    fontSize={theme.fontSize.small}>
                                    SaveChanges
                                </StyledText>
                            </StyledButton>
                            <StyledButton
                                flex={1}
                                borderRadius={32}
                                borderWidth={1}
                                backgroundColor={theme.colors.gray[200]}
                                borderColor={theme.colors.gray[200]}
                                onPress={() => {
                                    close()
                                }}>
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    color={theme.colors.gray[800]}
                                    fontWeight={theme.fontWeight.normal}
                                    paddingVertical={8}
                                    paddingHorizontal={8}
                                    textAlign="center"
                                    fontSize={theme.fontSize.small}>
                                    Close
                                </StyledText>
                            </StyledButton>
                        </XStack>
                    </YStack>
                </YStack>
            </BottomSheet>
            {error && (
                <StyledOkDialog
                    title={error}
                    description="Please try again later"
                    visible={true}
                    onOk={() => {
                        handleReset();
                    }}
                />
            )}
            {success && (
                <StyledOkDialog
                    title="Confirmation"
                    description="Your schedule was updated successfully"
                    visible={true}
                    onOk={() => {
                        handleReset();
                    }}
                />
            )}
            {loading && <StyledSpinner />}
        </>
    );
}
