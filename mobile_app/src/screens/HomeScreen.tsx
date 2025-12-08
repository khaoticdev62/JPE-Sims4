/**
 * Home Screen Component for JPE Sims 4 Mod Translator Mobile App
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>JPE Sims 4 Mod Translator</Text>
          <Text style={styles.subtitle}>Create Sims 4 mods with simple English</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Projects')}
          >
            <Icon name="folder" size={24} color="#2C5F99" />
            <Text style={styles.actionButtonText}>Browse Projects</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => console.log('New project')}
          >
            <Icon name="add-circle-outline" size={24} color="#2C5F99" />
            <Text style={styles.actionButtonText}>New Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Build')}
          >
            <Icon name="build" size={24} color="#2C5F99" />
            <Text style={styles.actionButtonText}>Build Project</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <View style={styles.recentProjectCard}>
            <Text style={styles.projectName}>My Awesome Mod</Text>
            <Text style={styles.projectDetails}>Last modified: Today</Text>
          </View>
          <View style={styles.recentProjectCard}>
            <Text style={styles.projectName}>Custom Interactions Pack</Text>
            <Text style={styles.projectDetails}>Last modified: Yesterday</Text>
          </View>
        </View>

        {/* Learn Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn JPE</Text>
          <TouchableOpacity
            style={styles.learnButton}
            onPress={() => alert('Documentation would open here')}
          >
            <Icon name="school" size={24} color="#fff" />
            <Text style={styles.learnButtonText}>View Tutorials</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5F99',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recentProjectCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F99',
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  learnButton: {
    backgroundColor: '#2C5F99',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  learnButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;