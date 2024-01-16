import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image,TouchableOpacity,} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from '../App';

const Stack = createNativeStackNavigator();


class Pagina1 extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.terug} source={require('../assets/pijl2.png')} />
        </TouchableOpacity>
      
        <View style={styles.boxes}>
          <ScrollView>
            <Text style={styles.auto}>
              gggg
            </Text>
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
  top: '35%',
  height: '100%',
  borderTopLeftRadius: 35,
  borderTopRightRadius: 35,
  marginBottom: 45, 
},
auto:{
  marginTop: 10,
  marginLeft: 35,
  fontSize: 50,
},
terug: {
  width: 25,
  height: 25,
  marginLeft: 30,
  marginTop: 50,
},
});

export default Pagina1;
