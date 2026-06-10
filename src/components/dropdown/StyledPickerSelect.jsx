
import React, { useState } from "react";
import { TouchableOpacity, Animated, View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { theme } from "../../utils/theme";

export default function StyledPickerSelect({
  placeholder = "Select...",
  items = [],
  onChange,
  error = false,
  errorMessage = ""
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const toggleDropdown = () => {
    const next = !open;
    setOpen(next);

    Animated.timing(rotateAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={{ width: "100%", position: "relative" }}>
      
      {/* INPUT */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleDropdown}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.gray[1],
            borderColor: error
              ? theme.colors.pink[500]   // 🔥 ERROR border
              : theme.colors.gray[400],
          },
        ]}
      >
        <Text
          style={[
            styles.inputText,
            { color: value ? theme.colors.gray[800] : theme.colors.gray[400] },
          ]}
        >
          {value ? items.find(i => i.value === value)?.label : placeholder}
        </Text>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon
            name="keyboard-arrow-down"
            size={22}
            color={error ? theme.colors.pink[500] : theme.colors.gray[500]}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* DROPDOWN FLOATING LIST */}
      {open && (
        <View style={[styles.dropdown]}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                setValue(item.value);
                onChange(item.value);
                toggleDropdown();
              }}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <Text style={{
          marginTop: 2,
          marginHorizontal:4,
          color: theme.colors.pink[500],
          fontSize: 14
        }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8, // space for the icon
    flexDirection: "row",
    alignItems: "",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  inputText: {
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    width: "100%",
    zIndex: 9999,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});
