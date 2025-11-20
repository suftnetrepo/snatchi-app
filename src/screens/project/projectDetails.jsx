import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
    YStack,
    XStack,
    StyledHeader,
    StyledSafeAreaView,
    StyledSpacer,
    StyledText,
    StyledCard,
    StyledCycle,
    StyledSeparator,
    FlexStyledImage,
    StyledButton,
    StyledSpinner,
    StyledOkDialog,
} from 'fluent-styles';
import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    BadgeText,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
    getStatusTheme,
    safetyGear,
    formatDateTime,
    limitHtmlTextByWord,
    capitalizeFirstLetter,
    getPriorityColor,
    FileIcon,
} from '../../utils/help';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { Pressable, Platform, Linking, Dimensions } from 'react-native';
import ProgressCircleSvg from '../../components/progressCircle';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useProject } from '../../hooks/useProject';
import { ContactCard } from '../../components/projectCard/contact';

export const ProjectDetails = () => {
    const { width } = Dimensions.get('window');
    const navigator = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const { data, error, loading, fetchOneProject } = useProject();
    const themeProgress = getStatusTheme(data?.status);

    console.log('Project Details Data:', data);

    useEffect(() => {
        fetchOneProject(id);
    }, [id]);

    const openGoogleSearch = () => {
        const encodedQuery = encodeURIComponent(`hotels near ${data?.postcode}`);
        const url = `https://www.google.com/search?q=${encodedQuery}`;
        Linking.openURL(url);
    };

    const openGoogleSearchNearByAirport = () => {
        const encodedQuery = encodeURIComponent(`airport near ${data?.postcode}`);
        const url = `https://www.google.com/search?q=${encodedQuery}`;
        Linking.openURL(url);
    };

    const openGoogleMapsForTrainStations = () => {
        const encodedQuery = encodeURIComponent(
            `train stations near ${data?.postcode}`,
        );
        const url = `https://www.google.com/maps/search/?q=${encodedQuery}`;
        Linking.openURL(url);
    };

    const openGoogleMaps = () => {
        const encodedAddress = encodeURIComponent(data?.postcode);
        let url;

        if (Platform.OS === 'android') {
            url = `geo:0,0?q=${encodedAddress}`;
        } else {
            url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        }

        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    __DEV__ && console.log('Unable to open Google Maps.');
                }
            })
            .catch(err => __DEV__ && console.error('Error opening URL:', err));
    };

    const ProjectDescription = ({ description }) => {
        const [expanded, setExpanded] = useState(false);

        return (
            <Box>
                <Text
                    fontSize="$sm"
                    color="$textLight700"
                    numberOfLines={expanded ? undefined : 3}>
                    {description}
                </Text>

                <Box mt="$1">
                    <Pressable onPress={() => setExpanded(!expanded)}>
                        <Text color="$gray600" fontWeight="$semibold">
                            {expanded ? 'less...' : 'more...'}
                        </Text>
                    </Pressable>
                </Box>
            </Box>
        );
    };

    const RenderHeader = () => (
        <XStack
            paddingHorizontal={16}
            paddingVertical={8}
            justifyContent="flex-start"
            alignItems="center"
            backgroundColor={theme.colors.gray[50]}>
            <Pressable onPress={() => navigator.goBack()}>
                <StyledCycle
                    height={48}
                    width={48}
                    borderColor={theme.colors.gray[200]}>
                    <MaterialIcons
                        name="arrow-back"
                        size={15}
                        color={theme.colors.gray[800]}
                    />
                </StyledCycle>
            </Pressable>
            <StyledSpacer marginHorizontal={2} />
            <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Project Details
            </StyledText>
            <StyledSpacer flex={1} />
            <Pressable
                onPress={() => {
                    navigator.navigate('task', {
                        id: data?._id,
                        from: 'project-details',
                    });
                }}>
                <StyledCycle
                    height={48}
                    width={48}
                    backgroundColor={theme.colors.cyan[500]}
                    borderColor={theme.colors.cyan[500]}>
                    <MaterialIcons
                        size={18}
                        name="assignment"
                        color={theme.colors.gray[50]}
                    />
                </StyledCycle>
            </Pressable>
            <StyledSpacer marginHorizontal={8} />
        </XStack>
    );

    return (
        <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
            <StyledHeader
                skipAndroid={Platform.OS === 'android' ? false : true}
                marginHorizontal={8}
                statusProps={{ translucent: true }}>
                <StyledHeader.Full>
                    <RenderHeader />
                </StyledHeader.Full>
            </StyledHeader>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Rounded white card */}
                <Box bg="$white" borderTopRadius={30} py={'$3'} px={'$4'} flex={1}>
                    {/* Category badges */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack space="sm" mb="$2">
                            <Badge bg="$blue100" borderRadius="$xl" px="$2">
                                <BadgeText color="$blue600">{data?.status}</BadgeText>
                            </Badge>
                            <Badge
                                size="md"
                                variant="solid"
                                bg={getPriorityColor(data.priority)}
                                rounded="$full"
                                px="$3"
                                py="$1">
                                <BadgeText color="$white" fontSize="$sm" fontWeight="$medium">
                                    {data.priority}
                                </BadgeText>
                            </Badge>
                        </HStack>
                        <ProgressCircleSvg
                            progress={data?.progress}
                            color={themeProgress.progress}
                            size={64}
                        />
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack flex={1} space="xs">
                            <Text
                                fontSize="$lg"
                                fontWeight="$medium"
                                color="$black"
                                numberOfLines={2}>
                                {data?.name}
                            </Text>
                        </VStack>
                    </HStack>
                    <ProjectDescription
                        description={limitHtmlTextByWord(data?.description, 200)}
                    />
                    <StyledSpacer marginVertical={4} />
                    <XStack
                        justifyContent="space-between"
                        alignItems="center"
                        gap={2}
                        paddingVertical={4}
                        borderRadius={32}>
                        <YStack>
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.bold}
                                fontSize={theme.fontSize.small}
                                color={theme.colors.gray[800]}>
                                Start Date
                            </StyledText>
                            <XStack justifyContent="flex-start" alignItems="center">
                                <MaterialIcons
                                    name="access-time"
                                    size={20}
                                    color={theme.colors.gray[900]}
                                />
                                <StyledText
                                    paddingHorizontal={4}
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.normal}
                                    fontSize={theme.fontSize.small}
                                    color={theme.colors.gray[800]}>
                                    {formatDateTime(data?.startDate)}
                                </StyledText>
                            </XStack>
                        </YStack>
                        <YStack>
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.bold}
                                fontSize={theme.fontSize.small}
                                color={theme.colors.gray[800]}>
                                End Date
                            </StyledText>
                            <XStack justifyContent="flex-start" alignItems="center">
                                <MaterialIcons
                                    name="access-time"
                                    size={20}
                                    color={theme.colors.gray[900]}
                                />
                                <StyledText
                                    paddingHorizontal={4}
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.normal}
                                    fontSize={theme.fontSize.small}
                                    color={theme.colors.gray[800]}>
                                    {formatDateTime(data?.endDate)}
                                </StyledText>
                            </XStack>
                        </YStack>
                    </XStack>

                    {data?.attachments?.length > 0 && (
                        <>
                            <StyledSpacer marginVertical={4} />
                            <StyledSeparator
                                left={
                                    <StyledText
                                        fontFamily={fontStyles.Roboto_Regular}
                                        fontWeight={theme.fontWeight.medium}
                                        fontSize={theme.fontSize.normal}
                                        color={theme.colors.gray[400]}>
                                        Attactments({data?.attachments?.length})
                                    </StyledText>
                                }
                            />
                        </>
                    )}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {data?.attachments?.map((item, index) => {
                            return (
                                <Pressable
                                    key={index}
                                    style={{ width: width - 32 }}
                                    onPress={() => {
                                        // setModalVisible(true);
                                        // setSelectedImageIndex(index);
                                    }}>
                                    <StyledCard
                                        borderRadius={16}
                                        marginHorizontal={8}
                                        borderColor={theme.colors.gray[200]}
                                        backgroundColor={theme.colors.gray[1]}
                                        borderWidth={1}>
                                        <XStack
                                            paddingVertical={8}
                                            paddingHorizontal={8}
                                            justifyContent="space-between"
                                            alignItems="center"
                                            gap={4}>
                                            <XStack
                                                justifyContent="flex-start"
                                                alignItems="center"
                                                gap={8}>
                                                <FileIcon fileType={item.document_type} />
                                                <StyledText
                                                    fontFamily={fontStyles.Roboto_Regular}
                                                    fontWeight={theme.fontWeight.normal}
                                                    fontSize={theme.fontSize.medium}
                                                    color={theme.colors.gray[600]}>
                                                    {item.document_name}
                                                </StyledText>
                                            </XStack>
                                            <StyledCycle
                                                height={32}
                                                width={32}
                                                borderColor={theme.colors.gray[300]}>
                                                <FontAwesome
                                                    name="chevron-right"
                                                    size={12}
                                                    color={theme.colors.gray[600]}
                                                    onPress={() => {
                                                        // setModalVisible(true);
                                                        // setSelectedImageIndex(index);
                                                    }}
                                                />
                                            </StyledCycle>
                                        </XStack>
                                    </StyledCard>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    <StyledSpacer marginVertical={2} />
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[400]}>
                                Location
                            </StyledText>
                        }
                    />
                    <StyledCard
                        borderRadius={16}
                        marginBottom={8}
                        borderColor={theme.colors.gray[200]}
                        backgroundColor={theme.colors.gray[1]}
                        borderWidth={1}>
                        <FlexStyledImage
                            local={true}
                            borderRadius={8}
                            borderWidth={5}
                            borderColor={theme.colors.gray[100]}
                            height={90}
                            width={'100%'}
                            imageUrl={require('../../../assets/img/map.png')}
                        />
                        <XStack
                            justifyContent="flex-start"
                            alignItems="center"
                            paddingHorizontal={8}
                            paddingVertical={8}
                            flexWrap="wrap"
                            gap={2}>
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.normal}
                                fontSize={theme.fontSize.small}
                                color={theme.colors.gray[800]}>
                                {data?.completeAddress}
                            </StyledText>
                        </XStack>
                        <XStack
                            justifyContent="flex-end"
                            alignItems="center"
                            paddingHorizontal={8}
                            paddingVertical={8}
                            flexWrap="wrap"
                            gap={2}>
                            <StyledButton
                                borderColor={theme.colors.cyan[500]}
                                backgroundColor={theme.colors.cyan[500]}
                                onPress={() => openGoogleMaps()}>
                                <XStack
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    paddingHorizontal={8}
                                    flexWrap="wrap"
                                    gap={1}>
                                    <StyledText
                                        fontFamily={fontStyles.Roboto_Regular}
                                        fontWeight={theme.fontWeight.normal}
                                        fontSize={theme.fontSize.small}
                                        paddingLeft={4}
                                        paddingVertical={4}
                                        color={theme.colors.gray[1]}>
                                        Routes
                                    </StyledText>
                                    <MaterialIcons
                                        name="navigation"
                                        size={18}
                                        color={theme.colors.gray[1]}
                                    />
                                </XStack>
                            </StyledButton>
                        </XStack>
                    </StyledCard>
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[400]}>
                                Contact
                            </StyledText>
                        }
                    />
                    <ContactCard
                        name={`${data?.manager} ${data?.stakeholder}`}
                        email={data?.email}
                        mobile={data?.mobile}></ContactCard>
                    <StyledSpacer marginVertical={4} />
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[400]}>
                                Safety Gear
                            </StyledText>
                        }
                    />
                    <ScrollView showsHorizontalScrollIndicator={false}>
                        <XStack
                            justifyContent="flex-start"
                            alignItems="center"
                            paddingHorizontal={8}
                            flexWrap="wrap"
                            gap={2}>
                            {safetyGear(data?.ppe)?.map((ppe, index) => (
                                <StyledButton
                                    key={index}
                                    borderColor={theme.colors.gray[200]}
                                    backgroundColor={theme.colors.gray[100]}>
                                    <StyledText
                                        fontFamily={fontStyles.Roboto_Regular}
                                        fontWeight={theme.fontWeight.normal}
                                        fontSize={theme.fontSize.small}
                                        paddingVertical={4}
                                        paddingHorizontal={8}
                                        color={theme.colors.gray[800]}>
                                        {capitalizeFirstLetter(ppe)}
                                    </StyledText>
                                </StyledButton>
                            ))}
                        </XStack>
                    </ScrollView>
                    <StyledSpacer marginVertical={4} />
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[400]}>
                                NearBy
                            </StyledText>
                        }
                    />
                    <XStack
                        flex={1}
                        justifyContent="flex-start"
                        alignItems="center"
                        paddingHorizontal={8}
                        gap={4}>
                        <StyledButton
                            borderColor={theme.colors.orange[500]}
                            backgroundColor={theme.colors.orange[500]}
                            onPress={() => openGoogleSearch()}>
                            <XStack
                                justifyContent="flex-end"
                                alignItems="center"
                                paddingHorizontal={14}
                                flexWrap="wrap"
                                gap={1}>
                                <MaterialIcons
                                    name="hotel"
                                    size={18}
                                    color={theme.colors.gray[1]}
                                />
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.light}
                                    fontSize={theme.fontSize.small}
                                    paddingVertical={8}
                                    color={theme.colors.gray[1]}>
                                    Hotels
                                </StyledText>
                            </XStack>
                        </StyledButton>
                        <StyledButton
                            borderColor={theme.colors.pink[500]}
                            backgroundColor={theme.colors.pink[500]}
                            onPress={() => openGoogleMapsForTrainStations()}>
                            <XStack
                                justifyContent="flex-end"
                                alignItems="center"
                                paddingHorizontal={14}
                                flexWrap="wrap"
                                gap={1}>
                                <MaterialIcons
                                    name="train"
                                    size={18}
                                    color={theme.colors.gray[1]}
                                />
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.light}
                                    fontSize={theme.fontSize.small}
                                    paddingVertical={8}
                                    color={theme.colors.gray[1]}>
                                    Train stations
                                </StyledText>
                            </XStack>
                        </StyledButton>
                        <StyledButton
                            borderColor={theme.colors.purple[500]}
                            backgroundColor={theme.colors.purple[500]}
                            onPress={() => openGoogleSearchNearByAirport()}>
                            <XStack
                                justifyContent="flex-end"
                                alignItems="center"
                                paddingHorizontal={14}
                                flexWrap="wrap"
                                gap={1}>
                                <MaterialIcons
                                    name="airline-seat-legroom-extra"
                                    size={18}
                                    color={theme.colors.gray[1]}
                                />
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.light}
                                    fontSize={theme.fontSize.small}
                                    paddingVertical={8}
                                    color={theme.colors.gray[1]}>
                                    Airports
                                </StyledText>
                            </XStack>
                        </StyledButton>
                    </XStack>
                </Box>
            </ScrollView>
            {error && (
                <StyledOkDialog
                    title={error}
                    description="Please try again later"
                    visible={true}
                    onOk={() => {
                        navigator.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'bottom-tabs' }],
                            })
                        );
                    }}
                />
            )}
            {loading && <StyledSpinner />}
        </StyledSafeAreaView>
    );
};
export default ProjectDetails;
