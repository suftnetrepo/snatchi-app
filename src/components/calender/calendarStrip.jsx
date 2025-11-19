import React, { useMemo, useState } from "react";
import {
  StyledCycle,
  StyledSpinner,
  StyledOkDialog,
} from 'fluent-styles';
import { CalendarList } from "react-native-calendars";
import { Box, Text, VStack } from "@gluestack-ui/themed";
import { ScrollView } from "react-native";
import { theme } from "../../utils/theme";
import { StyledMIcon } from "../../components/icon";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { buildMarkedDates, projectsForDate, projectColor, marked } from "../../../scripts/projects";
import { useProject } from "../../hooks/useProject";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CalendarStrip({ user_id }) {
  const navigator = useNavigation();
  const today = new Date().toISOString().split("T")[0];
  const [selected, setSelected] = useState(today);
  const { data, error, loading } = useProject(user_id);

  const markedDates = useMemo(
    () => buildMarkedDates(data, selected),
    [data, selected]
  );

  const todaysProjects = useMemo(
    () => projectsForDate(data, selected),
    [selected, data]
  );


  if (!marked[selected]) marked[selected] = {};
  marked[selected].selected = true;
  marked[selected].selectedColor = "#4DA6FF";

  if (loading) {
    return (
      <StyledSpinner />
    );
  }

  return (
    <VStack flex={1} >
      <Box paddingHorizontal={8}>
        <CalendarList
          horizontal
          markingType="multi-dot"
          markedDates={markedDates}
          pastScrollRange={12}
          futureScrollRange={12}
          pagingEnabled
          onDayPress={(day) => setSelected(day.dateString)}
          style={{
            width: SCREEN_WIDTH,
            alignSelf: "center",
            borderRadius: 16,
          }}
          theme={{
            selectedDayBackgroundColor: "#4DA6FF",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#E53935",
            dotStyle: { width: 5, height: 5, borderRadius: 3 },
            textDayFontSize: 16,
            textMonthFontSize: 20,
            monthTextColor: "#111827",
          }}
        />
      </Box>
      <VStack mt={8} marginHorizontal={4}>
        {todaysProjects.length === 0 ? (
          <Box
            bg="$backgroundLight0"
            py="$2"
            px="$2"
            mb="$2"
            rounded={16}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text color="$textLight500">No projects scheduled.</Text>
          </Box>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {todaysProjects.map((item) => (
              <Box
                key={item._id}
                bg="$backgroundLight0"
                py="$2"
                px="$2"
                mb="$1"
                rounded={16}
                borderLeftWidth={2}
                borderBottomWidth={1}
                borderRightWidth={1}
                borderTopWidth={1}
                borderRightColor="$gray200"
                borderBottomColor="$gray200"
                borderTopColor="$gray200 "
                borderLeftColor={projectColor(item.priority)}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <VStack marginLeft={4} flex={1}>
                  <Text fontWeight="$normal" fontSize="$md" fontFamily="$crimson.regular">
                    {item.name}
                  </Text>
                </VStack>
                <StyledCycle
                  borderWidth={1}
                  width={46}
                  height={46}
                  borderColor={theme.colors.gray[200]}>
                  <StyledMIcon
                    size={24}
                    name="chevron-right"
                    color={theme.colors.gray[800]}
                    onPress={() => {
                      navigator.navigate('project-details', { id: item._id });
                    }}
                  />
                </StyledCycle>
              </Box>
            ))}
          </ScrollView>
        )}
      </VStack>
      {error && (
        <StyledOkDialog
          title={error}
          description="Please try again later"
          visible={true}
          onOk={() => {
            navigator.goBack();
          }}
        />
      )}
    
    </VStack>
  );
}
