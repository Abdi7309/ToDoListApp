import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Pagina4 extends React.Component {
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

      // Filter tasks specific to Pagina4
      const pagina4Tasks = tasks.filter(task => task.page === 'Pagina4');
      this.setState({ tasks: pagina4Tasks });
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
    const { tasks } = this.state;
    tasks.splice(index, 1);

    // Save updated tasks to AsyncStorage
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      this.setState({ tasks });
    } catch (error) {
      console.error('Error saving data:', error);
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
          <Text style={styles.Text1}>Travel</Text>
          <Text style={styles.Text2}>... Tasks</Text>
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
          <TouchableOpacity 
            style={styles.footer}
            onPress={() => this.handleBoxPress('Make4')}
          >  
            <Image style={styles.footerplus} source={require('../assets/plus.png')} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(49, 74, 164, 1)',
    flex: 1,
  },

  boxes: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    width: '100%',
    top: '1%',
    height: '61%',
    paddingBottom: 10,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  titeltekst: {
    top: 45,
    marginLeft: 30,
    fontSize: 24,
    color: 'black',
    fontWeight: '600', 
    
  },
  descriptiontekst: {
    color: 'rgba(169, 169, 169, 1)',
    marginLeft: 32,
    top: 45,
    fontSize: 20,
    marginBottom: 5,
  },
  terug: {
    width: 20,
    height: 20,
    marginLeft: 30,
    marginTop: 50,
  },
  deleteButton: {
    color: 'red',
    marginLeft: 30,
    marginBottom: 10,
  },
  foto: {
    top: "160%",
    marginLeft: 40,
    borderRadius: 1000,
    height: 60, 
    width: 60,
  },
  Text1: {
    marginTop: 115,
    color: 'white',
    fontSize: 32,
    left:50,
    
  },
  Text2: {
    color: 'white',
    marginBottom: 20,
    fontSize: 12,
    left:50,
  },
  trash: {
  height:40,
  width:40,
  left:'80%',
  top: -15,
  },
  footer: {
    height: 70,
    width: 70,
    borderRadius: 50,
    left: 300,
    marginBottom: -80,
    bottom: 105,
    backgroundColor: 'rgba(49, 74, 164, 1)',
  },
  footerplus:{
    height: 25,
    width: 25,
    left: 22,
    top: 21,
  }
});

export default Pagina4;
