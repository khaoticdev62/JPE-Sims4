/**
 * JPE Sims 4 Mod Translator - Cross-Platform Mobile App
 * Main App Component
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ProjectListScreen from './src/screens/ProjectListScreen';
import ProjectEditorScreen from './src/screens/ProjectEditorScreen';
import BuildScreen from './src/screens/BuildScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    flex: 1,
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'JPE Translator' }}
          />
          <Stack.Screen
            name="Projects"
            component={ProjectListScreen}
            options={{ title: 'Projects' }}
          />
          <Stack.Screen
            name="Editor"
            component={ProjectEditorScreen}
            options={{ title: 'Project Editor' }}
          />
          <Stack.Screen
            name="Build"
            component={BuildScreen}
            options={{ title: 'Build & Export' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;