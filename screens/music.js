import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './uiterlijk';

class Music extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      expandedDescriptions: {},
    };
  }

  async loadData() {
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const tasks = JSON.parse(tasksString) || [];

      // Filter tasks specific to Music
      const musicTasks = tasks.filter(task => task.page === 'Music');
      this.setState({ tasks: musicTasks });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async componentDidMount() {
    this.loadData();

    // Add a listener to reload data when the screen is focused
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.loadData();
    });
  }

  async deleteTask(index) {
    try {
      // Get current tasks list
      const tasksString = await AsyncStorage.getItem('tasks');
      let tasks = JSON.parse(tasksString) || [];

      // Get the task we want to delete
      const taskToDelete = this.state.tasks[index];

      // Remove all instances of this task
      tasks = tasks.filter(task => 
        !(task.text === taskToDelete.text && 
          task.description === taskToDelete.description)
      );

      // Save updated tasks
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

      // Update state with filtered tasks for Music page
      const musicTasks = tasks.filter(task => task.page === 'Music');
      this.setState({ tasks: musicTasks });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  toggleDescription(index) {
    this.setState(prevState => ({
      expandedDescriptions: {
        ...prevState.expandedDescriptions,
        [index]: !prevState.expandedDescriptions[index],
      },
    }));
  }

  handleBoxPress = (screenName) => {
    const { navigation } = this.props;
    navigation.navigate(screenName, { category: 'Music' });
  };


  render() {
    const { navigation } = this.props;
    const { tasks, expandedDescriptions } = this.state;
    
    console.log('Number of tasks in Music:', tasks.length); // Log the task length

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image style={styles.terug} source={require('../assets/pijl.png')} />
        </TouchableOpacity>
        <View>
          <Image style={styles.foto} source={require('../assets/music2.png')} />
        </View>
        <View>
          <Text style={styles.Text1}>Music</Text>
          <Text style={styles.Text2}>{tasks.length} Tasks</Text>
        </View>

        <View style={styles.boxes}>
        <ScrollView>
        <Text style={styles.tijdtekst}></Text>
        {tasks.map((task, index) => (
          <View key={index} style={styles.taskContainer}>
            <View style={styles.taskContent}>
              <View style={styles.titleRow}>
                <Text style={styles.titeltekst}>{task.text}</Text>
                <TouchableOpacity 
                  style={styles.trashButton} 
                  onPress={() => this.deleteTask(index)}
                >
                  <Image style={styles.trash} source={require('../assets/trash.png')} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => this.toggleDescription(index)}>
                <Text style={styles.descriptiontekst}>
                  {expandedDescriptions[index] 
                    ? task.description 
                    : task.description.length > 14 
                      ? task.description.substring(0, 14).trim() + '...'
                      : task.description
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
          <TouchableOpacity 
            style={styles.footer}
            onPress={() => this.handleBoxPress('MakeTask')}
          >  
            <Image style={styles.footerplus} source={require('../assets/plus.png')} />
          </TouchableOpacity>

      </SafeAreaView>
    );
  }
}

export default Music;