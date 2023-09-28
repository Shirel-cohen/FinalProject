import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const PlayButton = ({ trackUri, token, isPlaying, onTogglePlayback }) => {
    return (
        <TouchableOpacity
            style={styles.playButton}
            onPress={onTogglePlayback}
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
    const [currentlyPlayingTrackUri, setCurrentlyPlayingTrackUri] = useState(null);
    const [audioObject, setAudioObject] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayback = async (trackUri) => {
        try {
            if (!trackUri) {
                throw new Error('Invalid or missing trackUri');
            }

            if (audioObject) {
                const status = await audioObject.getStatusAsync();
                if (status.isLoaded) {
                    if (currentlyPlayingTrackUri === trackUri) {
                        // Toggle play/pause for the same song
                        if (isPlaying) {
                            await audioObject.pauseAsync();
                        } else {
                            await audioObject.playAsync();
                        }
                        setIsPlaying(!isPlaying);
                    } else {
                        // Stop and unload the current audioObject
                        await audioObject.stopAsync();
                        await audioObject.unloadAsync();

                        // Create a new audio object and start playing a different song
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
                        setCurrentlyPlayingTrackUri(trackUri);
                    }
                } else {
                    console.warn('Audio object is not loaded');
                }
            } else {
                // Create a new audio object and start playing a song
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
                setCurrentlyPlayingTrackUri(trackUri);
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };


    useEffect(() => {
        // Clean up audioObject when the component unmounts
        return async () => {
            if (audioObject) {
                try {
                    const status = await audioObject.getStatusAsync();
                    if (status.isLoaded) {
                        await audioObject.stopAsync();
                        await audioObject.unloadAsync();
                    }
                } catch (error) {
                    console.error('Error unloading audioObject:', error);
                }
            }
        };
    }, [audioObject]);

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backToList}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.text}>Selected Style: {selectedStyle}</Text>

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
                                isPlaying={currentlyPlayingTrackUri === item.track.uri && isPlaying}
                                onTogglePlayback={() => togglePlayback(item.track.uri)}
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
        backgroundColor: '#000',
        flex: 1,
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
        color:'white',
        fontFamily: 'Lemon-Regular'
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
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Lemon-Regular', // Apply your custom font here
    },
    searchContainer: {
        marginTop:20,
        padding: 10,
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        fontFamily: 'Lemon-Regular'
    },
    text:{
        color:'#ffffff',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'Lemon-Regular',
        marginTop:80
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
});

export default MusicListScreen;