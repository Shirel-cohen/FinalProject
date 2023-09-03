import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const MusicListScreen = ({ route, navigation }) => {
    const { mood, selectedStyle, tracks, playTrack } = route.params;

    return (
        <View>
            <Text>Selected Mood: {mood}</Text>
            <Text>Selected Style: {selectedStyle}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backToList}>Go Back to Music Styles</Text>
            </TouchableOpacity>
            <FlatList
                style={styles.trackContainer}
                data={tracks}
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
