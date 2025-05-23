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
          const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=getCategories', {
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

  const handleSubmit = async () => {
    if (!text.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');
      
      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title: text,
          description: description,
          category: route.params.category,
          isCustom: route.params.isCustom || false,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Task added successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
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
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>Create</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MakeTask;