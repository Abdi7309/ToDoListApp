import React, { useState } from 'react';
import { 
  Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, View, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

function AddCategory({ navigation }) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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
      
      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        icon: selectedImage || 'menu.png'
      };
      
      categories.push(newCategory);
      await AsyncStorage.setItem('customCategories', JSON.stringify(categories));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.TaskText}>New Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
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
        <Text style={{ color: 'white', fontSize: 26, fontWeight: '500' }}>Create</Text>
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
    bottom: 0,
    left: 0, 
    right: 0,
    height: 65,
    backgroundColor: 'rgba(49, 74, 164, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddCategory;
