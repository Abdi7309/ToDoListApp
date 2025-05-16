import { StyleSheet } from 'react-native';

const createStyles = (isLandscape) => {
  return StyleSheet.create({
    container: {
      backgroundColor: 'rgba(245, 245, 245, 1)',
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 80,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginTop: isLandscape ? 20 : 50,
      paddingHorizontal: 20,
    },
    closeButton: {
      position: 'absolute',
      right: 20,
    },
    terug: {
      width: 25,
      height: 25,
    },
    TaskText: {
      color: 'black',
      fontSize: 25,
      fontWeight: '600',
      textAlign: 'center',
    },
    formContainer: {
      paddingHorizontal: 20,
      marginTop: isLandscape ? 20 : 40,
    },
    planText: {
      color: 'rgba(169, 169, 169, 1)',
      fontSize: 13,
      marginBottom: 10,
    },
    input: {
      height: 90,
      borderBottomWidth: 1,
      borderColor: 'gray',
      fontSize: isLandscape ? 32 : 40,
      paddingVertical: 8,
      marginBottom: 20,
    },
    descriptionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    icon1: {
      height: 30,
      width: 30, 
      marginRight: 10,
    },
    input2: {
      flex: 1,
      height: 40,
      fontSize: 16,
      paddingVertical: 8,
    },
    pickerSelectContainer: {
      marginTop: 30,
      backgroundColor: 'white',
      borderRadius: 8,
      overflow: 'hidden',
    },
    pickerSelectAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30,
      backgroundColor: 'white',
    },
    pickerSelectIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30,
      backgroundColor: 'white',
    },
    pickerSelectPlaceholder: {
      color: '#AAA',
      fontSize: 16,
    },
    saveButton: {
      position: 'absolute',
      bottom: 0,
      left: 0, 
      right: 0,
      height: 65,
      backgroundColor: 'rgba(49, 74, 164, 1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonText: {
      color: 'white', 
      fontSize: 26, 
      fontWeight: '500'
    }
  });
};

export default createStyles;