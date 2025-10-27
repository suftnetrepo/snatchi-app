import React from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  AvatarImage,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProjectDetail = ({ project, handleClose }) => {
  if (!project) {
    return (
      <VStack alignItems="center" justifyContent="center" py="$8">
        <Text color="$text600">No project selected</Text>
      </VStack>
    );
  }

  console.log('ProjectDetail project:', project);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f8fc' }}>
      <Box
        m="$4"
        p="$5"
        bg="$backgroundLight0"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={4}
      >
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <Pressable>
            <Box
              h={40}
              w={40}
              borderRadius="$full"
              bg="$backgroundLight200"
              alignItems="center"
              justifyContent="center"
            >
              {/* <Icon name="arrow-back" size={20} color="#333" /> */}
            </Box>
          </Pressable>
          <Pressable onPress={handleClose}>
             <Icon name="cancel" size={48} color="#333" />
          </Pressable>
        </HStack>

        {/* Title & Progress */}
        <VStack mb="$3" space="xs">
          <Text fontSize="$xl" fontWeight="$bold" color="$text900" flexShrink={1}>
            {project.siteName}
          </Text>
          <Box bg="$indigo200" px="$3" py="$1" borderRadius="$full">
            <Text fontSize="$xs" color="$indigo800">
              60% Progress
            </Text>
          </Box>

          <Text fontSize="$sm" color="$text700" lineHeight="$sm">
            {project.description}
          </Text>
        </VStack>

        {/* Team Members */}
        <VStack mt="$4" mb="$3" space="xs">
          <Text fontSize="$sm" color="$text600" fontWeight="$medium">
           Engineers
          </Text>
          <HStack mt="$2" space="md">
            {[1, 2, 3, 4].map((i) => (
              <Avatar key={i} size="sm">
                <AvatarImage
                  alt="member"
                  source={{ uri: `https://i.pravatar.cc/150?img=${i + 2}` }}
                />
              </Avatar>
            ))}
          </HStack>
        </VStack>

        {/* Start and End Dates */}
        <HStack justifyContent="space-between" mb="$4" mt="$2">
          <VStack>
            <Text fontSize="$xs" color="$text500">
              Start Date
            </Text>
            <HStack alignItems="center" space="xs" mt="$1">
              <Icon name="access-time" size={16} color="#555" />
              <Text fontSize="$sm" color="$text700">
                {formatDate(project.startDate)}
              </Text>
            </HStack>
          </VStack>

          <VStack>
            <Text fontSize="$xs" color="$text500">
              End Date
            </Text>
            <HStack alignItems="center" space="xs" mt="$1">
              <Icon name="access-time" size={16} color="#555" />
              <Text fontSize="$sm" color="$text700">
                {formatDate(project.endDate)}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Divider my="$3" />

        {/* Site Address Section */}
        <VStack bg="$backgroundLight100" p="$3" borderRadius="$lg" mb="$5">
          <HStack alignItems="center" space="sm" mb="$2">
            <Icon name="location-on" size={18} color="#4f46e5" />
            <Text fontSize="$md" fontWeight="$semibold" color="$text800">
              Site Address
            </Text>
          </HStack>
          <Text fontSize="$sm" color="$text700" lineHeight="$sm">
            {project.completeAddress}
          </Text>
        </VStack>

      </Box>
    </ScrollView>
  );
};
export { ProjectDetail };