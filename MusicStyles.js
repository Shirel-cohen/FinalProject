import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, TextInput, Image, Linking, StyleSheet, FlatList} from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MusicListScreen from './MusicListScreen'; // Import the new component

const CLIENT_ID = '74e458b48ee2421289c45b9a57aa3b25';
const REDIRECT_URI = 'exp://192.168.68.103:19000';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

const AUTH_SCOPE = 'user-modify-playback-state user-library-read '; // Add more scopes if needed
const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(AUTH_SCOPE)}`;


const MOOD_PLAYLISTS = {
    happy: {
        pop: '37i9dQZF1DWVlYsZJXqdym',
        hipHop: '37i9dQZF1EIcFkD7LAX8lS',
        electronic: '3T4hRBYj2QzQfm6zwdrRj9',
        classic: '2mu4kG7W1LVjDh8SsxZBLF',
        soul:'37i9dQZF1EIeDpL80Eu0QH',
        rock: '2BumzROvyilNPyczjghkba',
        mix: '0RH319xCjeU8VyTSqCF6M4',
    },
    sad: {
        pop: '37i9dQZF1EIdZrPvCvCkh4',
        hipHop: '37i9dQZF1EIhAZHpzlopNk',
        electronic: '37i9dQZF1EIhndsHFX3usj',
        classic: '37i9dQZF1DXbm0dp7JzNeL',
        soul:'37i9dQZF1DXchlyaSeZp0q',
        rock: '6CikVcWPz2RoBE8yXOI9sY',
        mix: '6nxPNnmSE0d5WlplUsa5L3',
    },
    angry: {
        pop: '37i9dQZF1EIfThrCEERy1q',
        hipHop: '37i9dQZF1EIdaUXZDw9dYo',
        electronic: '37i9dQZF1EIdL7qgTGbNlT',
        classic: '4b2maBQiHFVILb2o72kGuJ',
        soul:'5zxrv8Y9lx26L5KHTDbgTi',
        rock: '37i9dQZF1EIhPEivbiO6xe',
        mix:'37i9dQZF1EIgNZCaOGb0Mi',
    },
    surprise:{
        pop: '3k1OryDac16hCAWbljib04',
        hipHop: '37i9dQZF1DX0D996ZXujBy',
        electronic:'4ZskYxIkEE0PhYCLHsxcF6',
        classic: '6AFqboR1lmeWveddd6hea6',
        soul:'6AFqboR1lmeWveddd6hea6',
        mix: '0hlSvRQEWrtgQudVkgCFFt',
    }
};
const MusicStyles = ({route,  navigation}) => {
    const mood = route.params?.mood;
    const [token, setToken] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [displayedMoodStyles, setDisplayedMoodStyles] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState(null);


    useEffect(() => {
        const handleDeepLink = async () => {
            Linking.addEventListener('url', async ({url}) => {
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
        const isValidMood = Object.keys(MOOD_PLAYLISTS).includes(mood.toLowerCase());
        if (isValidMood) {
            setSelectedMood(mood.toLowerCase());
            const filteredMoodStyles = MOOD_PLAYLISTS[mood.toLowerCase()];
            setDisplayedMoodStyles(filteredMoodStyles);
        } else {
            setSelectedMood(null);
            setSelectedStyle(null);
            setDisplayedMoodStyles(MOOD_PLAYLISTS);
        }

    }, [mood]);

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token');
    };

    const navigateToMusicListScreen = async (selectedStyle) => {
        try {
            if (!selectedMood) {
                console.error('Please select a mood first.');
                return;
            }

            if (!MOOD_PLAYLISTS[selectedMood] || !MOOD_PLAYLISTS[selectedMood][selectedStyle]) {
                console.error('Invalid mood or style:', selectedMood, selectedStyle);
                return;
            }

            const playlistId = MOOD_PLAYLISTS[selectedMood][selectedStyle];
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            navigation.navigate('MusicList', {
                mood: selectedMood,
                selectedStyle,
                tracks: response.data.items,
                playTrack,
            });
        } catch (error) {
            console.error('Error fetching tracks by mood and style:', error);
        }
    };
    const playTrack = async (trackUri) => {
        try {
            await axios.put(
                'https://api.spotify.com/v1/me/player/play',
                {
                    uris: [trackUri],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    return (
        <View style={styles.container}>
            {!token ? (
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => Linking.openURL(`${authUrl}`)}>
                    <Text style={styles.buttonText}>Login to Spotify</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={logout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            )}

            {token && (
                <View style={styles.contentContainer}>
                    <View style={styles.moodContainer}>
                        <Text>hello!</Text>
                        <Text> We have identified that your mood is:{mood}</Text>
                        <Text> Choose a song style and enjoy!</Text>
                        {Object.keys(displayedMoodStyles).map(moodButton => (
                            <TouchableOpacity
                                key={moodButton}
                                onPress={() => navigateToMusicListScreen(moodButton.toLowerCase())}
                            >
                                <Text style={styles.moodButton}>{moodButton}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedMood && selectedStyle && (
                        <FlatList
                            style={styles.trackContainer}
                            data={tracks}
                            keyExtractor={item => item.track.id}
                            renderItem={({ item }) => (
                                <View style={styles.trackItem}>
                                    <TouchableOpacity
                                        style={styles.playButton}
                                        onPress={() => playTrack(item.track.uri)}>
                                        <Text style={styles.playButtonText}>Play</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.trackText}>{item.track.name}</Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#284B63',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 10,
    },
    loginButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    moodContainer: {
        marginBottom: 20,
    },
    moodTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    styleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    moodButton: {
        backgroundColor: '#cbd4e8',
        width: '50%',
        borderRadius:10,
        paddingVertical: 5,
        margin: 5,
        alignItems:"center",
        textAlign:"center",
        alignSelf:"center",
    },
    selectedMoodButton: {
        backgroundColor: '#1DB954',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 10,
        margin: 5,
    },
    trackContainer: {
        marginTop: 20,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingVertical: 5,
        textAlign:"auto",
        backgroundColor: 'white',
        borderRadius: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 1.65,
        elevation: 2,
    },
    trackText: {
        fontSize: 14,
    },
    playButton: {
        backgroundColor: '#1DB954',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    playButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});


export default MusicStyles;