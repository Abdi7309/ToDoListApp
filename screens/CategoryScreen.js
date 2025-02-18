import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './uiterlijk';

const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [tasks, setTasks] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    loadData();
    const focusListener = navigation.addListener('focus', loadData);
    return () => navigation.removeListener('focus', loadData);
  }, [navigation]);

  const loadData = async () => {
    try {
      console.log('Route Params:', route.params);
      
      const customCategoriesString = await AsyncStorage.getItem('customCategories');
      const customCategories = JSON.parse(customCategoriesString) || [];
      
      const foundCategory = customCategories.find(cat => cat.name === category);
      
      if (foundCategory) {
        setCategoryData(foundCategory);
        console.log('Category Found:', foundCategory);
      } else {
        console.warn('Category not found in AsyncStorage:', category);
      }
      
      const tasksString = await AsyncStorage.getItem('tasks');
      const allTasks = JSON.parse(tasksString) || [];
      const filteredTasks = allTasks.filter(task => task.page === category);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const deleteTask = async (index) => {
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      let allTasks = JSON.parse(tasksString) || [];
      
      const taskToDelete = tasks[index];

      allTasks = allTasks.filter(task => 
        !(task.text === taskToDelete.text && task.description === taskToDelete.description)
      );

      await AsyncStorage.setItem('tasks', JSON.stringify(allTasks));
      setTasks(allTasks.filter(task => task.page === category));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
        <Image style={styles.terug} source={require('../assets/pijl.png')} />
      </TouchableOpacity>
      <View>
        <Image 
          style={styles.foto} 
          source={
            categoryData?.icon && categoryData.icon.startsWith('file://')
              ? { uri: categoryData.icon } 
              : require('../assets/menu3.png')
          }
        />
      </View>
      <View>
        <Text style={styles.Text1}>{category}</Text>
        <Text style={styles.Text2}>{tasks.length} Tasks</Text>
      </View>

      <View style={styles.boxes}>
        <ScrollView>
          {tasks.map((task, index) => (
            <View key={index} style={styles.taskContainer}>
              <View style={styles.taskContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.titeltekst}>{task.text}</Text>
                  <TouchableOpacity style={styles.trashButton} onPress={() => deleteTask(index)}>
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
        onPress={() => navigation.navigate('MakeTask', { category })}
      >
        <Image style={styles.footerplus} source={require('../assets/plus.png')} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CategoryScreen;
