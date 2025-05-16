import { StyleSheet } from 'react-native';

const uiterlijk = (isLandscape) => {
  return StyleSheet.create({
    container: {
      backgroundColor: 'rgba(49, 74, 164, 1)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    boxes: {
      backgroundColor: 'rgba(245, 245, 245, 1)',
      width: '100%',
      flex: 1,
      paddingBottom: 10,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      position: 'relative',
      top: '1%',
    },
    titeltekst: {
      fontSize: 24,
      color: 'black',
      fontWeight: '600',
    },
    descriptiontekst: {
      color: 'rgba(169, 169, 169, 1)',
      fontSize: 20,
      paddingLeft: 2,
      flexWrap: 'wrap',
    },
    terug: {
      width: 20,
      height: 20,
      marginLeft: 30,
      marginTop: isLandscape ? 20 : 50,
    },
    deleteButton: {
      color: 'red',
      marginLeft: 30,
      marginBottom: 10,
    },
    foto: {
      height: 60,
      width: 60,
      borderRadius: 1000,
      marginLeft: isLandscape ? 0 : 40,
      top: isLandscape ? 0 : 0,
    },
    portraitHeaderContainer: {
      marginTop: 98,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 30,
      marginTop: 20,
    },
    textContainer: {
      marginLeft: 20,
    },
    Text1: {
      color: 'white',
      fontSize: 32,
      marginTop: isLandscape ? 0 : 20,
      marginLeft: isLandscape ? 20 : 50,
    },
    Text2: {
      color: 'white',
      fontSize: 12,
      marginTop: 5,
      marginBottom: 20,
      marginLeft: isLandscape ? 20 : 50,
    },
    trash: {
      height: 40,
      width: 40,
    },
    trashContainer: {
      position: 'absolute',
      right: '10%',
      top: 30,
    },
    trashButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
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
    taskContainer: {
      paddingHorizontal: 20,
      marginVertical: 10,
    },
    taskContent: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
  });
};

export default uiterlijk;