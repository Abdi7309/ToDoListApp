import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
- src
  - components
    - App.js
    - App2.js


function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar/>
      <ScrollView>
        <Image style={styles.menu} source={require('./assets/menu.png')}/>
        <Text style={styles.listsText}>Lists</Text>
        <View style={styles.boxesContainer}>
          <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>All</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
          <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>Work</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
        </View>
        <View style={styles.boxesContainer}>
        <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>Music</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
        <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>Travel</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
        </View>
        <View style={styles.boxesContainer}>
        <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>Study</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
        <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>Home</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
        </View>
        <View style={styles.boxesContainer}>
        <View style={styles.boxes}><Image style={styles.icoontje} source={require('./assets/icoontje.png')}/><Text style={styles.textboxex}>???</Text><Text style={styles.Tasksboxex}>... Tasks</Text></View>
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
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 35,
  },
  boxes: {
    backgroundColor: 'white',
    width: 150,
    height: 150,
    borderRadius: 15,
    marginRight: 40,
  },
  icoontje: {
    width: 50,
    height: 50,
    top: 15,
    marginLeft: 15,
    marginBottom: -55,
  },
  textboxex:{
    color:'black',
    top: 89,
    left: 15,
    fontWeight: '500',
    fontSize:24,
  },
  Tasksboxex:{
    color:'#A9A9A9',
    top: 89,
    left: 15,
    fontWeight: '500',
    fontSize:14,
  }

});

export default App;
