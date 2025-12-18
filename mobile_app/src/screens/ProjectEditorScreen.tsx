/**
 * Project Editor Screen Component for JPE Sims 4 Mod Translator Mobile App
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProjectEditorScreen = ({ route, navigation }) => {
  const { projectId } = route.params || {};
  const [projectName, setProjectName] = useState('New Mod Project');
  const [projectIdText, setProjectIdText] = useState('new_mod_project');
  const [projectVersion, setProjectVersion] = useState('1.0.0');
  const [projectAuthor, setProjectAuthor] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // In a real implementation, this would be populated from API
  const isNewProject = !projectId;

  const saveProject = () => {
    // In a real implementation, this would call the API to save the project
    console.log('Saving project:', {
      projectName,
      projectId: projectIdText,
      version: projectVersion,
      author: projectAuthor,
      description: projectDescription
    });
    
    // Show success message
    alert('Project saved successfully!');
  };

  const buildProject = () => {
    // Navigate to build screen
    navigation.navigate('Build', { projectId: projectIdText });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#2C5F99" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isNewProject ? 'New Project' : 'Edit Project'}
          </Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        <View style={styles.formContainer}>
          {/* Project Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Enter project name"
            />
          </View>

          {/* Project ID Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Project ID *</Text>
            <TextInput
              style={styles.input}
              value={projectIdText}
              onChangeText={setProjectIdText}
              placeholder="Enter project ID (alphanumeric, underscores)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Version Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Version *</Text>
            <TextInput
              style={styles.input}
              value={projectVersion}
              onChangeText={setProjectVersion}
              placeholder="e.g., 1.0.0"
              keyboardType="numeric"
            />
          </View>

          {/* Author Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Author</Text>
            <TextInput
              style={styles.input}
              value={projectAuthor}
              onChangeText={setProjectAuthor}
              placeholder="Your name"
            />
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={projectDescription}
              onChangeText={setProjectDescription}
              placeholder="Describe your project"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Auto-save Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Auto-save</Text>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              thumbColor={autoSaveEnabled ? '#2C5F99' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#93c0e7' }}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={saveProject}>
              <Text style={styles.primaryButtonText}>Save Project</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buildButton} onPress={buildProject}>
            <Icon name="build" size={20} color="#fff" />
            <Text style={styles.buildButtonText}>Build Project</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // For Android
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2C5F99',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  buildButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProjectEditorScreen;