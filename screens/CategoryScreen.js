import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStyles from './styles/Styles';

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
      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=getTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          category: category,
          is_custom: true,
          categoryId: route.params.categoryId // Add categoryId
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
      const nextTaskId = taskId + 1;
      console.log('Deleting tasks with IDs:', taskId, nextTaskId); 

      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=deleteTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: userId,
          task_id: taskId,
          next_task_id: nextTaskId
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(currentTasks => 
          currentTasks.filter(task => task.id !== taskId && task.id !== nextTaskId)
        );
        Alert.alert('Success', 'Tasks deleted successfully');
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

  const getCategoryIcon = () => {
    if (iconUrl) {
      return { uri: `http://10.3.1.75/ToDoListApp/screens/backend/${iconUrl}` };
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
        onPress={() => navigation.navigate('MakeTask', { 
          category: category,
          isCustom: true,
          categoryId: route.params.categoryId // Pass categoryId to MakeTask
        })}
      >
        <Image style={styles.footerplus} source={require('../assets/plus.png')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CategoryScreen;
