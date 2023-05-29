import React from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './LoginPage';
import GreetingsScreen from "./GreetingsScreen";

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
                        headerTitleAllowFontScaling:'30px'

                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginPage}
                    options={{ title: 'Login'}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Image
                style={{ width: 200, height: 200, borderRadius: 100, position:'relative'}}
                source={{
                    uri:
                        'https://t3.ftcdn.net/jpg/04/54/66/12/360_F_454661277_NtQYM8oJq2wOzY1X9Y81FlFa06DVipVD.jpg',
                }}
            />
            <Button
                title="Login"
                onPress={() => navigation.navigate('Login')}
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
