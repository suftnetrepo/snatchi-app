import React, {Fragment, useEffect, useState} from 'react';
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
  StyledButton,
  StyledCard,
  StyledScrollView
} from 'fluent-styles';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {ScrollView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useScheduler} from '../../hooks/useScheduler';
import {useAppContext} from '../../hooks/appContext';
import {Status_data, schedulesTransformal, durationHrs} from '../../utils/help';
import {getScheduleStatusTheme} from '../../constants/scheduleStatusTheme';
import ScheduleStatusBadge from '../../components/shared/ScheduleStatusBadge';

const Schedules = () => {
  const {user} = useAppContext();
  const [filterValue, setFilterValue] = useState('Pending');
  const navigator = useNavigation();
  const {data, handleReset, handleScheduleFilterByStatus, error, loading} =
    useScheduler();
  const mySchedules = schedulesTransformal(data);

  useEffect(() => {
    handleScheduleFilterByStatus({
      status: 'Pending',
      engineerId: user?.user_id,
    });
  }, [user?.user_id]);

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
          onPress: () => navigator.goBack(),
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
        My Schedules
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  const RenderStatus = () => {
    return (
      <XStack
        gap={8}
        justifyContent="flex-start"
        alignItems="center"
        borderRadius={32}
        paddingHorizontal={8}
        paddingVertical={8}
        backgroundColor={theme.colors.gray[1]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Status_data.map((status, index) => (
            <Fragment key={index}>
              <StyledButton
                borderRadius={32}
                borderWidth={filterValue === status ? 2 : 0}
                borderColor={
                  filterValue === status
                    ? theme.colors.blue[500]
                    : theme.colors.gray[100]
                }
                backgroundColor={theme.colors.gray[100]}
                onPress={() => {
                   setFilterValue(status);
                    handleScheduleFilterByStatus({
                      status: status,
                      engineerId: user?.user_id,
                    });
                }}>
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
    );
  };

  const RenderCard = ({data}) => {
 
    return (
      <StyledCard
        flex={1}
        borderRadius={24}
        borderWith={0.4}
        paddingVertical={12}
        paddingHorizontal={12}
        backgroundColor={theme.colors.gray[1]}
        >
        <StyledText
          fontFamily={fontStyles.Roboto_Regular}
          fontWeight={theme.fontWeight.normal}
          color={theme.colors.gray[600]}
          fontSize={theme.fontSize.medium}>
          {data.title}
        </StyledText>
        <XStack
          gap={16}
          alignItems="center"
          justifyContent="flex-start"
          flexWrap="wrap"
          marginTop={8}>
          <ScheduleStatusBadge status={data?.metta?.status} size="sm" />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.small}>
            {data ? durationHrs(data.time, data.endTime) : ''}
          </StyledText>
          <StyledSpacer flex={1} />
          <Icon
            size={24}
            name="chevron-right"
            color={theme.colors.gray[800]}
            onPress={() => {
              navigator.navigate('project-details', {
                id: data?.metta?.project,
              });
            }}
          />
        </XStack>
      </StyledCard>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[1]}>
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>
      <YStack
        flex={1}
        backgroundColor={theme.colors.gray[100]}
        paddingHorizontal={16}
        paddingVertical={12}>
        <RenderStatus />
        <StyledSpacer marginVertical={6} />
         <StyledScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 24}}>
{
            mySchedules.map((schedule, index) => (
                <Fragment key={index}>
                    <RenderCard data={schedule} />
                    <StyledSpacer marginVertical={4} />
                </Fragment>
            ))
        }
                  </StyledScrollView>
        
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

export default Schedules;
