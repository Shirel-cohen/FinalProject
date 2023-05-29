import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
export default function GreetingsScreen() {
    return(
        <view style={styles.container}>

            <Text>hello</Text>
            <View style={styles.iconContainer}>
                <Icon name="camera" size={24} color="white" />
            </View>
        </view>
    )
}
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 100,
            backgroundColor: 'lightgray',
            alignItems: 'center',
            justifyContent: 'center',
        },

    });
