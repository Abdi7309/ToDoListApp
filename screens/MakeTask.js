import React from 'react';
import { View, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select'; 
import styles from './uiterlijk2';

class MakeTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      description: '',
      selectedPage: '',
      pages: ['Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby']
    };
  }

  async componentDidMount() {
    try {
      const savedData = await AsyncStorage.getItem('tasks');
      if (savedData) {
        const tasks = JSON.parse(savedData);
        this.setState({ tasks });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async saveTask() {
    const { text, description, selectedPage } = this.state;

    if (!selectedPage) {
      alert('Please select a category');
      return;
    }

    try {
      let tasks = this.state.tasks || [];
      const task = { text, description, page: selectedPage };
      tasks.push(task);

      // Add task to "Alles"
      if (selectedPage !== 'Alles') {
        const taskAlles = { text, description, page: 'Alles' };
        tasks.push(taskAlles);
      }

      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      this.setState({ tasks });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  render() {
    const { navigation } = this.props;
    const { text, description, selectedPage, pages } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.TaskText}>New task</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image style={styles.terug} source={require('../assets/kruis.png')} />
          </TouchableOpacity>
          <Text style={styles.planText}>What are You planning?</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(text) => this.setState({ text })}
          />
          <Image style={styles.icon1} source={require('../assets/menu.png')} />
          <TextInput
            style={styles.input2}
            placeholder="Add description"
            placeholderTextColor={styles.input2Placeholder.color}
            value={description}
            onChangeText={(description) => this.setState({ description })}
          />
          <Image style={styles.icon1} source={require('../assets/menu.png')} />
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(itemValue) => this.setState({ selectedPage: itemValue })}
            items={pages.map((page) => ({ label: page, value: page }))}
            placeholder={{
              label: 'Choose a category',
              value: null,
            }}
            style={{
              viewContainer: styles.pickerSelectContainer,
              inputIOS: styles.pickerSelectIOS,
              inputAndroid: styles.pickerSelectAndroid,
              placeholder: styles.pickerSelectPlaceholder,
            }}
          />
        </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            this.saveTask();
            navigation.goBack();
          }}
        >
          <Text style={{ color: 'white', fontSize: 26, fontWeight: '500' }}>Create</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

export default MakeTask;
