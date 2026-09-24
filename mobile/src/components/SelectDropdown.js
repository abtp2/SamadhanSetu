import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Mobile-native select dropdown component that replicates the HTML <select> tag behavior
 * with a clean tap-to-open bottom-sheet picker and optional instant search.
 */
export const SelectDropdown = ({
  label,
  placeholder = 'Select an option...',
  value,
  options = [],
  onSelect,
  icon,
  searchable = true,
  modalTitle,
  containerStyle,
  buttonStyle,
  compact = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize options into { label, value } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label || opt.name || String(opt.value),
        value: opt.value !== undefined ? opt.value : opt.label,
        icon: opt.icon,
      };
    }
    return { label: String(opt), value: opt };
  });

  // Find currently selected option's label
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  // Filter options if searchable
  const filteredOptions = searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  const handleSelect = (itemValue) => {
    onSelect(itemValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    setSearchQuery('');
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Select Box (Mimics <select> tag) */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          compact && styles.selectButtonCompact,
          buttonStyle,
        ]}
        onPress={handleOpen}
        activeOpacity={0.75}
      >
        <View style={styles.selectContent}>
          {icon && (
            <Ionicons
              name={icon}
              size={compact ? 14 : 16}
              color="#0f2c59"
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.selectText,
              compact && styles.selectTextCompact,
              !value && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={compact ? 14 : 16} color="#64748b" />
      </TouchableOpacity>

      {/* Modal Dropdown Picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.sheet}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {modalTitle || (label ? `Select ${label}` : 'Select an Option')}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Search Input (if enabled and more than 6 options) */}
            {searchable && normalizedOptions.length > 6 && (
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={16} color="#64748b" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}_${index}`}
              keyboardShouldPersistTaps="handled"
              style={styles.optionsList}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching options found</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      {item.icon && (
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isSelected ? '#0f2c59' : '#64748b'}
                          style={{ marginRight: 10 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#0f2c59" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
  },
  selectButtonCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 34,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  selectTextCompact: {
    fontSize: 11,
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f2c59',
  },
  closeBtn: {
    padding: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    paddingVertical: 0,
  },
  optionsList: {
    maxHeight: 380,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#0f2c59',
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
