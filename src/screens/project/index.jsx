import React, { Fragment, useEffect } from 'react';
import {
    YStack,
    XStack,
    StyledHeader,
    StyledSafeAreaView,
    StyledSpacer,
    StyledText,
    StyledCycle,
    StyledOkDialog,
    StyledSpinner,
    StyledButton
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProject } from '../../hooks/useProject';
import ProjectCard from '../../components/projectCard/recent';
import { useAppContext } from '../../hooks/appContext';
import { Status_data } from '../../utils/help';

const Project = () => {
    const { user } = useAppContext();
    const navigator = useNavigation();
    const { data, handleReset, filteMyProjects, fetchMyProjects, filterValue, error, loading } = useProject();

    useEffect(() => {
        fetchMyProjects(user?.user_id);
    }, [fetchMyProjects, user?.user_id]);

    const RenderHeader = () => (
        <XStack
            paddingHorizontal={16}
            paddingVertical={8}
            justifyContent="flex-start"
            alignItems="center"
            backgroundColor={theme.colors.gray[50]}>
            <StyledCycle
                pressable
                pressableProps={{
                    onPress: () =>
                        navigator.goBack(),
                }}
                height={48}
                width={48}
                borderColor={theme.colors.gray[400]}>
                <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
            </StyledCycle>
            <StyledSpacer marginHorizontal={2} />
            <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                My Projects
            </StyledText>
            <StyledSpacer flex={1} />
            <StyledSpacer marginHorizontal={8} />
        </XStack>
    )

    const RenderStatus = () => {
        return (
            <XStack
                gap={8}
                justifyContent="flex-start"
                alignItems="center"
                borderRadius={32}
                paddingHorizontal={8}
                paddingVertical={8}
                backgroundColor={theme.colors.gray[1]}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {Status_data.map((status, index) => (
                        <Fragment key={index}>
                            <StyledButton
                                borderRadius={32}
                                borderWidth={filterValue === status  ? 2 : 0}
                                borderColor={filterValue === status  ? theme.colors.blue[500] : theme.colors.gray[100]}
                                backgroundColor={theme.colors.gray[100]}
                                onPress={() => {
                                    if (status === 'All') {
                                        filteMyProjects('');
                                    } else {
                                        filteMyProjects(status);
                                    }
                                }}
                            >
                                <StyledText
                                    fontFamily={fontStyles.Roboto_Regular}
                                    fontWeight={theme.fontWeight.normal}
                                    color={theme.colors.gray[800]}
                                    paddingHorizontal={12}
                                    paddingVertical={4}
                                    fontSize={theme.fontSize.small}>
                                    {status}
                                </StyledText>
                            </StyledButton>
                            <StyledSpacer marginHorizontal={2} />
                        </Fragment>

                    ))}
                </ScrollView>
            </XStack>
        )
    }

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
            <YStack flex={1} backgroundColor={theme.colors.gray[100]} paddingHorizontal={16} paddingVertical={12}>
                <RenderStatus />
                <StyledSpacer marginVertical={6} />
                <ProjectCard data={data} />
            </YStack>
            {error && (
                <StyledOkDialog
                    title={error?.message}
                    description="please try again"
                    visible={true}
                    onOk={() => {
                        handleReset();
                    }}
                />
            )}
            {loading && <StyledSpinner />}
        </StyledSafeAreaView>
    );
};

export default Project;
