import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View, SafeAreaView, Image, ActivityIndicator, Alert } from "react-native";
import { Camera } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


export default function SelfieScreen() {
    const navigation = useNavigation();
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
    const [photo, setPhoto] = useState();
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [dominantEmotion, setDominantEmotion] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmedMood, setConfirmedMood] = useState(null); // Add a state to track the confirmed mood

    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMediaLibraryPermission(
                mediaLibraryPermission.status === "granted"
            );
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [5, 5],
                quality: 1,
            });

            if (!result.canceled) {
                setPhoto(result);

                // Analyze the mood in the selected image
                const selectedAssets = result.assets;
                if (selectedAssets.length > 0) {
                    // await analyzeMood(selectedAssets[0]?.uri || selectedAssets[0]?.localUri || selectedAssets[0]?.fileUri);
                    await analyzeMood(selectedAssets[0]?.uri || selectedAssets[0]?.localUri || selectedAssets[0]?.fileUri);
                }
            }
        } catch (error) {
            console.error("Error picking an image from the gallery:", error);
        }
    };
    const analyzeMood = async (imageUri) => {
        const apiUrl = " https://9430-46-116-1-219.ngrok.io";
        const formData = new FormData();
        formData.append("image", {
            uri: imageUri,
            name: "image.jpg",
            type: "image/jpeg",
        });

        try {
            setLoading(true); // Set loading state to true while waiting for the result
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.mod === undefined) {
                alert("We cannot recognize your emotion. Please try again.");
                setPhoto(undefined);
            } else {
                setDominantEmotion(response.data.mod);
                console.log(response.data.mod);
                setConfirmedMood(response.data.mod);

                // Ask the user to confirm the detected mood
                Alert.alert(
                    "Analysis Complete",
                    `Is this your mood: ${response.data.mod}?`,
                    [
                        {
                            text: "Yes",
                            onPress: () => {
                                // User confirmed, proceed to save and navigate to the next screen

                                // Alert.alert("Mood Confirmed", "You can continue using the app.");
                            },
                        },
                        {
                            text: "No",
                            onPress: () => {
                                // User didn't confirm, reset the photo and allow taking a new picture
                                setPhoto(undefined);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.error("Error analyzing image:", error);
        } finally {
            setLoading(false); // Set loading state back to false when done
        }
    };

    const saveAndNavigate = async () => {
        try {
            // Check if confirmedMood is set, and then save the photo
            if (confirmedMood) {
                await MediaLibrary.saveToLibraryAsync(photo.uri);
                setPhoto(undefined);
                navigation.navigate("MusicStyles", { mood: confirmedMood });
            } else {
                console.error("Confirmed mood is not set.");
            }
        } catch (error) {
            console.error("Error saving image to library:", error);
        }
    };

    let takePic = async () => {
        let options = {
            quality: 1,
            base64: true,
            exif: false,
        };

        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
        // Analyze the mood in the taken picture
        await analyzeMood(newPhoto.uri);
    };

    let toggleCamera = () => {
        setCameraType(
            cameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission...</Text>;
    } else if (!hasCameraPermission) {
        return (
            <Text>
                Permission for the camera not granted. Please change this in settings.
            </Text>
        );
    }

    if (photo) {
        let sharePic = () => {
            shareAsync(photo.uri).then(() => {
                setPhoto(undefined);
            });
        };

        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.preview}
                    source={{ uri: photo.uri }}
                />


                <Button title={"Share"} onPress={sharePic} color={"#5372af"} />
                {hasMediaLibraryPermission ? (
                    <Button title={"Save"} onPress={saveAndNavigate} color={"#91a0b9"} />
                ) : undefined}
                <Button
                    title={"Discard"}
                    onPress={() => setPhoto(undefined)}
                    color={"#afc0e3"}
                />
            </SafeAreaView>
        );
    }

    return (
        <Camera style={styles.container} ref={cameraRef} type={cameraType}>
            <View style={styles.buttonContainer}>
                <View style={styles.iconButton}>
                    <Ionicons
                        name="camera"
                        size={32}
                        color="#000"
                        onPress={takePic}
                    />
                </View>
                <View style={styles.iconButton}>
                    <MaterialCommunityIcons
                        name="refresh"
                        size={32}
                        color="#000"
                        onPress={toggleCamera}
                    />
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#5372af" />
            ) : (
                <Button
                    title={"Pick from Gallery"}
                    onPress={pickImage}
                    color={"#5372af"}
                />
            )}
            <StatusBar style={"auto"} />
        </Camera>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "center",
    },
    buttonContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "column",
        flex: 1,
    },
    iconButton: {
        flexDirection: "row",
        margin: 18,
        borderRadius: 30,
        padding: 18,
        backgroundColor: "#f0f0f0",
    },
    preview: {
        alignSelf: "stretch",
        flex: 1,
    },
});
