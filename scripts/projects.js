function dateRange(startStr, endStr) {
  const result = [];
  let current = new Date(startStr);

  const end = new Date(endStr);

  while (current <= end) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function projectColor(priority) {
  switch (priority) {
    case "High": return "#E53935";   // red
    case "Medium": return "#1E88E5"; // blue
    case "Low": return "#43A047";    // green
    default: return "#757575";       // grey
  }
}

function buildMarkedDates(projects, selectedDate) {
  const marked = {};

  // Build dots ONLY
  projects.forEach(project => {
    const dates = dateRange(project.startDate, project.endDate);
    const color = projectColor(project.priority);

    dates.forEach(date => {
      if (!marked[date]) marked[date] = { dots: [] };
      marked[date].dots.push({ key: project._id, color });
    });
  });

  // NOW enforce strict single selection
  const cleanMarked = {};

  Object.keys(marked).forEach(date => {
    cleanMarked[date] = {
      dots: marked[date].dots,
      selected: date === selectedDate,
      selectedColor: date === selectedDate ? "#4DA6FF" : undefined,
    };
  });

  // If selected date has no dots create empty entry
  if (!cleanMarked[selectedDate]) {
    cleanMarked[selectedDate] = {
      selected: true,
      selectedColor: "#4DA6FF",
      dots: [],
    };
  }

  return cleanMarked;
}

function projectsForDate(projects, dateString) {
  const target = new Date(dateString);

  return projects.filter(project => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

    // Normalize times to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    target.setHours(12, 0, 0, 0);

    return target >= start && target <= end;
  });
}
const marked = {};

export { marked, projectColor, buildMarkedDates, projectsForDate };