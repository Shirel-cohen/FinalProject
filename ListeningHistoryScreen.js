import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListeningHistoryScreen = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Retrieve listening history from AsyncStorage
        retrieveListeningHistory();
    }, []);

    const retrieveListeningHistory = async () => {
        try {
            const storedHistory = await AsyncStorage.getItem('listeningHistory');
            if (storedHistory) {
                // Parse the stored JSON data into an array
                const parsedHistory = JSON.parse(storedHistory);
                setHistory(parsedHistory);
            }
        } catch (error) {
            console.error('Error retrieving listening history:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Listening History</Text>
            {history.length > 0 ? (
                <FlatList
                    data={history}
                    keyExtractor={(item, index) => `history-item-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.historyItem}>
                            <Text style={styles.trackName}>{item.trackName}</Text>
                            <Text style={styles.artistName}>{item.artistName}</Text>
                            <Text style={styles.timestamp}>{item.timestamp}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyHistory}>Your listening history is empty.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    historyItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingVertical: 8,
    },
    trackName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    artistName: {
        fontSize: 14,
        color: '#666666',
    },
    timestamp: {
        fontSize: 12,
        color: '#999999',
    },
    emptyHistory: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
});

export default ListeningHistoryScreen;
