import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStyles from './uiterlijk';

const CategoryScreen = ({ route, navigation }) => {
  const { category, iconUrl } = route.params;
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [userId, setUserId] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);

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
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
        loadData(storedUserId);
      }
    };
    loadUser();

    const focusListener = navigation.addListener('focus', () => {
      loadUser();
    });

    return () => {
      navigation.removeListener('focus', focusListener);
    };
  }, [navigation]);

  const loadData = async (userId) => {
    try {
      const response = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=getTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          category: category,
          is_custom: true
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(data.tasks);
      } else {
        Alert.alert('Error', data.message || 'Failed to load tasks');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=deleteTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: userId,
          task_id: taskId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(tasks.filter(task => task.id !== taskId));
        Alert.alert('Success', 'Task deleted successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getCategoryIcon = () => {
    if (iconUrl) {
      return { uri: `http://10.3.1.86/ToDoListApp/screens/backend/${iconUrl}` };
    }
    return require('../assets/menu3.png'); // fallback icon
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image style={styles.terug} source={require('../assets/pijl.png')} />
      </TouchableOpacity>
      
      {isLandscape ? (
        <View style={styles.headerContainer}>
          <Image 
            style={styles.foto} 
            source={getCategoryIcon()}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.Text1}>{category}</Text>
            <Text style={styles.Text2}>{tasks.length} Tasks</Text>
          </View>
        </View>
      ) : (
        <View style={styles.portraitHeaderContainer}>
          <Image 
            style={styles.foto} 
            source={getCategoryIcon()}
            resizeMode="cover"
          />
          <Text style={styles.Text1}>{category}</Text>
          <Text style={styles.Text2}>{tasks.length} Tasks</Text>
        </View>
      )}

      <View style={styles.boxes}>
        <ScrollView>
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
        onPress={() => navigation.navigate('MakeTask', { category, is_custom: true })}
      >
        <Image style={styles.footerplus} source={require('../assets/plus.png')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CategoryScreen;
