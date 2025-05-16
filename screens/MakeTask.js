import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { useFocusEffect } from '@react-navigation/native';
import createStyles from './makeTaskStyles';

const MakeTask = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || '');
  const [categories, setCategories] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  
  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);

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

  useFocusEffect(
    useCallback(() => {
      const loadCategories = async () => {
        try {
          const userId = await AsyncStorage.getItem('user_id');
          const response = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=getCategories', {
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
            const formattedCategories = data.categories.map(cat => ({
              label: cat.name,
              value: cat.name
            }));
            setCategories(formattedCategories);
          }
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      };

      loadCategories();
    }, [])
  );

  const saveTask = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // First check for deleted tasks with same title and description
      const checkResponse = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=checkDeletedTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title: text.trim(),
          description: description.trim(),
          new_category: selectedCategory // Add new category info
        }),
      });

      const checkData = await checkResponse.json();
      
      if (checkData.status === 'found') {
        // If found, restore the deleted task
        const restoreResponse = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=restoreTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: checkData.task_id,
            user_id: userId,
          }),
        });

        const restoreData = await restoreResponse.json();
        if (restoreData.status === 'success') {
          Alert.alert(
            'Task Restored',
            'A previously deleted task was restored',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }
      }

      // If no deleted task found, proceed with creating new task
      const taskData = {
        action: 'addTask',
        user_id: userId,
        title: text.trim(),
        description: description.trim(),
        category: selectedCategory,
      };

      console.log('Sending task data:', taskData);

      const response = await fetch('http://10.3.1.86/ToDoListApp/screens/backend/api.php?action=addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Parse error:', e);
        console.error('Response text:', responseText);
        Alert.alert('Error', 'Invalid server response');
        return;
      }

      if (data.status === 'success') {
        Alert.alert(
          'Success',
          'Task added successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save task. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.TaskText}>New Task</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.navigate('HomeScreen')}
            >
              <Image style={styles.terug} source={require('../assets/kruis.png')} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.planText}>What are You planning?</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder=""
              placeholderTextColor="#AAA"
            />
            
            <View style={styles.descriptionContainer}>
              <Image style={styles.icon1} source={require('../assets/menu.png')} />
              <TextInput
                style={styles.input2}
                placeholder="Add description"
                placeholderTextColor="#AAA"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            
            {categories.length > 0 && selectedCategory === '' && (
              <View style={styles.pickerSelectContainer}>
                <RNPickerSelect
                  placeholder={{ label: 'Select a category', value: '' }}
                  items={categories}
                  onValueChange={(value) => setSelectedCategory(value)}
                  style={{
                    inputIOS: styles.pickerSelectIOS,
                    inputAndroid: styles.pickerSelectAndroid,
                    placeholder: styles.pickerSelectPlaceholder,
                  }}
                  value={selectedCategory}
                />
              </View>
            )}
          </View>
        </ScrollView>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTask}
        >
          <Text style={styles.saveButtonText}>Create</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MakeTask;