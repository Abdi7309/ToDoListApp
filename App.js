import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Pagina1 from './screens/pagina1';
import Pagina2 from './screens/pagina2';
import Pagina3 from './screens/pagina3';
import Pagina4 from './screens/pagina4';
import Pagina5 from './screens/pagina5';
import Pagina6 from './screens/pagina6';
import Pagina7 from './screens/pagina7';
import Make3 from './screens/Make3';
import Make2 from './screens/Make2';
import Make4 from './screens/Make4';
import Make5 from './screens/Make5';
import Make6 from './screens/Make6';
import Make7 from './screens/Make7';


const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}  // Hide the header for all screens
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Pagina1" component={Pagina1} />
        <Stack.Screen name="Pagina2" component={Pagina2} />
        <Stack.Screen name="Pagina3" component={Pagina3} />
        <Stack.Screen name="Pagina4" component={Pagina4} />
        <Stack.Screen name="Pagina5" component={Pagina5} />
        <Stack.Screen name="Pagina6" component={Pagina6} />
        <Stack.Screen name="Pagina7" component={Pagina7} />
        <Stack.Screen name="Make2" component={Make2} />
        <Stack.Screen name="Make3" component={Make3} />
        <Stack.Screen name="Make4" component={Make4} />
        <Stack.Screen name="Make5" component={Make5} />
        <Stack.Screen name="Make6" component={Make6} />
        <Stack.Screen name="Make7" component={Make7} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
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
            onPress={() => handleBoxPress('Pagina1')}
          >
            <Image style={styles.icoonall} source={require('./assets/all.png')} />
            <Text style={styles.textboxex}>All</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina2')}
          >
            <Image style={styles.icoontje} source={require('./assets/work.png')} />
            <Text style={styles.textboxex}>Work</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina3')}
          >
            <Image style={styles.icoontje} source={require('./assets/muisc.png')} />
            <Text style={styles.textboxex}>Music</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina4')}
          >
            <Image style={styles.icoontje} source={require('./assets/travel.png')} />
            <Text style={styles.textboxex}>Travel</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina5')}
          >
            <Image style={styles.icoontje} source={require('./assets/study.png')} />
            <Text style={styles.textboxex}>Study</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina6')}
          >
            <Image style={styles.icoontje} source={require('./assets/home.png')} />
            <Text style={styles.textboxex}>Home</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxes}
            onPress={() => handleBoxPress('Pagina7')}
          >
            <Image style={styles.icoontje} source={require('./assets/icoontje.png')} />
            <Text style={styles.textboxex}>???</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>
          </View>
          </ScrollView>

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
