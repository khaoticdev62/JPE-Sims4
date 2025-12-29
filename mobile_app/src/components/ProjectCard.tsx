/**
 * ProjectCard Component for JPE Sims 4 Mod Translator Mobile App
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: 'ready' | 'modified' | 'error';
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  lastModified,
  status,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ready': return '#E8F5E9';
      case 'modified': return '#FFF8E1';
      case 'error': return '#FFEBEE';
      default: return '#f5f5f5';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'modified': return 'Modified';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.projectName} numberOfLines={1}>{name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <Text style={styles.projectDescription} numberOfLines={2}>{description}</Text>
        <Text style={styles.lastModified}>Last modified: {lastModified}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
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
    marginRight: 10,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
});

export default ProjectCard;