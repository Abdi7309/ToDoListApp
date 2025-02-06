import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './uiterlijk';

class Hobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    };
  }

  async loadData() {
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const tasks = JSON.parse(tasksString) || [];

      // Filter tasks specific to Hobby
      const hobbyTasks = tasks.filter(task => task.page === 'Hobby');
      this.setState({ tasks: hobbyTasks });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async componentDidMount() {
    this.loadData();

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.loadData();
    });
  }

  async deleteTask(index) {
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      let tasks = JSON.parse(tasksString) || [];
      const taskToDelete = this.state.tasks[index];
      
      tasks = tasks.filter(task => 
        !(task.text === taskToDelete.text && 
          task.description === taskToDelete.description)
      );

      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      const hobbyTasks = tasks.filter(task => task.page === 'Hobby');
      this.setState({ tasks: hobbyTasks });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  handleBoxPress = (screenName) => {
    const { navigation } = this.props;
    navigation.navigate(screenName);
  };

  render() {
    const { navigation } = this.props;
    const { tasks } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image style={styles.terug} source={require('../assets/pijl2.png')} />
        </TouchableOpacity>
        <View>
          <Image style={styles.foto} source={require('../assets/all3.png')} />
        </View>
        <View>
          <Text style={styles.Text1}>Hobby</Text>
          <Text style={styles.Text2}>{tasks.length} Tasks</Text>
        </View>

        <View style={styles.boxes}>
          <ScrollView>
            <Text style={styles.tijdtekst}></Text>

            {tasks.map((task, index) => (
              <View key={index}>
                <Text style={styles.titeltekst}>{task.text}</Text>
                <Text style={styles.descriptiontekst}>{task.description}</Text>
                <TouchableOpacity onPress={() => this.deleteTask(index)}>
                  <Image style={styles.trash} source={require('../assets/trash.png')} />
                </TouchableOpacity>
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

export default Hobby;