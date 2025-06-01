import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="createQr"
        options={{
          title: 'Kreiraj QR',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicleData"
        options={{
          title: 'Vozila',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="car" color={color} />,
        }}
      />
      <Tabs.Screen
        name="userDetails"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Odjava',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="rectangle.portrait.and.arrow.right" color={color} />,
        }}
      />
    </Tabs>
  );
}