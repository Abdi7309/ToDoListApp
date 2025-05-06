import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select'; 

const MakeTask = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || '');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const response = await fetch('http://10.3.1.31/ToDoListApp/screens/backend/api.php?action=getCategories', {
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
  }, []);

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

      const taskData = {
        action: 'addTask',
        user_id: userId,
        title: text.trim(),
        description: description.trim(),
        category: selectedCategory,
      };

      console.log('Sending task data:', taskData);

      const response = await fetch('http://10.3.1.31/ToDoListApp/screens/backend/api.php?action=addTask', {
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
      <View>
        <Text style={styles.TaskText}>New Task</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Image style={styles.terug} source={require('../assets/kruis.png')} />
        </TouchableOpacity>
        <Text style={styles.planText}>What are You planning?</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Task Title"
        />
        <TextInput
          style={styles.input2}
          placeholder="Add Description"
          placeholderTextColor={styles.input2Placeholder.color}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View style={styles.pickerSelectContainer}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedCategory(value)}
            items={categories}
            value={selectedCategory}
            style={{
              inputIOS: styles.pickerSelectIOS,
              inputAndroid: styles.pickerSelectAndroid,
              placeholder: styles.pickerSelectPlaceholder,
            }}
            placeholder={{ label: 'Select a category...', value: null }}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveTask}
      >
        <Text style={{ color: 'white', fontSize: 26, fontWeight: '500' }}>Create</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    flex: 1,
  },
  terug: {
    width: 25,
    height: 25,
    left: 350,
    top: 20,
  },
  TaskText: {
    color: 'black',
    top: 50,
    left: 150,
    fontSize: 25,
    fontWeight: '600',
  },
  planText: {
    color: 'rgba(169, 169, 169, 1)',
    top: 95,
    left: 30,
    fontSize: 13,
  },
  input: {
    height: 90,
    borderWidth: 0,
    top: 95,
    fontSize: 40,
    borderColor: 'gray',
    margin: 10,
    padding: 8,
    borderBottomWidth: 1,  
  },
  input2: {
    height: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    top: 120,
    marginHorizontal: 20,
    padding: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  input2Placeholder: {
    color: 'black',
  },
  saveButton: {
    position: 'absolute',
    bottom: 0,
    left: 0, 
    right: 0,
    height: 65,
    backgroundColor: 'rgba(49, 74, 164, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSelectContainer: {
    marginTop: 140,
    marginHorizontal: 20,
  },
  pickerSelectAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  pickerSelectIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  pickerSelectPlaceholder: {
    color: 'black',
    fontSize: 16,
  },
});

export default MakeTask;
