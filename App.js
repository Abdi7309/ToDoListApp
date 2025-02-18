import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alles from './screens/alles';
import Werk from './screens/work';
import Music from './screens/music';
import Travel from './screens/Travel';
import Study from './screens/Study';
import Home from './screens/home';
import Hobby from './screens/hobby';
import MakeTask from './screens/MakeTask';
import AddCategory from './screens/AddCategory';
import CategoryScreen from './screens/CategoryScreen';
import EditCategoryScreen from './screens/EditCategoryScreen';  

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Alles" component={Alles} />
        <Stack.Screen name="Work" component={Werk} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Music" component={Music} />
        <Stack.Screen name="Travel" component={Travel} />
        <Stack.Screen name="Study" component={Study} />
        <Stack.Screen name="Hobby" component={Hobby} />
        <Stack.Screen name="MakeTask" component={MakeTask} />
        <Stack.Screen name="AddCategory" component={AddCategory} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [taskCounts, setTaskCounts] = useState({});
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tasksString = await AsyncStorage.getItem('tasks');
        const tasks = JSON.parse(tasksString) || [];
        
        // Changed 'Home' to 'home' to match the route name
        const predefinedCategories = ['Alles', 'Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby'];
        const counts = {};
        predefinedCategories.forEach(category => {
          counts[category] = tasks.filter(task => task.page === category).length;
        });
        setTaskCounts(counts);

        const customCategoriesString = await AsyncStorage.getItem('customCategories');
        const loadedCustomCategories = JSON.parse(customCategoriesString) || [];
        setCustomCategories(loadedCustomCategories.map(category => ({
          ...category,
          tasks: tasks.filter(task => task.page === category.name).length,
        })));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    const focusListener = navigation.addListener('focus', loadData);
    return () => {
      navigation.removeListener('focus', focusListener);
    };
  }, [navigation]);

  const handleBoxPress = (screenName) => {
    console.log('Navigating to:', screenName); // Debug line added
    // Updated predefinedScreens to match route names
    const predefinedScreens = ['Alles', 'Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby', 'MakeTask', 'AddCategory'];
    if (predefinedScreens.includes(screenName)) {
      navigation.navigate(screenName);
    } else {
      navigation.navigate('CategoryScreen', { category: screenName });
    }
  };

  const handleLongPress = (category) => {
    navigation.navigate('EditCategory', {
      categoryName: category.name,
      categoryId: category.id,
      categoryIcon: category.icon,
    });
  };

  const images = {
    alles: require('./assets/all.png'),
    work: require('./assets/work.png'),
    music: require('./assets/music.png'),
    travel: require('./assets/travel.png'),
    study: require('./assets/study.png'),
    home: require('./assets/home.png'),
    hobby: require('./assets/Hobby.png'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <ScrollView>
        <Image style={styles.menu} source={require('./assets/menu.png')} />
        <Text style={styles.listsText}>Lists</Text>
        <View style={styles.boxesContainer}>
          {Object.keys(taskCounts).map(category => (
            <TouchableOpacity
              key={category}
              style={styles.boxes}
              onPress={() => handleBoxPress(category)}
            >
              <Image style={styles.icoontje} source={images[category.toLowerCase()] || require('./assets/menu.png')} />
              <Text style={styles.textboxex}>{category}</Text>
              <Text style={styles.Tasksboxex}>{taskCounts[category]} Tasks</Text>
            </TouchableOpacity>
          ))}
          {customCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.boxes}
              onPress={() => handleBoxPress(category.name)}
              onLongPress={() => handleLongPress(category)}
            >
              <Image style={styles.icoontje}
                source={category.icon === 'menu.png' ? require('./assets/menu2.png') : { uri: category.icon }} />
              <Text style={styles.textboxex}>{category.name}</Text>
              <Text style={styles.Tasksboxex}>{category.tasks} Tasks</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.footer} onPress={() => handleBoxPress('AddCategory')}>
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
  footerplus: {
    height: 25,
    width: 25,
    left: 22,
    top: 21,
  },
});

export default App;