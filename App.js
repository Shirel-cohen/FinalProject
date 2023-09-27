import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SelfieScreen from "./SelfieScreen";
import MusicStyles from "./MusicStyles";
import * as SplashScreen from 'expo-splash-screen';
import AppIntroSlider from 'react-native-app-intro-slider';
import MusicListScreen from './MusicListScreen'; // Import the new component
SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);
import {useFonts} from "expo-font";
import { StatusBar } from 'expo-status-bar';



const Stack = createStackNavigator();

export default function App() {


    const [show_Main_App, setShow_Main_App] = useState(false);

    const on_Done_all_slides = () => {
        setShow_Main_App(true);
    };

    const on_Skip_slides = () => {
        setShow_Main_App(true);
    };

    const RenderItem = ({ item }) => {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: item.backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingBottom: 100,

                }}>
                <Text style={[styles.title, item.titleStyle, {fontFamily: 'Lemon-Regular'}]}>{item.title}</Text>
                <Image style={styles.image} source={item.image} />
                <Text style={[styles.text, item.textStyle, {fontFamily: 'Lemon-Regular'}]}>{item.text}</Text>
            </View>
        );
    };
    let [fontsLoaded] = useFonts({
        'Lemon-Regular' : require('./assets/fonts/Lemon-Regular.ttf')
    })

    if (!fontsLoaded){
        SplashScreen.preventAutoHideAsync()
        SplashScreen.hideAsync()    } else {



    if (show_Main_App) {
        return (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="SelfieScreen"
                        component={SelfieScreen}
                        options={{
                            // title: 'Let\'s take a picture 📷',
                            // headerTitleAlign: 'center',
                            // headerTitleStyle: {fontFamily:'Lemon-Regular'}
                            headerShown: false
                        }}
                    />
                    <Stack.Screen
                        name="MusicStyles"
                        component={MusicStyles}
                        options={{
                            // headerTitleAlign:"center",
                            // headerTitleStyle: {fontFamily:'Lemon-Regular'}
                            headerShown: false
                        }}
                    />
                    <Stack.Screen
                        name="MusicList"
                        component={MusicListScreen}
                        options={{
                            headerShown: false
                        }}
                    />

                </Stack.Navigator>
                <StatusBar style="light" />
            </NavigationContainer>
        );
    } else {
        return (
            <AppIntroSlider slides={slides} onDone={on_Done_all_slides}
                            showSkipButton={true}
                            onSkip={on_Skip_slides} data={slides} renderItem={RenderItem} />
        );
    }}
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign:'center',
        backgroundColor:'#000000',
        fontFamily:'Lemon-Regular'
    },
    logo: {
        width: 200,
        height: 200,

    },
    MainContainer: {
        flex: 1,
        paddingTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily:'Lemon-Regular'
    },
    title: {
        fontSize: 34,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 100,
        fontFamily: 'Lemon-Regular'

    },
    text: {
        color: '#fff',
        fontSize: 22,
        textAlign:"center",
        fontWeight: 'bold',
        fontFamily: 'Lemon-Regular'

    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain'
    },

});

const slides = [
    {
        key: 'k1',
        title: 'Welcome to MoodPlay!',
        text: 'Let us tell you about our app',
        image: require('./assets/musical-note.png'),
        backgroundColor: '#F7BB64',


    },
    {
        key: 'k2',
        title: 'Finding Out How' + "\n" +
            ' Do You Feel',
        text: 'By taking your picture we ' + "\n" +
            'analyze your current mood ',
        image: require('./assets/emoticons.png'),
        backgroundColor: '#F4B1BA',

    },
    {
        key: 'k3',
        title: 'Custom Playlist ',
        text: 'Using your Spotify account, ' + "\n" +
            'we suggest a playlist for you' + "\n" +
            'based on your feelings',
        image: require('./assets/spotify.png') ,
        backgroundColor: '#4093D2',


    },
    {
        key: 'k4',
        title: 'Are You Ready?',
        text: 'Let\'s take a picture!' ,
        image: require('./assets/photo-camera.png'),
        backgroundColor: '#644EE2',


    }
];
