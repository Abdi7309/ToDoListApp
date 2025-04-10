import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './uiterlijk';

const Work = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        setUser({ id: userId });
        loadData(userId);
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
      const response = await fetch('http://10.3.1.47/ToDoListApp/screens/backend/api.php?action=getTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getTasks',
          user_id: userId,
          category: 'Work',
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(data.tasks);
      } else {
        Alert.alert('Error', 'Failed to load tasks');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch('http://10.3.1.47/ToDoListApp/screens/backend/api.php?action=deleteTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteTask',
          user_id: user.id,
          task_id: taskId,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks(tasks.filter(task => task.id !== taskId));
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

  const handleBoxPress = (screenName) => {
    navigation.navigate(screenName, { category: 'Work' });
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
        onPress={() => handleBoxPress('MakeTask')}
      >  
        <Image style={styles.footerplus} source={require('../assets/plus.png')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Work;
