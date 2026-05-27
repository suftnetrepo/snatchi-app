import React from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledSpacer,
  StyledSeparator,
  StyledCard,
  StyledBadge,
  StyledCycle
} from 'fluent-styles';
import {Badge, BadgeText} from '@gluestack-ui/themed';
import {useNavigation} from '@react-navigation/native';
import {Pressable, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {
  backgroundColorHelper,
  textColorHelper,
  schedulesTransformal,
  durationHrs,
  getPriorityColor,
  capitalizeFirstLetter,
} from '../../utils/help';
import StyledTimeline from '../../components/timeline';

const Dashboard = ({data, aggregateData}) => {
  const navigator = useNavigation();
  const recentSchedules = schedulesTransformal(data);

  const getAggregate = (data, status) => {
    {
      const result = (data || []).find(j => j.status === status);
      return result ? result.count : 0;
    }
  };

  console.log('Aggregate Data in Dashboard:', recentSchedules);

  const RenderRecentCard = ({data}) => {
    console.log('Rendering card for schedule:', data);
    return (
      <StyledCard
        flex={1}
        borderRadius={24}
        borderColor={theme.colors.gray[1]}
        backgroundColor={theme.colors.gray[1]}
        paddingVertical={12}
        paddingHorizontal={12}
        borderWidth={1}>
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
          marginTop={4}>
          <Badge
            size="md"
            variant="solid"
            bg={getPriorityColor(data?.metta?.status)}
            rounded="$full"
            px="$3"
            py="$1">
            <BadgeText color="$white" fontSize="$sm" fontWeight="$medium">
              {capitalizeFirstLetter(data?.metta?.status)}
            </BadgeText>
          </Badge>
          <Icon name="access-time" size={24} color="#9CA3AF" />
          <StyledText
            fontFamily={fontStyles.Roboto_Regular}
            fontWeight={theme.fontWeight.normal}
            color={theme.colors.gray[600]}
            fontSize={theme.fontSize.normal}>
            {durationHrs(data.time, data.endTime)}
          </StyledText>
         
          <StyledCycle
            paddingHorizontal={10}
            borderWidth={1}
            width={48}
            height={48}
            borderColor={theme.colors.gray[400]}>
            <Icon
              size={24}
              name="chevron-right"
              color={theme.colors.gray[800]}
              onPress={() => {
                navigator.navigate('project-details', {id: data?.metta?.project});
              }}
            />
          </StyledCycle>
        </XStack>
      </StyledCard>
    );
  };

  const RestDay = () => (
    <XStack alignItems="center" paddingVertical={48} gap={12}>
      <XStack
        width={72}
        height={72}
        borderRadius={36}
        backgroundColor="#f0fdf4"
        alignItems="center"
        justifyContent="center">
        <Icon name="moon" size={28} color="#8bc34a" />
      </XStack>
      <StyledText fontSize={18} fontWeight="800" color="#1a1a1e">
        Rest Day
      </StyledText>
      <StyledText fontSize={14} color="#9ca3af" textAlign="center">
        Recovery is part of the plan.{'\n'}Rest up and come back stronger 💚
      </StyledText>
    </XStack>
  );

  return (
    <YStack paddingHorizontal={16} marginTop={16} flex={1}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <XStack gap={16}>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="clock-o"
                size={48}
                color={theme.colors.indigo[400]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Pending
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Pending')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Pending')}
                color={textColorHelper('Pending')}>
                {getAggregate(aggregateData, 'Pending')}
              </StyledBadge>
            </XStack>
          </StyledCard>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="spinner"
                size={48}
                color={theme.colors.orange[300]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Progress
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Progress')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Progress')}
                color={textColorHelper('Progress')}>
                {getAggregate(aggregateData, 'Progress')}
              </StyledBadge>
            </XStack>
          </StyledCard>
        </XStack>
        <XStack gap={16}>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="check-circle"
                size={48}
                color={theme.colors.green[500]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Completed
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Completed')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Completed')}
                color={textColorHelper('Completed')}>
                {getAggregate(aggregateData, 'Completed')}
              </StyledBadge>
            </XStack>
          </StyledCard>
          <StyledCard
            flex={1}
            borderRadius={32}
            marginBottom={8}
            borderColor={theme.colors.gray[1]}
            backgroundColor={theme.colors.gray[1]}
            paddingVertical={16}
            paddingHorizontal={16}
            borderWidth={1}>
            <XStack justifyContent="flex-end" alignItems="center" gap={1}>
              <FontAwesome
                name="times-circle"
                size={48}
                color={theme.colors.pink[500]}
              />
            </XStack>
            <StyledSpacer marginVertical={20} />
            <XStack justifyContent="space-between" alignItems="center" gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                color={theme.colors.gray[600]}
                fontSize={theme.fontSize.normal}>
                Cancelled
              </StyledText>

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={backgroundColorHelper('Cancelled')}
                paddingVertical={4}
                borderColor={backgroundColorHelper('Cancelled')}
                color={textColorHelper('Cancelled')}>
                {getAggregate(aggregateData, 'Canceled')}
              </StyledBadge>
            </XStack>
          </StyledCard>
        </XStack>

        <StyledSeparator
        paddingHorizontal={16}
          left={
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.medium}
              color={theme.colors.gray[500]}>
              My Recent Schedules ({data?.length})
            </StyledText>
          }
          right={
            <Pressable onPress={() => navigator.navigate('project')}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.light}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[500]}>
                View All
              </StyledText>
            </Pressable>
          }
        />

        <YStack borderRadius={16} marginBottom={64} paddingVertical={8}>
          <StyledTimeline
            items={recentSchedules}
            renderItem={item => <RenderRecentCard data={item} />}
            variant="default"
            dotShape="filled"
            dotSize={10}
            timeColumnWidth={58}
            timeGap={12}
            animated
            colors={{
              dot: theme.colors.gray[800],
              line: theme.colors.gray[800],
              timeText: theme.colors.gray[800],
              endTimeText: theme.colors.gray[500],
            }}
          />
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default Dashboard;
