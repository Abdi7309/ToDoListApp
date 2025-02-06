import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alles from './screens/alles';
import Werk from './screens/work';
import Muziek from './screens/music';
import Reizen from './screens/Travel';
import Study from './screens/Study';  
import Home from './screens/home';
import Hobby from './screens/hobby';
import MakeTask from './screens/MakeTask';

const Stack = createNativeStackNavigator();

function App() {
  console.log(" test");

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}  // Hide the header for all screens
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Alles" component={Alles} />
        <Stack.Screen name="Work" component={Werk} />
        <Stack.Screen name="Muziek" component={Muziek} />
        <Stack.Screen name="Reizen" component={Reizen} />
        <Stack.Screen name="Study" component={Study} />
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="Hobby" component={Hobby} />
        <Stack.Screen name="MakeTask" component={MakeTask} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [taskCounts, setTaskCounts] = useState({
    Alles: 0,
    Work: 0,
    Music: 0,
    Travel: 0,
    Study: 0,
    Home: 0,
    Hobby: 0,
  });

  useEffect(() => {
    const loadTaskCounts = async () => {
      try {
        const tasksString = await AsyncStorage.getItem('tasks');
        const tasks = JSON.parse(tasksString) || [];

        const counts = {
          Alles: tasks.filter(task => task.page === 'Alles').length,
          Work: tasks.filter(task => task.page === 'Work').length,
          Music: tasks.filter(task => task.page === 'Music').length,
          Travel: tasks.filter(task => task.page === 'Travel').length,
          Study: tasks.filter(task => task.page === 'Study').length,
          Home: tasks.filter(task => task.page === 'Home').length,
          Hobby: tasks.filter(task => task.page === 'Hobby').length,
        };

        setTaskCounts(counts);
      } catch (error) {
        console.error('Error loading task counts:', error);
      }
    };

    loadTaskCounts();

    const focusListener = navigation.addListener('focus', loadTaskCounts);
    return () => {
      navigation.removeListener('focus', loadTaskCounts);
    };
  }, [navigation]);

  const handleBoxPress = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <ScrollView>
        <Image style={styles.menu} source={require('./assets/menu.png')} />
        <Text style={styles.listsText}>Lists</Text>
        <View style={styles.boxesContainer}>
          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Alles')}
          >
            <Image style={styles.icoonall} source={require('./assets/all.png')} />
            <Text style={styles.textboxex}>All</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Alles} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Work')}
          >
            <Image style={styles.icoontje} source={require('./assets/work.png')} />
            <Text style={styles.textboxex}>Work</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Work} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Muziek')}
          >
            <Image style={styles.icoontje} source={require('./assets/muisc.png')} />
            <Text style={styles.textboxex}>Music</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Music} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Reizen')}
          >
            <Image style={styles.icoontje} source={require('./assets/travel.png')} />
            <Text style={styles.textboxex}>Travel</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Travel} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Study')}
          >
            <Image style={styles.icoontje} source={require('./assets/study.png')} />
            <Text style={styles.textboxex}>Study</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Study} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('home')}
          >
            <Image style={styles.icoontje} source={require('./assets/home.png')} />
            <Text style={styles.textboxex}>Home</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Home} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Hobby')}
          >
            <Image style={styles.icoontje} source={require('./assets/Hobby3.png')} />
            <Text style={styles.textboxex}>Hobby</Text>
            <Text style={styles.Tasksboxex}>{taskCounts.Hobby} Tasks</Text>
          </TouchableOpacity>
          </View>
          </ScrollView>
          <TouchableOpacity 
            style={styles.footer}
            onPress={() => handleBoxPress('MakeTask')}
          >  
            <Image style={styles.footerplus} source={require('./assets/plus.png')} />
          </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    flex: 1,
  },
  menu: {
    width: 40,
    height: 30,
    marginLeft: 30,
    marginTop: 50,
  },
  listsText: {
    color: 'black',
    top: 15,
    left: 30,
    fontSize: 40,
    fontWeight: '800',
  },
  boxesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',  
    justifyContent: 'space-between',  
    marginLeft: 30,
    marginRight: 40,
    marginBottom: 10,
    marginTop: 35,
  },
  boxes: {
    backgroundColor: 'white',
    width: 150,
    height: 150,
    borderRadius: 15,
    marginBottom: 45,  
  },
  icoontje: {
    width: 50,
    height: 50,
    top: 15,
    marginLeft: 15,
    marginBottom: -55,
  },
  icoonall:{
    width: 45,
    height: 55,
    top: 15,
    marginLeft: 15,
    marginBottom: -55,

  },
  textboxex: {
    color: 'black',
    top: 89,
    left: 15,
    fontWeight: '500',
    fontSize: 24,
  },
  Tasksboxex: {
    color: '#A9A9A9',
    top: 89,
    left: 15,
    fontWeight: '500',
    fontSize: 14,
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

export default App;
