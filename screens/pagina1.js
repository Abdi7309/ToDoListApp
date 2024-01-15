import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

class Pagina1 extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
      <View>
        <Text>Pagina1 Screen</Text>
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
});

export default Pagina1;
