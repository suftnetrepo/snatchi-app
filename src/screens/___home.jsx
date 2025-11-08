import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Box,
  Text,
  HStack,
  VStack,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  Badge,
  BadgeText,
  Pressable,
  ScrollView,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/* ===== Progress Circle ===== */
const ProgressCircle = ({ progress, color = '#fff', size = 64 }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={styles.circleContainer}>
        <View
          style={[
            styles.circle,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
        <View
          style={[
            styles.circle,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: progress > 75 ? color : 'transparent',
              borderRightColor: progress > 25 ? color : 'transparent',
              borderBottomColor: progress > 50 ? color : 'transparent',
              borderLeftColor: progress > 0 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>
      <View style={styles.percentageContainer}>
        <Text fontSize="$sm" fontWeight="$bold" color="$black">
          {progress}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { position: 'absolute' },
  percentageContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* ===== Helper: Theme based on Status ===== */
const getStatusTheme = (status) => {
  switch (status) {
    case 'Pending':
      return { bg: '#FFF5E1', badge: '#F59E0B', progress: '#F59E0B' }; // amber theme
    case 'Ongoing':
      return { bg: '#E0F2FE', badge: '#0EA5E9', progress: '#0EA5E9' }; // blue theme
    case 'Completed':
      return { bg: '#DCFCE7', badge: '#22C55E', progress: '#22C55E' }; // green theme
    case 'On Hold':
      return { bg: '#FCE7F3', badge: '#EC4899', progress: '#EC4899' }; // pink theme
    default:
      return { bg: '#F3F4F6', badge: '#9CA3AF', progress: '#9CA3AF' }; // gray
  }
};

/* ===== Main Screen ===== */
const Home = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const tasks = [
    {
      siteName: "Deploy a cloud-based digital signage system for a retail chain.",
      startDate: "2025-02-25T08:20:00.000Z",
      priority: "High",
      firstName: "Micheal",
      lastName: "Hooks",
      description: "Cloud-based CMS for promotions...",
      status: "Pending",
      progress: 20,
      team: [
        { uri: "https://randomuser.me/api/portraits/women/44.jpg", initials: "AH" },
        { uri: "https://randomuser.me/api/portraits/men/46.jpg", initials: "JS" },
        { uri: "https://randomuser.me/api/portraits/women/42.jpg", initials: "KB" },
        { uri: "https://randomuser.me/api/portraits/men/40.jpg", initials: "LC" },
      ],
    },
    {
      siteName: "Design and implement an AV system for a modern conference room.",
      startDate: "2025-02-24T08:19:00.000Z",
      priority: "High",
      firstName: "Micheal",
      lastName: "Hooks",
      description: "Video conferencing + smart automation...",
      status: "Ongoing",
      progress: 60,
      team: [
        { uri: "https://randomuser.me/api/portraits/men/47.jpg", initials: "RT" },
        { uri: "https://randomuser.me/api/portraits/women/41.jpg", initials: "MD" },
        { uri: "https://randomuser.me/api/portraits/men/40.jpg", initials: "LC" },
      ],
    },
    {
      siteName: "Install live streaming setup for a Church",
      startDate: "2025-10-03T21:23:00.000Z",
      priority: "Low",
      firstName: "Micheal",
      lastName: "Hooks",
      description: "PTZ cameras, streaming integration...",
      status: "Completed",
      progress: 100,
      team: [
        { uri: "https://randomuser.me/api/portraits/women/44.jpg", initials: "AH" },
        { uri: "https://randomuser.me/api/portraits/men/46.jpg", initials: "JS" },
        { uri: "https://randomuser.me/api/portraits/women/42.jpg", initials: "KB" },
      ],
    },
    {
      siteName: "E-commerce redesign project",
      startDate: "2025-11-03T21:23:00.000Z",
      priority: "Medium",
      firstName: "Micheal",
      lastName: "Hooks",
      description: "UI overhaul and new payment gateway...",
      status: "On Hold",
      progress: 35,
      team: [
        { uri: "https://randomuser.me/api/portraits/women/44.jpg", initials: "AH" },
        { uri: "https://randomuser.me/api/portraits/men/46.jpg", initials: "JS" },
        { uri: "https://randomuser.me/api/portraits/women/41.jpg", initials: "MD" },
        { uri: "https://randomuser.me/api/portraits/men/40.jpg", initials: "LC" },
      ],
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#0EA5E9';
      case 'Medium': return '#F472B6';
      case 'Low': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  return (
    <Box flex={1} bg="$white">
      {/* Header */}
      <Box bg="$white" pt="$12" px="$5" pb="$4">
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <HStack space="sm" alignItems="center">
            <Avatar size="md" bg="$blue600">
              <AvatarFallbackText>MH</AvatarFallbackText>
            </Avatar>
            <VStack>
              <Text fontSize="$2xl" fontWeight="$bold" color="$black">My Tasks</Text>
              <HStack alignItems="center" space="xs">
                <Text fontSize="$sm" color="$gray500">List</Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color="#999" />
              </HStack>
            </VStack>
          </HStack>
          <Pressable p="$2">
            <MaterialIcons name="notifications-none" size={28} color="#000" />
          </Pressable>
        </HStack>
      </Box>

      {/* Task Cards */}
      <ScrollView px="$5" showsVerticalScrollIndicator={false}>
        <VStack space="md" pb="$24">
          {tasks.map((task, index) => {
            const theme = getStatusTheme(task.status);
            return (
              <Pressable key={index}>
                <Box
                  bg={theme.bg}
                  rounded="$3xl"
                  p="$5"
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
                        fontWeight="$bold"
                        color="$black"
                        numberOfLines={2}
                      >
                        {task.siteName.split(' ').slice(0, 6).join(' ')} ...
                      </Text>
                      <HStack space="sm">
                        <Text fontSize="$sm" color="$gray600">{task.description}</Text>

                      </HStack>
                    </VStack>
                    <ProgressCircle progress={task.progress} color={theme.progress} size={64} />
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center" mt="$4">
                    <Badge size="md" variant="solid" bg={getPriorityColor(task.priority)} rounded="$full" px="$4" py="$2">
                      <BadgeText color="$white" fontSize="$sm" fontWeight="$medium">
                        {task.priority}
                      </BadgeText>
                    </Badge>

                    <HStack space="sm" alignItems="center">
                      <MaterialIcons name="calendar-today" size={16} color="#999" />
                      <Text fontSize="$sm" color="$gray600">{formatDate(task.startDate)}</Text>
                    </HStack>

                    {/* Avatar Group */}
                    <HStack ml="$2">
                      {task.team?.slice(0, 2).map((member, idx) => (
                        <Avatar
                          key={idx}
                          size="sm"
                          borderWidth={0}
                          borderColor="$white"
                          ml={idx > 0 ? "-$3" : 0}
                        >
                          <AvatarImage
                            source={{ uri: member.uri }}
                            alt={member.name || "User"}
                          />
                          <AvatarFallbackText>
                            
                          </AvatarFallbackText>
                        </Avatar>
                      ))}

                      {/* +N Placeholder */}
                      {task.team && task.team.length > 2 && (
                        <Avatar
                          size="sm"
                          bg="#C9A47E"
                          borderWidth={0}
                          borderColor="$white"
                          ml="-$3"
                        >
                          <Text fontSize="$sm" fontWeight="$bold" color="$white">
                            +{task.team.length - 2}
                          </Text>
                        </Avatar>
                      )}
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

export default Home;
