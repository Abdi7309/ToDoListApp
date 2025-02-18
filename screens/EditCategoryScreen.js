import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

function EditCategoryScreen({ route, navigation }) {
  const { categoryId } = route.params;  // Get categoryId passed through params
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        const categoriesString = await AsyncStorage.getItem('customCategories');
        const categories = JSON.parse(categoriesString) || [];
        const category = categories.find(cat => cat.id === categoryId);  // Find the category by id
        
        if (category) {
          setCategoryName(category.name);
          setSelectedImage(category.icon);
        }
      } catch (error) {
        console.error('Error loading category data:', error);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 2000,
        height: 2000,
        cropping: true,
        compressImageQuality: 0.8,
      });
      setSelectedImage(image.path);
    } catch (error) {
      console.error('Image Picker Error:', error);
    }
  };

  const saveCategory = async () => {
    if (categoryName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const categoriesString = await AsyncStorage.getItem('customCategories');
      let categories = JSON.parse(categoriesString) || [];

      // Check if the new category name already exists (excluding the category being edited)
      const categoryExists = categories.some(
        (category) => category.name.toLowerCase() === categoryName.trim().toLowerCase() && category.id !== categoryId
      );

      if (categoryExists) {
        Alert.alert('Error', 'A category with this name already exists.');
        return;
      }

      const updatedCategories = categories.map(category =>
        category.id === categoryId
          ? { ...category, name: categoryName.trim(), icon: selectedImage || 'menu.png' }
          : category
      );

      await AsyncStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      navigation.goBack();  // Navigate back after saving
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const deleteCategory = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const categoriesString = await AsyncStorage.getItem('customCategories');
              let categories = JSON.parse(categoriesString) || [];
              const updatedCategories = categories.filter(category => category.id !== categoryId);

              await AsyncStorage.setItem('customCategories', JSON.stringify(updatedCategories));
              navigation.goBack();  // Navigate back after deletion
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.TaskText}>Edit</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.terug} source={require('../assets/kruis.png')} />
        </TouchableOpacity>
        <Text style={styles.planText}>Enter Category Name</Text>
        <TextInput
          style={styles.input}
          value={categoryName}
          onChangeText={setCategoryName}
        />
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Select Image</Text>
        </TouchableOpacity>
        {selectedImage && selectedImage.startsWith('file') ? (
          <Image source={{ uri: selectedImage }} style={styles.icon1} />
        ) : (
          <Image style={styles.icon1} source={require('../assets/menu.png')} />
        )}

      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveCategory}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={deleteCategory}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    left: 180,
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
  icon1: {
    top: 104,
    marginLeft: 50,
    height: 30,
    width: 30,
  },
  imagePickerButton: {
    height: 40,
    borderWidth: 0,
    top: 118,
    marginLeft: 20,
    marginRight: 100,
    margin: 10,
    padding: 8,
    fontSize: 16,
    borderColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: 'black',
    fontSize: 16,
    top: 30,
  },
  saveButton: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'rgba(49, 74, 164, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'rgba(220, 53, 69, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '500',
  },
});

export default EditCategoryScreen;
