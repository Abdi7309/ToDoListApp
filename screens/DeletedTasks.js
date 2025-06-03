import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';
import { LanguageContext } from '../context/LanguageContext';

export default function DeletedTasks({ navigation }) {
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  
  const isLandscape = dimensions.width > dimensions.height;
  const { translate } = useContext(LanguageContext);

  useEffect(() => {
    const updateDimensions = ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    loadDeletedTasks();
  }, []);

  const loadDeletedTasks = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const response = await fetch(`${API_BASE_URL}?action=getDeletedTasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      const data = await response.json();
      console.log('Deleted tasks response:', data); // Debug log

      if (data.status === 'success') {
        setDeletedTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load deleted tasks');
      }
    } catch (error) {
      console.error('Error loading deleted tasks:', error);
      Alert.alert('Error', 'Failed to load deleted tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (taskId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const nextTaskId = taskId + 1;

      const response = await fetch(`${API_BASE_URL}?action=restoreTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          task_id: taskId,
          next_task_id: nextTaskId
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Task restored successfully');
        await loadDeletedTasks();
      } else {
        Alert.alert('Error', data.message || 'Failed to restore task');
      }
    } catch (error) {
      console.error('Error restoring task:', error);
      Alert.alert('Error', 'Failed to restore task');
    }
  };

  const handlePermanentDelete = async (taskId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_BASE_URL}?action=permanentDelete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          task_id: taskId
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Task permanently deleted');
        await loadDeletedTasks();
      } else {
        Alert.alert('Error', data.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.backButton} source={require('../assets/pijl.png')} />
        </TouchableOpacity>
        <Text style={[styles.title, isLandscape && styles.titleLandscape]}>{translate('deleted_tasks')}</Text>
      </View>

      <ScrollView style={styles.taskList}>
        {loading ? (
          <ActivityIndicator size="large" color="rgba(49, 74, 164, 1)" style={styles.loader} />
        ) : deletedTasks.length === 0 ? (
          <Text style={styles.noTasksText}>{translate('no_tasks_found')}</Text>
        ) : (
          deletedTasks.map((task, index) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.taskCategory}>{translate('from_category')}: {task.category_name}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.restoreButton}
                  onPress={() => handleRestore(task.id)}
                >
                  <Text style={styles.restoreButtonText}>{translate('restore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handlePermanentDelete(task.id)}
                >
                  <Text style={styles.deleteButtonText}>{translate('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(49, 74, 164, 1)',
    paddingTop: 40,
  },
  headerLandscape: {
    justifyContent: 'center',
  },
  backButton: {
    top: -8,
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,  
    top: -8,
  },
  titleLandscape: {
    position: 'absolute',
    marginTop: 35,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  taskList: {
    padding: 20,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  taskCategory: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  restoreButton: {
    backgroundColor: 'rgba(49, 74, 164, 1)',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loader: {
    marginTop: 50,
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
