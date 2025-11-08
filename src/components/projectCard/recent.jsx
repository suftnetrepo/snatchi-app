import React from 'react';
import {
  StyledCycle,
  StyledSpacer,
} from 'fluent-styles';
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  BadgeText,
  Pressable,
  ScrollView,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formatReadableDate } from '../../utils/help';
import { StyledMIcon } from '../../components/icon';
import { theme } from '../../utils/theme';
import { getPriorityColor, getStatusTheme, limitHtmlTextByWord } from '../../utils/help';
import { useNavigation } from '@react-navigation/native';
import ProgressCircleSvg from '../../components/progressCircle';

const ProjectCard = ({ data }) => {
  const navigator = useNavigation();
  console.log('Dashboard Tasks:', data);

  return (
    <Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="md" pb="$24">
          {data?.map((item, index) => {
            const themeProgress = getStatusTheme(item.status);
            return (
              <Pressable key={index}>
                <Box
                  bg={'white'}
                  rounded="$3xl"
                  p="$4"
                  sx={{
                    shadowColor: '$gray400',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                  }}
                >
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$lg"
                        fontWeight="$medium"
                        color="$black"
                        numberOfLines={2}
                      >
                        {item?.name?.split(' ')?.slice(0, 6)?.join(' ')} ...
                      </Text>
                      <HStack space="sm">
                        <Text fontSize="$sm" color="$gray600">{limitHtmlTextByWord(item.description)}</Text>
                      </HStack>
                    </VStack>
                    <ProgressCircleSvg progress={item.progress} color={themeProgress.progress} size={64} />
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center" mt="$4">
                    <Badge size="md" variant="solid" bg={getPriorityColor(item.priority)} rounded="$full" px="$3" py="$1">
                      <BadgeText color="$white" fontSize="$sm" fontWeight="$medium">
                        {item.priority}
                      </BadgeText>
                    </Badge>

                    <HStack space="sm" alignItems="center">
                      <MaterialIcons name="calendar-today" size={16} color="#999" />
                      <Text fontSize="$sm" color="$gray600">{formatReadableDate(item.startDate)}</Text>
                    </HStack>

                    {/* Avatar Group */}
                    <HStack justifyContent='' ml="$2">
                      <StyledCycle
                        paddingHorizontal={10}
                        borderWidth={1}
                        width={46}
                        height={46}
                        borderColor={theme.colors.gray[300]}>
                        <MaterialIcons
                          size={18}
                          name="assignment"
                          color={theme.colors.cyan[800]}
                          onPress={() => {
                            navigator.navigate('task');
                          }}
                        />
                      </StyledCycle>
                      <StyledSpacer marginHorizontal={4} />
                      <StyledCycle
                        paddingHorizontal={10}
                        borderWidth={1}
                        width={46}
                        height={46}
                        borderColor={theme.colors.gray[300]}>
                        <StyledMIcon
                          size={24}
                          name="chevron-right"
                          color={theme.colors.gray[800]}
                          onPress={() => {
                            navigator.navigate('project-details', { id: item.id });
                          }}
                        />
                      </StyledCycle>
                    </HStack>
                  </HStack>
                </Box>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default ProjectCard;
