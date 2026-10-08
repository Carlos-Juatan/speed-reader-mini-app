import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddTextScreen from '../screens/AddTextScreen';
import ReaderScreen from '../screens/ReaderScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddText" 
          component={AddTextScreen} 
          options={{ title: 'Add New Text' }} 
        />
        <Stack.Screen 
          name="Reader" 
          component={ReaderScreen} 
          options={{ headerShown: false, presentation: 'fullScreenModal' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
