import React, { useState } from 'react';
import { 
  Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, View, PermissionsAndroid, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

function AddCategory({ navigation }) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let granted;
        if (Platform.Version >= 33) {
          console.log("Requesting READ_MEDIA_IMAGES permission...");
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Gallery Permission',
              message: 'App needs access to your gallery',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
        } else {
          console.log("Requesting READ_EXTERNAL_STORAGE permission...");
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your gallery to select an image',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
        }

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Permission granted!");
          return true;
        } else {
          console.log("Permission denied.");
          return false;
        }
      } catch (err) {
        console.warn("Permission request error:", err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    console.log("Checking for permission...");
    const hasPermission = await requestPermission();
    
    if (!hasPermission) {
      alert('Permission denied. ');
      return;
    }

    console.log("Opening image picker...");
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Image picker error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        console.log('Image selected:', response.assets[0].uri);
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  const saveCategory = async () => {
    if (categoryName.trim().length === 0) {
      alert('Please enter a category name');
      return;
    }

    try {
      const categoriesString = await AsyncStorage.getItem('categories');
      let categories = JSON.parse(categoriesString) || [];
      
      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        icon: selectedImage || 'menu.png'
      };
      
      categories.push(newCategory);
      await AsyncStorage.setItem('categories', JSON.stringify(categories));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.TaskText}>New Category</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image style={styles.terug} source={require('../assets/kruis.png')} />
        </TouchableOpacity>
        <Text style={styles.planText}>Enter Category Name</Text>
        <TextInput
          style={styles.input}
          value={categoryName}
          onChangeText={setCategoryName}
        />
        {!selectedImage && <Image style={styles.icon1} source={require('../assets/menu.png')} />}
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Select Image</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image 
            source={{ uri: selectedImage }} 
            style={[styles.icon1, { marginTop: 10 }]} 
          />
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
    top: 164, 
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
