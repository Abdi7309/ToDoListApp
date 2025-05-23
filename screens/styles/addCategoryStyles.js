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
    imagePickerButton: {
      height: 40,
      marginTop: 20,
      justifyContent: 'center',
    },
    imagePickerButtonText: {
      left: 45,
      color: 'black',
      fontSize: 16,
    },
    icon1: {
      marginTop: -34,
      marginLeft: 0,
      height: 30,
      width: 30,
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
      fontWeight: '500',
    }
  });
};

export default createStyles;
