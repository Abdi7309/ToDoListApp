import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Pagina1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
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

  render() {
    const { navigation } = this.props;
    const { tasks } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image style={styles.terug} source={require('../assets/pijl2.png')} />
        </TouchableOpacity>

        <View style={styles.boxes}>
          <ScrollView>
            <Text style={styles.tijdtekst}></Text>

            {tasks.map((task, index) => (
              <View key={index}>
                <Text style={styles.titeltekst}>{task.text}</Text>
                <Text style={styles.descriptiontekst}>{task.description}</Text>
                <TouchableOpacity onPress={() => this.deleteTask(index)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
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
  top: '30%',
  height: '61%',
  paddingBottom: 10,
  borderTopLeftRadius: 35,
  borderTopRightRadius: 35,
},
titeltekst:{
  top: 45,
  marginLeft: 30,
  fontSize: 24,
  color: 'black',
},
descriptiontekst:{
  color:'rgba(169, 169, 169, 1)' ,
  marginLeft: 32,
  top: 45,
  fontSize: 18,
  marginBottom: 38,
},
terug: {
  width: 25,
  height: 25,
  marginLeft: 30,
  marginTop: 50,
},
deleteButton: {
  color: 'red',
  marginLeft: 30,
  marginBottom: 10,
},

});

export default Pagina1;
