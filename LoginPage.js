import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Perform login logic here
        if (username.length >0 && password.length>0) {
            Alert.alert('Login Successful');


        } else {
            Alert.alert('Invalid Credentials');
        }
        // Clear input fields
        setUsername('');
        setPassword('');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={text => setUsername(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={text => setPassword(text)}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    input: {
        width: '30%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        paddingHorizontal: 10,
    },
});
