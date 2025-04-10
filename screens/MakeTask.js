import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select'; 

const MakeTask = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [pages, setPages] = useState(['Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby']);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    loadUser();
  }, []);

  const saveTask = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      const response = await fetch('http://your-server-address/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveTask',
          user_id: user.id,
          title: text.trim(),
          description: description.trim(),
          category: selectedPage,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
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
        />
        <Image style={styles.icon1} source={require('../assets/menu.png')} />
        <TextInput
          style={styles.input2}
          placeholder="Add Description"
          placeholderTextColor={styles.input2Placeholder.color}
          value={description}
          onChangeText={setDescription}
        />
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
    height: 40,
    borderWidth: 0,
    top: 120,
    marginLeft: 100,
    marginRight: 100,
    margin: 10,
    padding: 8,
    fontSize: 16,
  },
  input2Placeholder: {
    color: 'black',
  },
  icon1: {
    top: 164, 
    marginLeft: 50,
    height: 30,
    width: 30,
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
    height: 40,
    width: 215,
    top: 120,
    left: 91,
  },
  pickerSelectText: {
    fontSize: 14,
  },
  pickerSelectAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
  },
  pickerSelectIOS: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, 
  },
  pickerSelectPlaceholder: {
    fontSize: 14,
    color: 'black',
  },
});

export default MakeTask;
