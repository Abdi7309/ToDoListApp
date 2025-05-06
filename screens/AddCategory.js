import React, { useState, useEffect } from 'react';
import { 
  Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, View, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

const AddCategory = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUser();
  }, []);

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });

      setSelectedImage({
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime
      });
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        Alert.alert('Error', 'Failed to pick image');
      }
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
          uri: selectedImage.uri,
          type: selectedImage.mime,
          name: 'image.' + selectedImage.mime.split('/')[1]
        });
      }

      const response = await fetch('http://10.3.1.31/ToDoListApp/screens/backend/api.php?action=addCustomCategory', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.status === "success") {
        // Get existing custom categories
        const existingCategoriesString = await AsyncStorage.getItem('customCategories');
        const existingCategories = existingCategoriesString ? JSON.parse(existingCategoriesString) : [];
        
        // Add new category with all the data from the API response
        const newCategory = {
          id: data.category.id,
          name: data.category.name,
          color: data.category.color,
          user_id: data.category.user_id,
          icon: data.category.icon || 'menu.png' // Use uploaded icon or default icon
        };
        
        // Update AsyncStorage
        await AsyncStorage.setItem('customCategories', JSON.stringify([...existingCategories, newCategory]));
        
        Alert.alert('Success', 'Category created successfully');
        navigation.goBack();
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
      <View>
        <Text style={styles.TaskText}>New Category</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.terug} source={require('../assets/kruis.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
          ) : (
            <Text>Select Category Icon</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.planText}>Enter Category Name</Text>
        <TextInput
          style={styles.input}
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder="Category name"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveCategory}>
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
    left: 120,
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
    borderColor: 'grey',
    margin: 10,
    padding: 8,
    borderBottomWidth: 1,  
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
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default AddCategory;
