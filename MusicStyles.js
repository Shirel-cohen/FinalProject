import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID = '74e458b48ee2421289c45b9a57aa3b25';
const REDIRECT_URI = 'https://open.spotify.com/search/';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

const MusicStyles = () => {
    const [token, setToken] = useState(null);
    const [searchKey, setSearchKey] = useState(null);
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        const handleDeepLink = async () => {
            const url = await Linking.getInitialURL();
            const hash = url.split('#')[1];

            if (hash) {
                const tokenParam = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
                setToken(tokenParam);
            }
        };

        const loadTokenFromStorage = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token'); // Load token from AsyncStorage
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

    const logout = () => {
        setToken(null);
        // Remove token from AsyncStorage or other storage mechanism here
    };

    const searchArtists = async () => {
        try {
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    q: searchKey,
                    type: 'artist',
                },
            });

            setArtists(response.data.artists.items);
        } catch (error) {
            console.error('Error searching artists:', error);
        }
    };

    const renderArtists = () => {
        return artists.map(artist => (
            <View key={artist.id}>
                {artist.images.length ? (
                    <Image style={{ width: '100%', height: 100 }} source={{ uri: artist.images[0].url }} />
                ) : (
                    <Text>No Image</Text>
                )}
                <Text>{artist.name}</Text>
            </View>
        ));
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Spotify React Native</Text>
            {!token ? (
                <TouchableOpacity onPress={() => Linking.openURL(`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`)}>
                    <Text>Login to Spotify</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={logout}>
                    <Text>Logout</Text>
                </TouchableOpacity>
            )}

            {token && (
                <View>
                    <TextInput
                        placeholder="Search for artists"
                        value={searchKey}
                        onChangeText={text => setSearchKey(text)}
                    />
                    <TouchableOpacity onPress={searchArtists}>
                        <Text>Search</Text>
                    </TouchableOpacity>
                </View>
            )}

            {renderArtists()}
        </View>
    );
};

export default MusicStyles;

