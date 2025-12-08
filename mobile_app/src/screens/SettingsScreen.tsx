/**
 * Settings Screen Component for JPE Sims 4 Mod Translator Mobile App
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({ navigation }) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(true);
  const [lineNumbersVisible, setLineNumbersVisible] = useState(true);
  const [fontSize, setFontSize] = useState(14); // In a real app, this would affect editor font size
  const [theme, setTheme] = useState('default'); // Could be 'light', 'dark', 'high-contrast', etc.
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState(5); // In minutes

  const toggleAutoSave = (value: boolean) => {
    setAutoSaveEnabled(value);
  };

  const toggleWordWrap = (value: boolean) => {
    setWordWrapEnabled(value);
  };

  const toggleLineNumbers = (value: boolean) => {
    setLineNumbersVisible(value);
  };

  const increaseFontSize = () => {
    if (fontSize < 20) {
      setFontSize(fontSize + 1);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 10) {
      setFontSize(fontSize - 1);
    }
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    // In a real implementation, this would update the app's theme
    Alert.alert('Theme Changed', `Theme changed to ${newTheme}`);
  };

  const toggleBackup = (value: boolean) => {
    setBackupEnabled(value);
  };

  const updateBackupInterval = (newValue: number) => {
    if (newValue >= 1 && newValue <= 60) {
      setBackupInterval(newValue);
    }
  };

  const clearCache = () => {
    // In a real implementation, this would clear app cache/data
    Alert.alert('Cache Cleared', 'Application cache has been cleared');
  };

  const exportSettings = () => {
    // In a real implementation, this would export settings to a file
    Alert.alert('Export Settings', 'Settings exported successfully');
  };

  const importSettings = () => {
    // In a real implementation, this would import settings from a file
    Alert.alert('Import Settings', 'Settings imported successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editor Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-save</Text>
            <Switch
              value={autoSaveEnabled}
              onValueChange={toggleAutoSave}
              trackColor={{ false: '#767577', true: '#81B29A' }}
              thumbColor={autoSaveEnabled ? '#2C5F99' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Word Wrap</Text>
            <Switch
              value={wordWrapEnabled}
              onValueChange={toggleWordWrap}
              trackColor={{ false: '#767577', true: '#81B29A' }}
              thumbColor={wordWrapEnabled ? '#2C5F99' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Line Numbers</Text>
            <Switch
              value={lineNumbersVisible}
              onValueChange={toggleLineNumbers}
              trackColor={{ false: '#767577', true: '#81B29A' }}
              thumbColor={lineNumbersVisible ? '#2C5F99' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.fontSizeControls}>
              <TouchableOpacity onPress={decreaseFontSize} style={styles.fontSizeButton}>
                <Icon name="remove" size={20} color="#2C5F99" />
              </TouchableOpacity>
              <Text style={styles.fontSizeValue}>{fontSize}px</Text>
              <TouchableOpacity onPress={increaseFontSize} style={styles.fontSizeButton}>
                <Icon name="add" size={20} color="#2C5F99" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeSelector}>
              {['Default', 'Dark', 'Light', 'High Contrast'].map((themeOption) => (
                <TouchableOpacity 
                  key={themeOption}
                  style={[
                    styles.themeOption, 
                    theme === themeOption.toLowerCase() && styles.selectedTheme
                  ]}
                  onPress={() => changeTheme(themeOption.toLowerCase())}
                >
                  <Text style={[
                    styles.themeOptionText,
                    theme === themeOption.toLowerCase() && styles.selectedThemeText
                  ]}>
                    {themeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Sync</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Auto-Backup</Text>
            <Switch
              value={backupEnabled}
              onValueChange={toggleBackup}
              trackColor={{ false: '#767577', true: '#81B29A' }}
              thumbColor={backupEnabled ? '#2C5F99' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Backup Interval (minutes)</Text>
            <View style={styles.intervalControls}>
              <TouchableOpacity 
                onPress={() => updateBackupInterval(backupInterval - 1)} 
                disabled={backupInterval <= 1}
                style={backupInterval <= 1 ? styles.disabledButton : styles.intervalButton}
              >
                <Icon name="remove" size={20} color={backupInterval <= 1 ? '#ccc' : '#2C5F99'} />
              </TouchableOpacity>
              <Text style={styles.intervalValue}>{backupInterval}</Text>
              <TouchableOpacity 
                onPress={() => updateBackupInterval(backupInterval + 1)} 
                disabled={backupInterval >= 60}
                style={backupInterval >= 60 ? styles.disabledButton : styles.intervalButton}
              >
                <Icon name="add" size={20} color={backupInterval >= 60 ? '#ccc' : '#2C5F99'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
            <Text style={styles.actionButtonText}>Clear Cache</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportSettings}>
            <Text style={styles.actionButtonText}>Export Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={importSettings}>
            <Text style={styles.actionButtonText}>Import Settings</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionInfo}>App Version: 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5F99',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 8,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeButton: {
    padding: 5,
  },
  fontSizeValue: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  themeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedTheme: {
    backgroundColor: '#2C5F99',
  },
  themeOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedThemeText: {
    color: '#fff',
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalButton: {
    padding: 5,
  },
  disabledButton: {
    padding: 5,
    opacity: 0.5,
  },
  intervalValue: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2C5F99',
    fontWeight: '500',
  },
  versionInfo: {
    textAlign: 'center',
    padding: 20,
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;