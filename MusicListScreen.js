import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; // Import the axios library
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const PlayButton = ({ trackUri, token }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioObject, setAudioObject] = useState(null);

    const initializeAudioObject = async () => {
        try {
            if (!trackUri) {
                throw new Error('Invalid or missing trackUri');
            }

            if (audioObject) {
                // Toggle play/pause
                if (isPlaying) {
                    await audioObject.pauseAsync();
                } else {
                    await audioObject.playAsync();
                }
                setIsPlaying(!isPlaying);
            } else {
                // Create a new audio object and start playing
                const trackId = trackUri.split(':').pop();
                const spotifyResponse = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,

                    },
                });

                const audioUrl = spotifyResponse.data.preview_url;

                if (!audioUrl) {
                    throw new Error('Track does not have a preview URL');
                }

                const newAudioObject = new Audio.Sound();
                await newAudioObject.loadAsync({ uri: audioUrl });
                await newAudioObject.playAsync();
                setIsPlaying(true);
                setAudioObject(newAudioObject);
            }
        } catch (error) {
            console.error('Error initializing audioObject:', error);
        }
    };

    useEffect(() => {
        // Clean up audioObject when the component unmounts
        return () => {
            if (audioObject) {
                audioObject.unloadAsync();
            }
        };
    }, []);

    return (
        <TouchableOpacity
            style={styles.playButton}
            onPress={initializeAudioObject}
        >
            <Ionicons
                name={isPlaying ? 'ios-pause' : 'ios-play'}
                size={32}
                color="white"
            />
        </TouchableOpacity>
    );
};

const MusicListScreen = ({ route, navigation }) => {
    const { mood, selectedStyle, tracks, token } = route.params;
    const [searchQuery, setSearchQuery] = useState('');


    const filteredTracks = tracks
        .filter((item) =>
            item.track.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            item.track.preview_url
        )
        .sort((a, b) => {
            const aName = a.track.name.toLowerCase();
            const bName = b.track.name.toLowerCase();
            const query = searchQuery.toLowerCase();

            if (aName.startsWith(query) && !bName.startsWith(query)) {
                return -1;
            } else if (!aName.startsWith(query) && bName.startsWith(query)) {
                return 1;
            } else {
                return aName.localeCompare(bName);
            }
        });


    return (
        <View style={styles.container}>
            {/*<Text style={styles.text} >Current Mood: {mood}</Text>*/}
            <Text style={styles.text}>Selected Style: {selectedStyle}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                {/*<Text style={styles.backToList}>Go Back to Music Styles</Text>*/}
            </TouchableOpacity>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a song"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
            </View>
            <FlatList
                style={styles.trackContainer}
                data={filteredTracks}
                keyExtractor={(item) => item.track.id}
                renderItem={({ item }) => (
                    <View style={styles.trackItem}>
                        <Image
                            source={{ uri: item.track.album.images[0].url }}
                            style={{ width: 100, height: 100 }}
                        />
                        <View style={styles.songInfo}>
                            <Text style={styles.trackText}>{item.track.name}</Text>
                            <PlayButton
                                trackUri={item.track.uri}
                                token={token}
                            />
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000'
    },
    trackContainer: {
        marginTop: 20,
        backgroundColor: '#000'

    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingVertical: 5,
        textAlign: 'auto',
        backgroundColor: 'black',
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
    songInfo: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 10,
    },
    trackText: {
        fontSize: 14,
        marginTop: 5,
        color:'white'

    },
    playButton: {
        backgroundColor: '#1DB954',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    backToList: {
        color: 'red',
        borderRadius: 2,
    },
    searchContainer: {
        padding: 10,
        // backgroundColor: '#000000',
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
    },
    text:{
        color:'#ffffff',
        alignItems: 'center',
        textAlign: 'center'

    }
});

export default MusicListScreen;

