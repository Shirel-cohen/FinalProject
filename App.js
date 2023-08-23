import React, { useEffect } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SelfieScreen from "./SelfieScreen";
import MusicStyles from "./MusicStyles";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 3000);


const Stack = createStackNavigator();

export default function App() {
    return (

        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: 'Have fun',
                        headerTitleAlign: 'center',
                        headerTintColor:"#1f2156",

                    }}
                />
                <Stack.Screen
                    name="SelfieScreen"
                    component={SelfieScreen}
                    options={{
                        title: 'Let\'s take a picture 😎' ,
                        headerTitleAlign: 'left',
                    }}
                />
                <Stack.Screen

                    name="MusicStyles"
                    component={MusicStyles}
                    options={{
                        title: 'MusicStyles',
                        headerTitleAlign: 'center',
                    }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}

function HomeScreen({ navigation }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('SelfieScreen');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                // style={{ width: 350, height: 350, borderRadius: 200, position:'relative'}}
                source={{
                    uri:
                        'https://www.budrutz.co.il/wp-content/uploads/2021/01/Classic-937-Black.jpg',
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign:'center',
        backgroundColor:'#000000',
    },
    logo: {
        width: 200,
        height: 200,

    },
});