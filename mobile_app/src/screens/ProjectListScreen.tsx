/**
 * Project List Screen Component for JPE Sims 4 Mod Translator Mobile App
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: 'ready' | 'modified' | 'error';
}

const ProjectListScreen = ({ navigation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    // In a real implementation, this would call the API
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Custom Interactions Pack',
        description: 'A collection of new interactions for Sims',
        lastModified: '2023-10-15',
        status: 'ready'
      },
      {
        id: '2',
        name: 'Moodlet Overhaul',
        description: 'New moodlets to enhance gameplay',
        lastModified: '2023-10-10',
        status: 'modified'
      },
      {
        id: '3',
        name: 'Trait Expansion',
        description: 'Additional traits for personality variety',
        lastModified: '2023-10-05',
        status: 'error'
      }
    ];
    setProjects(mockProjects);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => navigation.navigate('Editor', { projectId: item.id })}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusIndicator, styles[item.status]]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.projectDescription}>{item.description}</Text>
      <Text style={styles.lastModified}>Last modified: {item.lastModified}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => console.log('Add new project')}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Create your first project to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5F99',
  },
  addButton: {
    backgroundColor: '#2C5F99',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  ready: {
    backgroundColor: '#E8F5E9',
  },
  modified: {
    backgroundColor: '#FFF8E1',
  },
  error: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lastModified: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ProjectListScreen;