import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryScreen = ({ route, navigation }) => {
  const { category, iconUrl } = route.params;
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [userId, setUserId] = useState(null);

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
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=getTasks', {
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
      const response = await fetch('http://10.3.1.58/ToDoListApp/screens/backend/api.php?action=deleteTask', {
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
      return { uri: `http://10.3.1.58/ToDoListApp/screens/backend/${iconUrl}` };
    }
    return require('../assets/menu3.png'); // fallback icon
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image style={styles.terug} source={require('../assets/pijl.png')} />
      </TouchableOpacity>
      <View>
        <Image 
          style={styles.foto} 
          source={getCategoryIcon()}
          resizeMode="cover"
        />
      </View>
      <View>
        <Text style={styles.Text1}>{category}</Text>
        <Text style={styles.Text2}>{tasks.length} Tasks</Text>
      </View>

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(49, 74, 164, 1)',
    flex: 1,
  },

  boxes: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    width: '100%',
    top: '1%',
    height: '61%',
    paddingBottom: 10,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  titeltekst: {
    top: 16,
    fontSize: 24,
    color: 'black',
    fontWeight: '600',
  },
  descriptiontekst: {
    color: 'rgba(169, 169, 169, 1)',
    fontSize: 20,
    top: 10,
    paddingLeft: 2,
    flexWrap: 'wrap',
  },
  terug: {
    width: 20,
    height: 20,
    marginLeft: 30,
    marginTop: 50,
  },
  deleteButton: {
    color: 'red',
    marginLeft: 30,
    marginBottom: 10,
  },
  foto: {
    top: "160%",
    marginLeft: 40,
    borderRadius: 1000,
    height: 60, 
    width: 60,
  },
  Text1: {
    marginTop: 115,
    color: 'white',
    fontSize: 32,
    left:50,
    
  },
  Text2: {
    color: 'white',
    marginBottom: 20,
    fontSize: 12,
    left:50,
  },
  trash: {
    top: 16,
    height: 40,
    width: 40,
  },
  trashContainer: {
    position: 'absolute',
    right: '10%',
    top: 30,
  },
  trashButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: 70,
    width: 70,
    borderRadius: 50,
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(49, 74, 164, 1)',
  },
  footerplus: {
    height: 25,
    width: 25,
    left: 22,
    top: 21,
  },
  taskContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  taskContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  }

});

export default CategoryScreen;
