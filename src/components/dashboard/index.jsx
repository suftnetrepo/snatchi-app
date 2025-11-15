import React, { useEffect} from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledSpacer,
  StyledSeparator,
  StyledCard,
  StyledBadge,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  backgroundColorHelper,
  textColorHelper,
} from '../../utils/help';
import { useProject } from '../../hooks/useProject';
import { Pressable, ScrollView } from 'react-native';
import ProjectCard from '../../components/projectCard/recent';
import { useNavigation } from '@react-navigation/native';

const Dashboard = ({  user_id }) => {
  const navigator = useNavigation();
  const { data: myProject, aggregateData} = useProject(user_id);

  const getAggregate = (data, status) => {
    {
      const result = (data || []).find(j => j.status === status);
      return result ? result.count : 0;
    }
  };

  return (
    <YStack paddingHorizontal={16} >
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
                {getAggregate(aggregateData?.statuses, 'Pending')}
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
                {getAggregate(aggregateData?.statuses, 'Progress')}
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
                {getAggregate(aggregateData?.statuses, 'Completed')}
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
                {getAggregate(aggregateData?.statuses, 'Canceled')}
              </StyledBadge>
            </XStack>
          </StyledCard>
        </XStack>

        <StyledSeparator
          left={
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.medium}
              color={theme.colors.gray[400]}>
              My Recent Projects ({myProject?.length})
            </StyledText>
          }
          right={<Pressable onPress={()=> navigator.navigate('project')}>
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.medium}
              color={theme.colors.gray[300]}>
              View All
            </StyledText>
          </Pressable>}
        />

        <YStack borderRadius={16} marginBottom={64} paddingVertical={8}>
          <ProjectCard data={myProject} />
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default Dashboard;
