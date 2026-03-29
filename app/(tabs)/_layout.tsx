import React from "react";

import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { NavigationTabs } from "@/components/ui/NavigationTabs";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NavigationTabs {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: "absolute" },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="social/index"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="layers" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="files/index"
        options={{
          title: "Files",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="doc.text" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donasi/index"
        options={{
          title: "Donasi",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
