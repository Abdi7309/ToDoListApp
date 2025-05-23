import React, { useState, useEffect } from 'react';
import {
  Text, TextInput, TouchableOpacity, SafeAreaView, Image, View, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import createStyles from './styles/editCategoryStyles';

function EditCategoryScreen({ route, navigation }) {
  const { categoryId, categoryName: initialName, iconUrl: initialIcon } = route.params;
  const [name, setName] = useState(initialName || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);

  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  
  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);

  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUserId();
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
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('category_id', categoryId);
      formData.append('name', name.trim());

      if (selectedImage) {
        const imageFile = {
          uri: selectedImage.path,
          type: selectedImage.mime,
          name: 'icon.' + selectedImage.path.split('.').pop()
        };
        formData.append('icon', imageFile);
      }

      const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=updateCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Category updated successfully', [
          { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const deleteCategory = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this category? All tasks in this category will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch('http://10.3.1.75/ToDoListApp/screens/backend/api.php?action=deleteCategory', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: userId,
                  category_id: categoryId
                }),
              });

              const data = await response.json();
              if (data.status === 'success') {
                navigation.navigate('HomeScreen');
              } else {
                Alert.alert('Error', data.message || 'Failed to delete category');
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Failed to connect to server');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.TaskText}>Edit</Text>
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
              value={name}
              onChangeText={setName}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveCategory}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteCategory}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default EditCategoryScreen;
