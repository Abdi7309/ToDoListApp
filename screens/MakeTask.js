import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select'; 

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
    const { route } = this.props;
    const category = route.params?.category || '';
    this.setState({ selectedPage: category });

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

    if (text.length === 0) {
      alert('Please give it a title');
      return;
    }
    if (description.length === 0) {
      alert('Please Add a Description');
      return;
    }

    if (text.length > 18) {
      alert('Title cannot be longer than 15 characters');
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
      this.props.navigation.goBack(); // Navigate back only if the task is successfully saved
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
            placeholder="Add Description"
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
              label: 'Add Category',
              value: null,
            }}
            value={selectedPage} 
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
          onPress={() => this.saveTask()}
        >
          <Text style={{ color: 'white', fontSize: 26, fontWeight: '500' }}>Create</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
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
