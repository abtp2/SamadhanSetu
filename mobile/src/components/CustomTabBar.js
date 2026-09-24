import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TAB_CONFIG = {
  Home: {
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  Explore: {
    label: 'Explore',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  Report: {
    label: 'Report',
    activeIcon: 'add',
    inactiveIcon: 'add',
  },
  MyReports: {
    label: 'My Reports',
    activeIcon: 'document-text',
    inactiveIcon: 'document-text-outline',
  },
  Profile: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8);

  return (
    <View style={[styles.barContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          label: route.name,
          activeIcon: 'ellipse',
          inactiveIcon: 'ellipse-outline',
        };

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : config.label;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Center special raised Floating Action Button for "Report"
        if (route.name === 'Report') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || 'Report an Issue'}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.centerTabItem}
              activeOpacity={0.88}
            >
              <View style={[styles.centerFab, isFocused && styles.centerFabFocused]}>
                <Ionicons name="add" size={28} color="#ffffff" />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.centerLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Standard tabs (Home, Explore, My Reports, Profile)
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.75}
          >
            <View style={[styles.iconPillWrapper, isFocused && styles.activePill]}>
              <Ionicons
                name={isFocused ? config.activeIcon : config.inactiveIcon}
                size={21}
                color={isFocused ? '#0f2c59' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconPillWrapper: {
    height: 32,
    minWidth: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activePill: {
    backgroundColor: '#e8f0fe',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 1,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#0f2c59',
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: '#64748b',
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  centerFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0f2c59',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    marginBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  centerFabFocused: {
    backgroundColor: '#16396b',
    transform: [{ scale: 1.05 }],
  },
  centerLabelActive: {
    fontWeight: '700',
    color: '#0f2c59',
  },
});
