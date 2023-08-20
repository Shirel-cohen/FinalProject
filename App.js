import React, { useEffect } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SelfieScreen from "./SelfieScreen";
import MusicStyles from "./MusicStyles";


const Stack = createStackNavigator();

export default function App() {
    return (

        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: 'MoodPlay',
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

                    name="MusicStyles" // Add the new screen to the stack navigator
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
                style={{ width: 350, height: 350, borderRadius: 200, position:'relative'}}
                source={{
                    uri:
                        'https://t3.ftcdn.net/jpg/04/54/66/12/360_F_454661277_NtQYM8oJq2wOzY1X9Y81FlFa06DVipVD.jpg',
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
        backgroundColor:'#afc0e3',
    },
    logo: {
        width: 200,
        height: 200,

    },
});
