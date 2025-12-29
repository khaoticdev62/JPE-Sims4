/**
 * Build Screen Component for JPE Sims 4 Mod Translator Mobile App
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BuildScreen = ({ navigation, route }) => {
  const { projectId } = route.params || {};
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [buildId, setBuildId] = useState('');

  const startBuild = async () => {
    if (!projectId) {
      Alert.alert('Error', 'No project selected for build');
      return;
    }

    // Reset UI
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildOutput([]);
    const newBuildId = `build_${Date.now()}`;
    setBuildId(newBuildId);

    // In a real implementation, this would call the API
    try {
      // Simulate build process
      const steps = [
        'Initializing build environment...',
        'Parsing project files...',
        'Validating syntax...',
        'Generating XML files...',
        'Processing dependencies...',
        'Creating package...',
        'Build completed successfully!'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
        setBuildOutput(prev => [...prev, steps[i]]);
        setBuildProgress(Math.floor(((i + 1) / steps.length) * 100));
      }

      setBuildStatus('success');
    } catch (error) {
      setBuildStatus('error');
      setBuildOutput(prev => [...prev, `Build failed: ${error.message}`]);
      Alert.alert('Build Failed', `Error: ${error.message}`);
    }
  };

  const cleanBuild = () => {
    // In a real implementation, this would send clean request to API
    setBuildStatus('idle');
    setBuildProgress(0);
    setBuildOutput(['Build directory cleaned']);
    setBuildId('');
    Alert.alert('Clean Build', 'Build directory has been cleaned');
  };

  const exportBuild = () => {
    // In a real implementation, this would handle exporting
    if (buildStatus !== 'success') {
      Alert.alert('Export Error', 'Cannot export an unsuccessful build');
      return;
    }
    
    Alert.alert('Export Completed', `Build ${buildId} has been exported.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#2C5F99" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Build Project</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.projectInfo}>Project: {projectId || 'No project selected'}</Text>

          {/* Build Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={startBuild} disabled={buildStatus === 'building'}>
              <Icon name="play-arrow" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>
                {buildStatus === 'building' ? 'Building...' : 'Build Project'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={cleanBuild} disabled={buildStatus === 'building'}>
              <Icon name="delete-sweep" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Clean Build</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.controlButton, styles.exportButton]} onPress={exportBuild} disabled={buildStatus !== 'success'}>
              <Icon name="file-download" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Export</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[styles.progressBar, { width: `${buildProgress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{buildProgress}%</Text>
          </View>

          {/* Build Status */}
          {buildStatus !== 'idle' && (
            <View style={[styles.statusContainer, styles[`${buildStatus}Status`]]}>
              <Icon 
                name={buildStatus === 'success' ? 'check-circle' : buildStatus === 'error' ? 'error' : 'hourglass-empty'} 
                size={24} 
                color={buildStatus === 'success' ? '#4CAF50' : buildStatus === 'error' ? '#F44336' : '#FF9800'} 
              />
              <Text style={styles.statusText}>
                {buildStatus === 'building' && 'Building...'}
                {buildStatus === 'success' && 'Build Successful!'}
                {buildStatus === 'error' && 'Build Failed'}
              </Text>
            </View>
          )}

          {/* Build Output Log */}
          <View style={styles.outputContainer}>
            <Text style={styles.outputTitle}>Build Output:</Text>
            {buildOutput.length === 0 ? (
              <Text style={styles.noOutputText}>Build output will appear here...</Text>
            ) : (
              <ScrollView style={styles.outputScroll}>
                {buildOutput.map((line, index) => (
                  <Text key={index} style={styles.outputLine}>{line}</Text>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Additional Info */}
          {buildId ? (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Build Info:</Text>
              <Text>Build ID: {buildId}</Text>
              <Text>Status: {buildStatus}</Text>
            </View>
          ) : null}
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
  contentContainer: {
    padding: 20,
  },
  projectInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F99',
    marginBottom: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#2C5F99',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#2C5F99',
    borderRadius: 5,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  idleStatus: {
    backgroundColor: '#f5f5f5',
  },
  buildingStatus: {
    backgroundColor: '#FFF8E1',
  },
  successStatus: {
    backgroundColor: '#E8F5E9',
  },
  errorStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  outputContainer: {
    marginBottom: 20,
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  outputScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  noOutputText: {
    fontStyle: 'italic',
    color: '#999',
  },
  outputLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  infoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
});

export default BuildScreen;