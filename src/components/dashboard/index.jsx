import React from 'react';
import {
  YStack,
  XStack,
  StyledText,
  StyledSpacer,
  StyledSeparator,
  StyledCard,
  StyledBadge,
} from 'fluent-styles';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
  backgroundColorHelper,
  textColorHelper,
} from '../../utils/help';
import ProjectCard from '../../components/projectCard/recent';

const Dashboard = ({data, aggregateData }) => {
  const navigator = useNavigation();

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
          left={
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.normal}
              color={theme.colors.gray[500]}>
              My Recent Projects ({data?.length})
            </StyledText>
          }
          right={<Pressable onPress={() => navigator.navigate('project')}>
            <StyledText
              fontFamily={fontStyles.Roboto_Regular}
              fontWeight={theme.fontWeight.light}
              fontSize={theme.fontSize.normal}
              color={theme.colors.gray[500]}>
              View All
            </StyledText>
          </Pressable>}
        />

        <YStack borderRadius={16} marginBottom={64} paddingVertical={8}>
          <ProjectCard data={data} />
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default Dashboard;
