import React from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBadge } from '../../components/badges/status';
import { PriorityBadge } from '../../components/badges/priority';

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
        m="$2"
        p="$5"
        bg="$backgroundLight0"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={4}
      >
        {/* Header */}
        <HStack justifyContent="flex-end" alignItems="center" mb="$4">
          <Text fontSize="$lg" fontWeight="$bold" color="$black" flexShrink={1}>
            {project.siteName}
          </Text>
          <Pressable onPress={handleClose}>
            <Icon name="cancel" size={48} color="#333" />
          </Pressable>
        </HStack>

        <VStack mb="$3" space="xs">
          <HStack space="sm" mb="$3" alignItems="center">
            <StatusBadge status={project?.status} />
            <PriorityBadge priority={project?.priority} />
          </HStack>
          <Text fontSize="$sm" color="$text700" lineHeight="$sm">
            {project?.description}
          </Text>
        </VStack>

        {/* Start and End Dates */}
        <HStack justifyContent="space-between" mb="$4" mt="$2">
          <VStack>
            <Text fontSize="$md" fontWeight={"$bold"}  color="$text800">
              Start Date
            </Text>
            <HStack alignItems="center" space="xs" mt="$1">
              <Icon name="access-time" size={16} color="#555" />
              <Text fontSize="$sm" color="$text700">
                {formatDate(project?.startDate)}
              </Text>
            </HStack>
          </VStack>

          <VStack>
            <Text fontSize="$md" fontWeight={"$bold"} color="$text800">
              End Date
            </Text>
            <HStack alignItems="center" space="xs" mt="$1">
              <Icon name="access-time" size={16} color="#555" />
              <Text fontSize="$sm" color="$text700">
                {formatDate(project?.endDate)}
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