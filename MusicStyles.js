import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Linking, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID = '74e458b48ee2421289c45b9a57aa3b25';
const REDIRECT_URI = 'https://open.spotify.com/search/';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

const MusicStyles = () => {
    const [token, setToken] = useState(null);
    const [mood, setMood] = useState('happy');

    useEffect(() => {
        const handleDeepLink = async () => {
            Linking.addEventListener('url', async ({ url }) => {
                const hash = url.split('#')[1];
                if (hash) {
                    const tokenParam = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
                    setToken(tokenParam);
                    await AsyncStorage.setItem('token', tokenParam);
                }
            });

            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                const hash = initialUrl.split('#')[1];
                if (hash) {
                    const tokenParam = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
                    setToken(tokenParam);
                    await AsyncStorage.setItem('token', tokenParam);
                }
            }
        };

        const loadTokenFromStorage = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Error loading token from storage:', error);
            }
        };

        handleDeepLink();
        loadTokenFromStorage();
    }, []);

    const updateMood = (newMood) => {
        setMood(newMood);
    };

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token'); // Remove token from AsyncStorage
    };


    const CustomButton = ({ text, redirectURI }) => {
        const handlePress = () => {
            Linking.openURL(`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${redirectURI}&response_type=${RESPONSE_TYPE}`);
        };
        return (
            <TouchableOpacity onPress={handlePress}>
                <Text style={styles.text}>{text}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 }}>
                <TouchableOpacity onPress={() => updateMood('happy')}>
                    <Text style={mood === 'happy' ? styles.selectedMoodButton : styles.moodButton}>Happy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateMood('sad')}>
                    <Text style={mood === 'sad' ? styles.selectedMoodButton : styles.moodButton}>Sad</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateMood('angry')}>
                    <Text style={mood === 'angry' ? styles.selectedMoodButton : styles.moodButton}>Angry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateMood('depressed')}>
                    <Text style={mood === 'depressed' ? styles.selectedMoodButton : styles.moodButton}>Depressed</Text>
                </TouchableOpacity>
            </View>

            {!token ? (
                <>
                    {mood === 'sad' && (
                        <>
                            <CustomButton text="Hip Hop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIhAZHpzlopNk" />
                            <CustomButton text="Pop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIdZrPvCvCkh4" />
                            <CustomButton text="Electric" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIhndsHFX3usj" />
                            <CustomButton text="Classic" redirectURI="https://open.spotify.com/playlist/37i9dQZF1DXbm0dp7JzNeL" />
                            <CustomButton text="Soul" redirectURI="https://open.spotify.com/playlist/37i9dQZF1DXchlyaSeZp0q" />
                            <CustomButton text="Rock" redirectURI="https://open.spotify.com/playlist/6CikVcWPz2RoBE8yXOI9sY" />
                            <CustomButton text="Mix" redirectURI="https://open.spotify.com/playlist/6nxPNnmSE0d5WlplUsa5L3" />

                        </>
                    )}
                    {mood === 'happy' && (
                        <>
                            <CustomButton text="Hip Hop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIcFkD7LAX8lS" />
                            <CustomButton text="Pop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1DWVlYsZJXqdym" />
                            <CustomButton text="Electric" redirectURI="https://open.spotify.com/playlist/3T4hRBYj2QzQfm6zwdrRj9" />
                            <CustomButton text="Classic" redirectURI="https://open.spotify.com/playlist/2mu4kG7W1LVjDh8SsxZBLF" />
                            <CustomButton text="Soul" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIeDpL80Eu0QH" />
                            <CustomButton text="Rock" redirectURI="https://open.spotify.com/playlist/2BumzROvyilNPyczjghkba" />
                            <CustomButton text="Mix" redirectURI="https://open.spotify.com/playlist/0RH319xCjeU8VyTSqCF6M4" />
                        </>
                    )}
                    {mood === 'angry' && (
                        <>
                            <CustomButton text="Hip Hop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIdaUXZDw9dYo" />
                            <CustomButton text="Pop" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIfThrCEERy1q" />
                            <CustomButton text="Electric" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIdL7qgTGbNlT" />
                            <CustomButton text="Classic" redirectURI="https://open.spotify.com/playlist/4b2maBQiHFVILb2o72kGuJ" />
                            <CustomButton text="Soul" redirectURI="https://open.spotify.com/playlist/5zxrv8Y9lx26L5KHTDbgTi" />
                            <CustomButton text="Rock" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIhPEivbiO6xe" />
                            <CustomButton text="Mix" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIgNZCaOGb0Mi" />
                        </>
                    )}
                    {mood === 'depressed' && (
                        <>
                            <CustomButton text="Hip Hop" redirectURI="https://open.spotify.com/playlist/4ZaiEOSzu2lkncC0aMlJiv" />
                            <CustomButton text="Pop" redirectURI="https://open.spotify.com/playlist/3ZlKFlbR0uFA5hkUFBUUZZ" />
                            <CustomButton text="Classic" redirectURI="https://open.spotify.com/playlist/2f1FNuNMdoVNdCMmXogwUQ" />
                            <CustomButton text="Soul" redirectURI="https://open.spotify.com/track/139WYHG6Dn48GdLzyhj29P" />
                            <CustomButton text="Rock" redirectURI="https://open.spotify.com/playlist/0DtQQvbkuQEutzrtmqgVX9" />
                            <CustomButton text="Mix" redirectURI="https://open.spotify.com/playlist/37i9dQZF1EIg6gLNLe52Bd" />
                        </>
                    )}

                </>
            ) : (
                <TouchableOpacity onPress={logout}>
                    <Text>Logout</Text>
                </TouchableOpacity>
            )}


        </View>
    );
};

const styles = StyleSheet.create({
    cloud: {
        borderRadius: 10,
        padding: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2.65,
        elevation: 4,
    },
    text: {
        fontSize: 5,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        backgroundColor: '#cbd4e8',
        borderRadius: 30,
        padding: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2.65,
        elevation: 4,
    },
    moodButton: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#333',
        padding: 5,
    },
    selectedMoodButton: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'blue',
        padding: 5,
    },
});
export default MusicStyles;
