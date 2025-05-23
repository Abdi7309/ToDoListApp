import React, { useState, useEffect } from 'react';
import { 
  Text, TextInput, TouchableOpacity, SafeAreaView, Image, View, Alert, Dimensions,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import createStyles from './styles/addCategoryStyles';

const AddCategory = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUser();
  }, []);

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

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 2000,
        height: 2000,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setSelectedImage(image);
    } catch (error) {
      console.error('Image Picker Error:', error);
    }
  };

  const saveCategory = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (categoryName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('name', categoryName.trim());
      
      if (selectedImage) {
        formData.append('icon', {
          uri: selectedImage.path,
          type: selectedImage.mime,
          name: 'icon.' + selectedImage.path.split('.').pop()
        });
      }

      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=addCustomCategory', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.status === "success") {
        Alert.alert('Success', 'Category created successfully', [
          { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
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
            <Text style={styles.TaskText}>New Category</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.goBack()}
            >
              <Image style={styles.terug} source={require('../assets/kruis.png')} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.planText}>Enter Category Name</Text>
            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder=" "
            />
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerButtonText}>Select Image</Text>
            </TouchableOpacity>
            {selectedImage && selectedImage.path ? (
              <Image source={{ uri: selectedImage.path }} style={styles.icon1} />
            ) : (
              <Image style={styles.icon1} source={require('../assets/menu.png')} />
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={saveCategory}>
          <Text style={styles.saveButtonText}>Create</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddCategory;
