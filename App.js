import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import All from './screens/all';
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
import Login from './screens/login';
import Register from './screens/register';
import DeletedTasks from './screens/DeletedTasks';
import { CustomMenu } from './screens/CustomMenu';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="All" component={All} />
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
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="DeletedTasks" component={DeletedTasks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [taskCounts, setTaskCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('standard'); 
  const [userId, setUserId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Make setSortOrder globally available but in a safer way
    global.setSortOrder = (newValue) => {
      setSortOrder(typeof newValue === 'function' ? newValue(sortOrder) : newValue);
    };
    global.currentSortOrder = sortOrder;

    return () => {
      delete global.setSortOrder;
      delete global.currentSortOrder;
    };
  }, [sortOrder]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (!storedUserId) {
          navigation.navigate('Login');
          return;
        }
        setUserId(storedUserId);

        // Fetch all categories (both predefined and custom)
        const categoriesResponse = await fetch('http://10.3.1.65/ToDoListApp/screens/backend/api.php?action=getCategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getCategories',
            user_id: storedUserId
          }),
        });

        const categoriesData = await categoriesResponse.json();
        if (categoriesData.status === 'success') {
          const categoriesWithTasks = await Promise.all(
            categoriesData.categories.map(async (category) => {
              // Fetch task count for each category
              const response = await fetch('http://10.3.1.65/ToDoListApp/screens/backend/api.php?action=getTasks', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'getTasks',
                  user_id: storedUserId,
                  category: category.name,
                }),
              });

              const data = await response.json();
              return {
                ...category,
                tasks: data.status === 'success' ? data.tasks.length : 0
              };
            })
          );

          setCategories(categoriesWithTasks);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    const focusListener = navigation.addListener('focus', loadData);
    return () => navigation.removeListener('focus', focusListener);
  }, [navigation]);

  const handleBoxPress = (screenName) => {
    const category = categories.find(c => c.name === screenName);
    const predefinedScreens = ['All', 'Work', 'Music', 'Travel', 'Study', 'Home', 'Hobby', 'MakeTask', 'AddCategory'];
    
    if (predefinedScreens.includes(screenName)) {
      navigation.navigate(screenName);
    } else {
      navigation.navigate('CategoryScreen', { 
        category: screenName,
        iconUrl: category?.icon_url
      });
    }
  };

  const handleLongPress = (category) => {
    navigation.navigate('EditCategory', {
      categoryId: category.id,
      categoryName: category.name,
      iconUrl: category.icon_url
    });
  };

  const sortCategories = (categories) => {
    const allCategory = categories.find(category => category.name === 'All');
    const predefinedOrder = ['Work', 'Travel', 'Study', 'Music', 'Home', 'Hobby'];
    
    let otherCategories = categories.filter(category => category.name !== 'All');

    if (sortOrder === 'alphabetical') {
      otherCategories.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'standard') {
      otherCategories.sort((a, b) => {
        if (a.type === 'predefined' && b.type === 'predefined') {
          return predefinedOrder.indexOf(a.name) - predefinedOrder.indexOf(b.name);
        } else if (a.type === 'custom' && b.type === 'custom') {
          return a.id - b.id; // standard first (lowest ID first)
        } else if (a.type === 'predefined') {
          return -1; // Predefined categories first
        } else {
          return 1;  // Custom categories last
        }
      });
    } else {
      // Recently Added (default)
      otherCategories.sort((a, b) => {
        if (a.type === 'predefined' && b.type === 'predefined') {
          return predefinedOrder.indexOf(a.name) - predefinedOrder.indexOf(b.name);
        } else if (a.type === 'custom' && b.type === 'custom') {
          return b.id - a.id; // Most recent first (highest ID first)
        } else if (a.type === 'custom') {
          return -1; // Custom categories first
        } else {
          return 1;  // Predefined categories last
        }
      });
    }

    return allCategory ? [allCategory, ...otherCategories] : otherCategories;
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => {
      if (prevOrder === 'alphabetical') return 'standard';
      if (prevOrder === 'standard') return 'recent';
      return 'alphabetical';
    });
  };

  const images = {
    all: require('./assets/all.png'),
    work: require('./assets/work.png'),
    music: require('./assets/music.png'),
    travel: require('./assets/travel.png'),
    study: require('./assets/study.png'),
    home: require('./assets/home.png'),
    hobby: require('./assets/Hobby.png'),
  };

  const getImageSource = (category) => {
    if (category.type === 'predefined') {
      return images[category.name.toLowerCase()] || require('./assets/menu2.png');
    } else if (category.icon_url) {
      return { uri: `http://10.3.1.65/ToDoListApp/screens/backend/${category.icon_url}` };
    }
    return require('./assets/menu2.png');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <CustomMenu 
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        currentSortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      <ScrollView>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Image style={styles.menu} source={require('./assets/menu.png')} />
        </TouchableOpacity>
        <Text style={styles.listsText}>Lists</Text>
        <View style={styles.boxesContainer}>
          {sortCategories(categories).map(category => (
            <TouchableOpacity
              key={category.name}
              style={styles.boxes}
              onPress={() => handleBoxPress(category.name)}
              onLongPress={() => category.type === 'custom' ? handleLongPress(category) : null}
            >
              <Image
                style={styles.icoontje}
                source={getImageSource(category)}
                resizeMode="cover"
              />
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
    borderRadius: 8, // Add this to make images look better
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
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(49, 74, 164, 1)',
  },
  footerplus: {
    height: 25,
    width: 25,
    left: 22,
    top: 21,
  },
  sortButtonText: {
    fontSize: 16,
    textAlign: 'center',
    left: 120,
    top: -35,  
    color: 'rgba(169, 169, 169, 1)',
  },
  loginButton: {
    backgroundColor: 'rgba(49, 74, 164, 1)',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deletedTasksButton: {
    backgroundColor: 'rgba(169, 169, 169, 0.2)',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  deletedTasksButtonText: {
    color: 'rgba(49, 74, 164, 1)',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;