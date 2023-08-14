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
    const [searchKey, setSearchKey] = useState(null);
    const [artists, setArtists] = useState([]);
    // const [redirectURI, setRedirectURI] = useState("https://open.spotify.com/search/")

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

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token'); // Remove token from AsyncStorage
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
            {/*<Text>Spotify React Native</Text>*/}
            {!token ? (
                <>
                    <CustomButton text="Rock" redirectURI="https://open.spotify.com/genre/0JQ5DAqbMKFDXXwE9BDJAr" />
                    <CustomButton text="Pop" redirectURI="https://open.spotify.com/genre/0JQ5DAqbMKFEC4WFtoNRpw" />
                    <CustomButton text="Latine" redirectURI="https://open.spotify.com/genre/0JQ5DAqbMKFxXaXKP7zcDp" />
                    <CustomButton text="Concentration" redirectURI="https://open.spotify.com/genre/0JQ5DAqbMKFCbimwdOYlsl" />

                </>
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
const styles = StyleSheet.create({
    cloud: {
        borderRadius: 50,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        backgroundColor: '#cbd4e8',
        borderRadius: 50,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
export default MusicStyles;
