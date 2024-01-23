import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,Image, SafeAreaView, TextInput, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Make extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      description: '',
    };
  }

  async componentDidMount() {
    // Load saved data from AsyncStorage when component mounts
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
    const { text, description } = this.state;
    const task = { text, description };

    // Save task to AsyncStorage
    try {
      let tasks = this.state.tasks || [];
      tasks.push(task);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      this.setState({ tasks });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  render() {
    const { navigation } = this.props;
    const { text, description, tasks } = this.state;

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
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                this.saveTask();
                navigation.navigate('Pagina1', { text, description });
              }}
            >
              <Text style={{ color: 'white', fontSize: 26,    fontWeight: '500',}}>Create</Text>
            </TouchableOpacity>

        </View>
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
  planText:{
    color: 'black',
    color:'rgba(169, 169, 169, 1)',
    top: 95,
    left: 30,
    fontSize: 13,
  },
  input: {
    height: 90,
    borderWidth: 0,
    top: 95,
    fontSize:40,
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
    top: 485,
    height: 65,
    marginTop: 20,
    backgroundColor: 'rgba(49, 74, 164, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});

export default Make;
