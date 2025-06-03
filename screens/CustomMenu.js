import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../context/LanguageContext';

export const CustomMenu = ({ isVisible, onClose, navigation, currentSortOrder, setSortOrder }) => {
  const { language, setLanguage } = useContext(LanguageContext);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const menuItems = [
    {
      label: `Sort (${currentSortOrder})`,
      onPress: () => {
        setSortOrder(prev => {
          if (prev === 'alphabetical') return 'standard';
          if (prev === 'standard') return 'recent';
          return 'alphabetical';
        });
      }
    },
    {
      label: `Language (${language})`,
      onPress: async () => {
        const newLang = language === 'EN' ? 'NL' : 'EN';
        await AsyncStorage.setItem('app_language', newLang);
        setLanguage(newLang);
        handleClose();
      }
    },
    {
      label: 'Deleted Tasks',
      onPress: () => {
        handleClose();
        navigation.navigate('DeletedTasks');
      }
    },
    {
      label: 'Logout',
      onPress: async () => {
        await AsyncStorage.removeItem('user_id');
        handleClose();
        navigation.navigate('Login');
      }
    }
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <Animated.View 
          style={[
            styles.menu,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.menuHeader}>
            <Image 
              source={require('../assets/menu11.png')} 
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'white',
  },
  menuHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  menuIcon: {
    width: 40,
    height: 30,
  },
  menuItem: {
    padding: 20,
  },
  menuText: {
    fontSize: 16,
    color: 'black',
  }
});
