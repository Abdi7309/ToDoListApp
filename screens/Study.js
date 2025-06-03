import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from './styles/Styles';
import API_BASE_URL from '../config/api';
import { LanguageContext } from '../context/LanguageContext';

const Study = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [userId, setUserId] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  
  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);
  const { translate } = useContext(LanguageContext);

  // Handle dimension changes
  useEffect(() => {
    const updateDimensions = ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Load user data and tasks when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          loadData(storedUserId);
        }
      };
      
      loadUser();
    }, [])
  );

  const loadData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}?action=getTasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getTasks',
          user_id: userId,
          category: 'Study',
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
      // Simply calculate next ID by adding 1
      const nextTaskId = taskId + 1;
      console.log('Deleting tasks with IDs:', taskId, nextTaskId); 

      const response = await fetch(`${API_BASE_URL}?action=deleteTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: userId,
          task_id: taskId,
          next_task_id: nextTaskId  // Next consecutive ID
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Remove both the current task and the next ID from UI
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

  const handleBoxPress = () => {
    navigation.navigate('MakeTask', { category: 'Study' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
        <Image style={styles.terug} source={require('../assets/pijl.png')} />
      </TouchableOpacity>
      
      {isLandscape ? (
        <View style={styles.headerContainer}>
          <Image style={styles.foto} source={require('../assets/study2.png')} />
          <View style={styles.textContainer}>
            <Text style={styles.Text1}>{translate('study')}</Text>
            <Text style={styles.Text2}>{tasks.length} {translate('tasks')}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.portraitHeaderContainer}>
          <Image style={styles.foto} source={require('../assets/study2.png')} />
          <Text style={styles.Text1}>{translate('study')}</Text>
          <Text style={styles.Text2}>{tasks.length} {translate('tasks')}</Text>
        </View>
      )}

      <View style={styles.boxes}>
        <ScrollView contentContainerStyle={{paddingBottom: 80}}>
          {tasks.map((task, index) => (
            <View key={task.id} style={styles.taskContainer}>
              <View style={styles.taskContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.titeltekst, { flexWrap: 'wrap', flex: 1, marginRight: 10 }]}>
                    {task.title}
                  </Text>
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

export default Study;