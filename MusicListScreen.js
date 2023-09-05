import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet, Image, TextInput} from 'react-native';
import { Audio } from 'expo-av'; // Import Expo Audio

const MusicListScreen = ({ route, navigation }) => {
    const { mood, selectedStyle, tracks, playTrack } = route.params;
    const [searchQuery, setSearchQuery] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioObject, setAudioObject] = useState(null);

    useEffect(() => {
        // Initialize audioObject when the component mounts
        const initializeAudioObject = async () => {
            const newAudioObject = new Audio.Sound();
            await newAudioObject.loadAsync({ shouldPlay: false });
            setAudioObject(newAudioObject);
        };

        initializeAudioObject();
    }, []);
    const filteredTracks = tracks.filter(item =>
        item.track.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const togglePlayPause = async () => {
        if (isPlaying) {
            // Pause the currently playing track
            await audioObject.pauseAsync();
        } else {
            // Continue playing the paused track
            await audioObject.playAsync();
        }
        setIsPlaying(!isPlaying); // Toggle the play/pause state
    };



    return (
        <View>
            <Text>Selected Mood: {mood}</Text>
            <Text>Selected Style: {selectedStyle}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backToList}>Go Back to Music Styles</Text>
            </TouchableOpacity>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a song"
                    value={searchQuery}
                    onChangeText={text => setSearchQuery(text)}
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
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => playTrack(item.track.uri)}>
                                <Text style={styles.playButtonText}>Play</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={togglePlayPause}>
                                <Text style={styles.playButtonText}>
                                    {isPlaying ? 'Continue' : 'Pause'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};
const styles = StyleSheet.create({
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
    songInfo: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 10,
    },
    trackText: {
        fontSize: 14,
        marginTop: 5,

    },
    playButton: {
        backgroundColor: '#1DB954',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
        marginTop: 5,

    },
    playButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    backToList:{
        color:'red',
        borderRadius: 2,

    }

})
export default MusicListScreen;