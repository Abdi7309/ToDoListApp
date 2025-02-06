import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 245, 245, 1)',
    flex: 1,
  },
  terug: {
    width: 25,
    height: 25,
    left: 350,
    top: 20,
  },
  TaskText: {
    color: 'black',
    top: 50,
    left: 150,
    fontSize: 25,
    fontWeight: '600',
  },
  planText: {
    color: 'rgba(169, 169, 169, 1)',
    top: 95,
    left: 30,
    fontSize: 13,
  },
  input: {
    height: 90,
    borderWidth: 0,
    top: 95,
    fontSize: 40,
    borderColor: 'gray',
    margin: 10,
    padding: 8,
    borderBottomWidth: 1,  
  },
  input2: {
    height: 40,
    borderWidth: 0,
    top: 120,
    marginLeft: 100,
    marginRight: 100,
    margin: 10,
    padding: 8,
    fontSize: 16,
  },
  input2Placeholder: {
    color: 'black',
  },
  icon1: {
    top: 164, 
    marginLeft: 50,
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
  pickerSelectContainer: {
    height: 40,
    width: 215,
    top: 120,
    left: 91,
  },
  pickerSelectText: {
    fontSize: 14,
  },
  pickerSelectAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  pickerSelectIOS: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  pickerSelectPlaceholder: {
    fontSize: 14,
    color: 'black',
  },
});

export default styles;