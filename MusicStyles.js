import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, TextInput, Image, Linking, StyleSheet, FlatList} from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";


const CLIENT_ID = '74e458b48ee2421289c45b9a57aa3b25';
const REDIRECT_URI = 'exp://192.168.35.1:8081';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

const AUTH_SCOPE = 'user-modify-playback-state user-library-read '; // Add more scopes if needed
const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(AUTH_SCOPE)}`;


const MOOD_PLAYLISTS = {
    happy: {
        pop: '37i9dQZF1DWVlYsZJXqdym',
        hiphop: '37i9dQZF1EIcFkD7LAX8lS',
        electronic: '3T4hRBYj2QzQfm6zwdrRj9',
        classic: '2mu4kG7W1LVjDh8SsxZBLF',
        soul:'37i9dQZF1EIeDpL80Eu0QH',
        rock: '2BumzROvyilNPyczjghkba',
        mix: '0RH319xCjeU8VyTSqCF6M4',
    },
    sad: {
        pop: '37i9dQZF1EIdZrPvCvCkh4',
        hiphop: '37i9dQZF1EIhAZHpzlopNk',
        electronic: '37i9dQZF1EIhndsHFX3usj',
        classic: '37i9dQZF1DXbm0dp7JzNeL',
        soul:'37i9dQZF1DXchlyaSeZp0q',
        rock: '6CikVcWPz2RoBE8yXOI9sY',
        mix: '6nxPNnmSE0d5WlplUsa5L3',
    },
    angry: {
        pop: '37i9dQZF1EIfThrCEERy1q',
        hiphop: '37i9dQZF1EIdaUXZDw9dYo',
        electronic: '37i9dQZF1EIdL7qgTGbNlT',
        classic: '4b2maBQiHFVILb2o72kGuJ',
        soul:'5zxrv8Y9lx26L5KHTDbgTi',
        rock: '37i9dQZF1EIhPEivbiO6xe',
        mix:'37i9dQZF1EIgNZCaOGb0Mi',
    },
    surprise:{
        pop: '3k1OryDac16hCAWbljib04',
        hiphop: '37i9dQZF1DX0D996ZXujBy',
        electronic:'4ZskYxIkEE0PhYCLHsxcF6',
        classic: '6AFqboR1lmeWveddd6hea6',
        soul:'6AFqboR1lmeWveddd6hea6',
        mix: '0hlSvRQEWrtgQudVkgCFFt',
    }
};

const genreImages = {
    pop: require('./assets/pop.png'),
    hiphop: require('./assets/hiphop.png'),
    electronic: require('./assets/electronic.png'),
    classic: require('./assets/classic.png'),
    soul: require('./assets/soul.png'),
    rock: require('./assets/rock.png'),
    mix: require('./assets/mix.png'),
};

const moodImages = {
    happy: require('./assets/happy.png'),
    sad: require('./assets/sad.png'),
    angry: require('./assets/angry.png'),
    surprise: require('./assets/surprise.png'),
};

const MusicStyles = ({route,  navigation}) => {
    const mood = route.params?.mood;
    const [token, setToken] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [displayedMoodStyles, setDisplayedMoodStyles] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [hasSelectedMood, setHasSelectedMood] = useState(false); // Track whether a mood has been selected



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
            setHasSelectedMood(true); // Set the flag to true when a mood is selected

        } else {
            setSelectedMood(null);
            setSelectedStyle(null);
            setDisplayedMoodStyles(MOOD_PLAYLISTS);
            setHasSelectedMood(false); // Set the flag to false when no mood is selected

        }

    }, [mood]);

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token');
    };

    const navigateToMusicListScreen = async (selectedStyle) => {
        try {
            if (!selectedMood) {
                setSelectedMood(selectedStyle.toLowerCase());
                setDisplayedMoodStyles(MOOD_PLAYLISTS[selectedStyle.toLowerCase()]);
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
                token
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
                    // position_ms: 0, // Start from the beginning
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

    const navigateToSelfieScreen = async () => {
        // Request camera permission here (remove media library permission request)
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const hasCameraPermission = cameraPermission.status === "granted";
        if (hasCameraPermission) {
            // Navigate to SelfieScreen only if camera permission is granted
            navigation.navigate("SelfieScreen");
        } else {
            // Handle the case where camera permission is not granted
            // You can display an error message or take appropriate action
            // For example:
            alert("Please grant camera permission in settings.");
        }
    };

    const renderMoodImages = () => {
        if (!selectedMood) {
            return (
                <View style={styles.image}>
                    {Object.keys(MOOD_PLAYLISTS).map(moodButton => (
                        <TouchableOpacity
                            key={moodButton}
                            onPress={() => handleMoodImageClick(moodButton.toLowerCase())}
                            style={styles.image}>
                            <Image source={moodImages[moodButton.toLowerCase()]} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        } else {
            return (
                <Image source={genreImages[selectedMood]} style={styles.image} />
            );
        }
    };

    const handleMoodImageClick = (moodButton) => {
        // Handle mood image click here
        setSelectedMood(moodButton.toLowerCase());
        const filteredMoodStyles = MOOD_PLAYLISTS[moodButton.toLowerCase()];
        setDisplayedMoodStyles(filteredMoodStyles);
        setHasSelectedMood(true);
    }


    return (
        <View style={styles.container}>

            {!token ? (
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => Linking.openURL(`${authUrl}`)}>
                    <Text style={styles.buttonText}>Login to Spotify</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.contentContainer}>
                    <View style={styles.moodContainer}>
                        {hasSelectedMood ? (
                            <Text style={styles.textStyle}>Now you can choose the genre you would like to listen to</Text>

                        ) : (
                            <View>
                                <Text style={styles.textStyle}>
                                    {!selectedMood ? "Since you're neutral...\n You can choose what mood you want to be in" : "Now you can choose the genre you would like to listen to"}
                                </Text>
                            </View>
                        )}

                        {Object.keys(displayedMoodStyles).map(moodButton => (
                            <TouchableOpacity
                                key={moodButton}
                                onPress={() => navigateToMusicListScreen(moodButton.toLowerCase())}
                                style={styles.genreButton}>
                                <Image source={genreImages[moodButton.toLowerCase()]} style={styles.image} />
                                {!Object.keys(MOOD_PLAYLISTS).includes(mood.toLowerCase()) && (
                                    <View style={styles.moodImagesContainer}>
                                        <Image source={moodImages[moodButton.toLowerCase()]} style={styles.image} />
                                    </View>
                                )}

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
            {/*<TouchableOpacity onPress={navigateToSelfieScreen} style={styles.backButton}>*/}
            {/*    <Text style={styles.backToList}>Take a Selfie</Text>*/}
            {/*</TouchableOpacity>*/}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backToList}>Back</Text>
            </TouchableOpacity>


            {token && (
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#000',
        fontFamily: 'Lemon-Regular', // Apply your custom font here

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
        paddingBottom: 20,
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center', // Center the container horizontally
    },
    logoutButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    loginButton: {
        position: 'absolute',
        top: 350,
        alignSelf: 'center', // Center the container horizontally
        backgroundColor: '#1DB954',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        // marginVertical: 10,
    },
    textStyle: {
        color: '#fff',
        fontSize: 22,
        textAlign: "center",
        fontFamily: 'Lemon-Regular',
        marginBottom: 20, // Add margin at the bottom of the text
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Lemon-Regular', // Apply your custom font here
    },
    moodContainer: {
        marginTop: 130, // Increase the top margin to move everything down
        marginBottom: 30,
        flexDirection: 'row', // Make it a row container
        flexWrap: 'wrap', // Allow wrapping to the next row
        justifyContent: 'center',
    },
    moodTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'Lemon-Regular'
    },
    styleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    moodButton: {
        backgroundColor: '#000000',
        width: '65%',
        borderRadius: 30,
        paddingVertical: 50, // Increase the vertical padding to create more space
        paddingHorizontal: 30, // Increase the horizontal padding for better alignment
        margin: 15, // Increase the margin between mood buttons
        alignItems: "center",
        textAlign: "center",
        alignSelf: "center",
        color: '#98e8b0',
        fontFamily: 'Lemon-Regular',
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
        textAlign: "auto",
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
        fontFamily: 'Lemon-Regular'

    },
    playButton: {
        backgroundColor: '#1DB954',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    moodImagesContainer: {
        flexDirection: 'row', // Arrange images horizontally
        justifyContent: 'space-between', // Adjust the space between images
        marginVertical: -40, // Add vertical margin to the container
    },
    playButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    image: {
        width: 150, // Set the width of the image as needed
        height: 100, // Set the height of the image as needed
        resizeMode: 'contain', // Adjust the resizeMode as needed (cover, contain, stretch, etc.)
        borderRadius: 10
    },
    genreButton: {
        width: '50%', // Each genre takes half of the container width
        alignItems: 'center',
        marginBottom: 10, // Space between rows
    },
    backButton: {
        alignItems: 'center', // To center align the icon and text vertically
        backgroundColor: '#ffffff', // Customize the button background color
        borderRadius: 5,
        justifyContent: "center",
        marginBottom: 10,
        marginLeft: 280,
        position:'absolute',
        top:45,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    backToList: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Lemon-Regular', // Apply your custom font here
    },
});

export default MusicStyles;