import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import createStyles from './styles/makeTaskStyles';
import API_BASE_URL from '../config/api';
import { LanguageContext } from '../context/LanguageContext';

const MakeTask = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || '');
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  
  const isLandscape = dimensions.width > dimensions.height;
  const styles = createStyles(isLandscape);
  const { translate } = useContext(LanguageContext);

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
          const storedUserId = await AsyncStorage.getItem('user_id');
          if (!storedUserId) {
            Alert.alert('Error', 'User not logged in');
            return;
          }
          setUserId(storedUserId);

          const response = await fetch(`${API_BASE_URL}?action=getCategories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: storedUserId
            }),
          });

          const data = await response.json();
          if (data.status === 'success') {
            const formattedCategories = data.categories.map(cat => ({
              label: cat.name,
              value: cat.name
            }));
            setCategories(formattedCategories);
          } else {
            Alert.alert('Error', data.message || 'Failed to load categories');
          }
        } catch (error) {
          console.error('Error loading categories:', error);
          Alert.alert('Error', 'Failed to load categories');
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
      const response = await fetch(`${API_BASE_URL}?action=addTask`, {
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
            <Text style={styles.TaskText}>{translate('new_task')}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.navigate('HomeScreen')}
            >
              <Image style={styles.terug} source={require('../assets/kruis.png')} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.planText}>{translate('planning')}</Text>
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
                placeholder={translate('add_description')}
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
          <Text style={styles.saveButtonText}>{translate('create')}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MakeTask;