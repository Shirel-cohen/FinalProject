import React from "react";
import { View, Text , StyleSheet} from "react-native";

const MusicStyles = () => {
    return (
        <View >
            <Text style={styles.text}>Rock</Text>
            <Text style={styles.text}>Pop</Text>
            <Text style={styles.text}>Classic</Text>
            <Text style={styles.text}>Hip-Hop</Text>
            <Text style={styles.text}>Country</Text>
            <Text style={styles.text}>electronic</Text>

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