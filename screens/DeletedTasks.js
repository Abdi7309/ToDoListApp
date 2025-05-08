import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DeletedTasks({ navigation }) {
  const [deletedTasks, setDeletedTasks] = useState([]);

  useEffect(() => {
    loadDeletedTasks();
  }, []);

  const loadDeletedTasks = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=getDeletedTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setDeletedTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error loading deleted tasks:', error);
    }
  };

  const handleRestore = async (taskId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=restoreTask', {
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
        loadDeletedTasks(); // Refresh the list
      }
    } catch (error) {
      console.error('Error restoring task:', error);
    }
  };

  const handlePermanentDelete = async (taskId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=permanentDelete', {
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
        loadDeletedTasks(); // Refresh the list
      }
    } catch (error) {
      console.error('Error permanently deleting task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.backButton} source={require('../assets/pijl.png')} />
        </TouchableOpacity>
        <Text style={styles.title}>Deleted Tasks</Text>
      </View>

      <ScrollView style={styles.taskList}>
        {deletedTasks.map((task, index) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskCategory}>From Category: {task.category_name || 'Uncategorized'}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={() => handleRestore(task.id)}
              >
                <Text style={styles.restoreButtonText}>Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handlePermanentDelete(task.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  backButton: {
    top: -8,
    width: 20,
    height: 20,
  },
  title: {
    top: -8,
    fontSize: 20,
    left: 80,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 20,
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
});
