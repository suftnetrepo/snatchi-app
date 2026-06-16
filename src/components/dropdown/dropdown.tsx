import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  StatusBar,
  ViewStyle,
  TextStyle,
  TextInput,
} from 'react-native';
import React, {useCallback, useRef, useState, useMemo} from 'react';
import MIcon from 'react-native-vector-icons/AntDesign';

type OptionItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface DropDownProps {
  data: OptionItem[];
  onChange: (item: OptionItem) => void;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  maxHeight?: number;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  dropdownStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
  separatorStyle?: ViewStyle;
  showSearch?: boolean;
  searchPlaceholder?: string;
  zIndex?: number;
  // Label
  label?: string;
  labelStyle?: TextStyle;
  // Error
  error?: boolean;
  errorMessage?: string;
  errorStyle?: TextStyle;
}

export function Dropdown({
  data,
  onChange,
  placeholder,
  value,
  disabled = false,
  maxHeight = 250,
  containerStyle,
  buttonStyle,
  textStyle,
  placeholderStyle,
  dropdownStyle,
  itemStyle,
  itemTextStyle,
  separatorStyle,
  showSearch = false,
  searchPlaceholder = 'Search...',
  zIndex = 1000,
  label,
  labelStyle,
  error = false,
  errorMessage,
  errorStyle,
}: DropDownProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const buttonRef = useRef<any>(null);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  const selectedItem = useMemo(() => {
    return data.find(item => item.value === value);
  }, [data, value]);

  const filteredData = useMemo(() => {
    if (!showSearch || !searchQuery.trim()) return data;
    return data.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery, showSearch]);

  const toggleExpanded = useCallback(() => {
    if (disabled) return;
    setExpanded(prev => {
      if (!prev) {
        buttonRef.current?.measureInWindow(
          (x: any, y: any, width: any, height: any) => {
            setButtonLayout({x, y, width, height});
          },
        );
      }
      return !prev;
    });
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setExpanded(false);
    setSearchQuery('');
  }, []);

  const onSelect = useCallback(
    (item: OptionItem) => {
      if (item.disabled) return;
      onChange(item);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  const dropdownPosition = useMemo(() => {
    const statusBarHeight =
      Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const spaceAbove = buttonLayout.y - statusBarHeight;
    const spaceBelow =
      screenHeight - (buttonLayout.y + buttonLayout.height) - statusBarHeight;

    const estimatedHeight = Math.min(
      maxHeight,
      data.length * 44 + (showSearch ? 50 : 0) + 20,
    );

    const shouldShowAbove =
      spaceBelow < estimatedHeight && spaceAbove > estimatedHeight;

    return {
      top: shouldShowAbove
        ? buttonLayout.y - estimatedHeight - 5
        : buttonLayout.y + buttonLayout.height + 5,
      left: Math.max(
        20,
        Math.min(buttonLayout.x, screenWidth - buttonLayout.width - 20),
      ),
      width: buttonLayout.width,
      maxHeight: shouldShowAbove ? spaceAbove - 10 : spaceBelow - 10,
    };
  }, [
    buttonLayout,
    screenHeight,
    screenWidth,
    maxHeight,
    data.length,
    showSearch,
  ]);

  const renderItem = useCallback(
    ({item}: {item: OptionItem}) => (
      <TouchableOpacity
        activeOpacity={item.disabled ? 1 : 0.7}
        style={[
          styles.optionItem,
          itemStyle,
          item.disabled && styles.disabledItem,
          item.value === value && styles.selectedItem,
        ]}
        onPress={() => onSelect(item)}>
        <Text
          style={[
            styles.optionText,
            itemTextStyle,
            item.disabled && styles.disabledText,
            item.value === value && styles.selectedText,
          ]}>
          {item.label}
        </Text>
        {item.value === value && (
          <MIcon name="check" size={16} color="#007AFF" />
        )}
      </TouchableOpacity>
    ),
    [value, onSelect, itemStyle, itemTextStyle],
  );

  const displayText = selectedItem?.label || '';

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {/* Button */}
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          buttonStyle,
          disabled && styles.disabledButton,
          expanded && styles.expandedButton,
          error && styles.errorButton,
        ]}
        activeOpacity={disabled ? 1 : 0.8}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={`Dropdown, ${
          selectedItem ? `selected ${selectedItem.label}` : placeholder
        }`}
        accessibilityState={{disabled, expanded}}>
        <Text
          style={[
            styles.text,
            textStyle,
            !displayText && [styles.placeholder, placeholderStyle],
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}>
          {displayText || placeholder}
        </Text>
        <MIcon
          name={expanded ? 'caretup' : 'caretdown'}
          size={12}
          color={disabled ? '#999' : '#333'}
        />
      </TouchableOpacity>

      {/* Error message */}
      {error && errorMessage && (
        <Text style={[styles.errorText, errorStyle]}>{errorMessage}</Text>
      )}

      {/* Dropdown modal */}
      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDropdown}>
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.options,
                  dropdownStyle,
                  {...dropdownPosition, zIndex},
                ]}>
                {showSearch && (
                  <View style={styles.searchContainer}>
                    <MIcon
                      name="search1"
                      size={16}
                      color="#999"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                {filteredData.length > 0 ? (
                  <FlatList
                    keyExtractor={item => item.value}
                    data={filteredData}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => (
                      <View style={[styles.separator, separatorStyle]} />
                    )}
                    style={styles.flatList}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No options found</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginHorizontal: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    height: 50,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  expandedButton: {
    borderColor: '#007AFF',
    shadowOpacity: 0.2,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E1E1E1',
    opacity: 0.6,
  },
  errorButton: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 4,
    marginHorizontal: 4,
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  disabledText: {
    color: '#999',
  },
  options: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    padding: 8,
  },
  flatList: {
    flexGrow: 0,
  },
  optionItem: {
    height: 44,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  disabledItem: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
