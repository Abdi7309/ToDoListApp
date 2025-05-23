import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from './uiterlijk';

const Work = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [userId, setUserId] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);

  const loadData = async (userId) => {
    try {
      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=getTasks', {
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

  const deleteTask = async (taskId) => {
    try {
      // Get matching task from All category (taskId + 1)
      const allCategoryTaskId = taskId + 1;
      console.log('Deleting tasks with IDs:', taskId, allCategoryTaskId);

      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=deleteTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: userId,
          task_id: taskId,
          next_task_id: allCategoryTaskId
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Remove both tasks from the local state
        setTasks(currentTasks => 
          currentTasks.filter(task => task.id !== taskId && task.id !== allCategoryTaskId)
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to delete tasks');
      }
    } catch (error) {
      console.error('Delete error:', error);
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
      
      {isLandscape ? (
        <View style={styles.headerContainer}>
          <Image style={styles.foto} source={require('../assets/work2.png')} />
          <View style={styles.textContainer}>
            <Text style={styles.Text1}>Work</Text>
            <Text style={styles.Text2}>{tasks.length} Tasks</Text>
          </View>
        </View>
      ) : (
        <View style={styles.portraitHeaderContainer}>
          <Image style={styles.foto} source={require('../assets/work2.png')} />
          <Text style={styles.Text1}>Work</Text>
          <Text style={styles.Text2}>{tasks.length} Tasks</Text>
        </View>
      )}

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
