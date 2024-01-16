import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Pagina7 extends React.Component {
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
          <TextInput
            style={styles.input}
            placeholder="Enter text"
            value={text}
            onChangeText={(text) => this.setState({ text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={(description) => this.setState({ description })}
          />
          <Button title="Save" onPress={() => this.saveTask()} />
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
  TaskText: {
    color: 'black',
    top: 60,
    left: 150,
    fontSize: 25,
    fontWeight: '600',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 8,
  },
});

export default Pagina7;
