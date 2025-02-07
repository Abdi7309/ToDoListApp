import { StyleSheet, } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(49, 74, 164, 1)',
    flex: 1,
  },

  boxes: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    width: '100%',
    top: '1%',
    height: '61%',
    paddingBottom: 10,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
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
    marginTop: 50,
  },
  deleteButton: {
    color: 'red',
    marginLeft: 30,
    marginBottom: 10,
  },
  foto: {
    top: "160%",
    marginLeft: 40,
    borderRadius: 1000,
    height: 60, 
    width: 60,
  },
  Text1: {
    marginTop: 115,
    color: 'white',
    fontSize: 32,
    left:50,
    
  },
  Text2: {
    color: 'white',
    marginBottom: 20,
    fontSize: 12,
    left:50,
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
  }

});

export default styles;