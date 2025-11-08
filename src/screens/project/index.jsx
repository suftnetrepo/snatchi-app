import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import {
    YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledBadge,
  StyledCard,
  StyledCycle,
  StyledSeparator,
  FlexStyledImage,
  StyledOkDialog,
  StyledButton,
  StyledInput,
  StyledDialog,
} from 'fluent-styles';
import {
    Box,
    HStack,
    VStack,
    Text,
    Avatar,
    AvatarImage,
    AvatarFallbackText,
    Badge,
    BadgeText,
    Divider,
    Input,
    InputField,
    Icon,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import { getStatusTheme, formatDateTime } from '../../utils/help';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, Platform,  Linking, Dimensions } from 'react-native';
import ProgressCircleSvg from '../../components/progressCircle';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

export const ProjectDetails = () => {
    const navigator = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    const project = {
        name: 'Zenithloop Redesign',
        status: 'Pending',
        priority: 'Medium',
        description:
            'Zenithloop is a company engaged in interior design, already has an existing web design with a fresh and clean',
        startDate: "2025-02-24T08:19:00.000Z",
        endDate: "2025-02-28T08:19:00.000Z",
        progress: 80,
        members: [
            { name: 'Nadia Wilson', image: 'https://i.pravatar.cc/150?img=1' },
            { name: 'Eleanor Pena', image: 'https://i.pravatar.cc/150?img=2' },
        ],
        attachments: [
            { name: 'Brief landing page.pdf', size: '12 MB', icon: 'picture-as-pdf' },
            { name: 'Reference.jpg', size: '8 MB', icon: 'image' },
        ],
        completeAddress
            :
            "PE2 5SP, Orton Waterville, City of Peterborough, Cambridgeshire and Peterborough, England, United Kingdom"
    };

      const FileIcon = ({ fileType }) => {
        let icon;
        let color;
        switch (fileType?.toLowerCase()) {
          case 'pdf':
            icon = 'file-pdf-o';
            color = '#FF0000';
            break;
          case 'word':
            icon = 'file-word-o';
            color = '#0000FF';
            break;
          case 'image':
            icon = 'image';
            color = '#00FF00';
            break;
          default:
            icon = 'file-o';
            color = '#000000';
        }
    
        return <FontAwesome name={icon} size={20} color={color} />;
      };
    
      const openGoogleSearch = () => {
        const encodedQuery = encodeURIComponent(`hotels near ${project?.postcode}`);
        const url = `https://www.google.com/search?q=${encodedQuery}`;
        Linking.openURL(url);
      };
    
      const openGoogleSearchNearByAirport = () => {
        const encodedQuery = encodeURIComponent(
          `airport near ${project?.postcode}`,
        );
        const url = `https://www.google.com/search?q=${encodedQuery}`;
        Linking.openURL(url);
      };
    
      const openGoogleMapsForTrainStations = () => {
        const encodedQuery = encodeURIComponent(
          `train stations near ${project?.postcode}`,
        );
        const url = `https://www.google.com/maps/search/?q=${encodedQuery}`;
        Linking.openURL(url);
      };
    
      const openGoogleMaps = () => {
        const encodedAddress = encodeURIComponent(project?.postcode);
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
              console.log('Unable to open Google Maps.');
            }
          })
          .catch(err => console.error('Error opening URL:', err));
      };

    const themeProgress = getStatusTheme(project.status);

    const ProjectDescription = ({ description }) => {
        const [expanded, setExpanded] = useState(false);

        return (
            <Box>
                <Text
                    fontSize="$sm"
                    color="$textLight700"
                    numberOfLines={expanded ? undefined : 3} // limit lines when collapsed
                >
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
                    <MaterialIcons name="arrow-back" size={15} color={theme.colors.gray[800]} />
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

            <ScrollView showsVerticalScrollIndicator={false} >
                {/* Rounded white card */}
                <Box bg="$white" borderTopRadius={30} p="$5" flex={1}>

                    {/* Category badges */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack space="sm" mb="$2">
                            <Badge bg="$blue100" borderRadius="$xl" px="$2">
                                <BadgeText color="$blue600">{project.status}</BadgeText>
                            </Badge>
                            <Badge bg="$amber100" borderRadius="$xl" px="$2">
                                <BadgeText color="$amber600">{project.priority}</BadgeText>
                            </Badge>
                        </HStack>
                        <ProgressCircleSvg progress={project.progress} color={themeProgress.progress} size={64} />
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack flex={1} space="xs">
                            <Text
                                fontSize="$lg"
                                fontWeight="$medium"
                                color="$black"
                                numberOfLines={2}
                            >
                                {project?.name}
                            </Text>
                        </VStack>
                    </HStack>
                    <ProjectDescription description={project.description} />
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
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[800]}>
                                Start Date
                            </StyledText>
                            <XStack justifyContent="flex-start" alignItems="center">
                                <MaterialIcons
                                    name="access-time"
                                    size={14}
                                    color={theme.colors.gray[900]}
                                />
                                <StyledText
                                    paddingHorizontal={4}
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.normal}
                                    fontSize={theme.fontSize.small}
                                    color={theme.colors.gray[800]}>
                                    {formatDateTime(project.startDate)}
                                </StyledText>
                            </XStack>
                        </YStack>

                        <YStack>
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.bold}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[800]}>
                                End Date
                            </StyledText>
                            <XStack justifyContent="flex-start" alignItems="center">
                                <MaterialIcons
                                    name="access-time"
                                    size={14}
                                    color={theme.colors.gray[900]}
                                />

                                <StyledText
                                    paddingHorizontal={4}
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.normal}
                                    fontSize={theme.fontSize.small}
                                    color={theme.colors.gray[800]}>
                                    {formatDateTime(project.endDate)}
                                </StyledText>
                            </XStack>
                        </YStack>
                    </XStack>
                    <StyledSpacer marginVertical={4} />
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[800]}>
                                Attactments({project.attachments.length})
                            </StyledText>
                        }
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {project.attachments.map((item, index) => {
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
                                        marginBottom={8}
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
                    <StyledSeparator
                        left={
                            <StyledText
                                fontFamily={fontStyles.Roboto_Regular}
                                fontWeight={theme.fontWeight.medium}
                                fontSize={theme.fontSize.normal}
                                color={theme.colors.gray[800]}>
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
                                {project?.completeAddress}
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
                                borderColor={theme.colors.blue[500]}
                                backgroundColor={theme.colors.blue[500]}
                                onPress={() => openGoogleMaps()}>
                                <XStack
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    paddingHorizontal={14}
                                    flexWrap="wrap"
                                    gap={1}>
                                    <StyledText
                                        fontFamily={fontStyles.Roboto_Regular}
                                        fontWeight={theme.fontWeight.normal}
                                        fontSize={theme.fontSize.small}
                                        paddingLeft={4}
                                        paddingVertical={10}
                                        color={theme.colors.gray[1]}>
                                        Routes
                                    </StyledText>
                                    <MaterialIcons
                                        name="navigation"
                                        size={25}
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
                                color={theme.colors.gray[800]}>
                                NearBy
                            </StyledText>
                        }
                    />
                    <XStack
                        justifyContent="flex-start"
                        alignItems="center"
                        paddingHorizontal={8}
                        flexWrap="wrap"
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
                                <MaterialIcons name="hotel" size={18} color={theme.colors.gray[1]} />
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
                                <MaterialIcons name="train" size={18} color={theme.colors.gray[1]} />
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
        </StyledSafeAreaView>

    );
};
export default ProjectDetails;