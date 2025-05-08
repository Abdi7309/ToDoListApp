import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './uiterlijk';

const Work = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [userId, setUserId] = useState(null);

  const loadData = async (userId) => {
    try {
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=getTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'getTasks',
          user_id: userId,
          category: 'Work',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server didn't return JSON");
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.status === 'success') {
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        throw new Error(data.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', error.message || 'Failed to load tasks');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
            setUserId(storedUserId);
            loadData(storedUserId);
        }
    };

    loadUser();

    const unsubscribe = navigation.addListener('focus', () => {
        loadUser(); // Reload data when screen comes into focus
    });

    return unsubscribe;
  }, [navigation]);

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=deleteTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: userId,
          task_id: taskId,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(tasks.filter(task => task.id !== taskId));
        Alert.alert('Success', 'Task deleted successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to delete task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleBoxPress = () => {
    navigation.navigate('MakeTask', { category: 'Work' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
        <Image style={styles.terug} source={require('../assets/pijl.png')} />
      </TouchableOpacity>
      <View>
        <Image style={styles.foto} source={require('../assets/work2.png')} />
      </View>
      <View>
        <Text style={styles.Text1}>Work</Text>
        <Text style={styles.Text2}>{tasks.length} Tasks</Text>
      </View>

      <View style={styles.boxes}>
        <ScrollView>
          <Text style={styles.tijdtekst}></Text>
          {tasks.map((task, index) => (
            <View key={task.id} style={styles.taskContainer}>
              <View style={styles.taskContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.titeltekst}>{task.title}</Text>
                  <TouchableOpacity 
                    style={styles.trashButton} 
                    onPress={() => deleteTask(task.id)}
                  >
                    <Image style={styles.trash} source={require('../assets/trash.png')} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => toggleDescription(index)}>
                  <Text style={styles.descriptiontekst}>
                    {expandedDescriptions[index] 
                      ? task.description 
                      : task.description.length > 14 
                        ? task.description.substring(0, 14).trim() + '...'
                        : task.description
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity 
        style={styles.footer}
        onPress={handleBoxPress}
      >  
        <Image style={styles.footerplus} source={require('../assets/plus.png')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Work;
