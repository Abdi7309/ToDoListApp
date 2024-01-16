import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image,TouchableOpacity,} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
            <Text style={styles.tijdtekst}>
              Late

            </Text>
            
            <Text style={styles.auto1}>
              rrrrrrrr 
              
            </Text>
          
            <TouchableOpacity>
            <Text style={styles.textboxex}>All</Text>
            <Text style={styles.Tasksboxex}>... Tasks</Text>
          </TouchableOpacity>
            
           
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
tijdtekst:{
  marginTop: 60,
  color:'rgba(169, 169, 169, 1)' ,
  marginLeft: 35,
  fontSize: 17,
},
auto1:{
  marginTop: 30,
  marginLeft: 5,
  fontSize: 50,
  color: 'red',
},
terug: {
  width: 25,
  height: 25,
  marginLeft: 30,
  marginTop: 50,
},

});

export default Pagina1;
