import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {Button, StyleSheet, Text, View, SafeAreaView, Image,} from "react-native";
import { Camera } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Font from 'expo-font';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";


export default function SelfieScreen() {
    const navigation = useNavigation();
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
    const [photo, setPhoto] = useState();
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [dominantEmotion, setDominantEmotion] = useState("");

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
                aspect: [5, 5], // You can adjust this aspect ratio as needed
                quality: 1,
            });

            if (!result.cancelled) {
                setPhoto(result);
                // Analyze the mood in the selected image
                await analyzeMood(result.assets[0].uri); // Use result.assets[0].uri
            }
        } catch (error) {
            console.error("Error picking an image from the gallery:", error);
        }
    };

    const analyzeMood = async (imageUri) => {
        const apiUrl = "https://feff-79-176-9-95.ngrok.io";
        const formData = new FormData();
        formData.append("image", {
            uri: imageUri,
            name: "image.jpg",
            type: "image/jpeg",
        });

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setDominantEmotion(response.data.mod);

            console.log(response.data.mod);
        } catch (error) {
            console.error("Error analyzing image:", error);
        }
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

    if (photo) {
        let sharePic = () => {
            shareAsync(photo.uri).then(() => {
                setPhoto(undefined);
            });
        };

        let savePic = async () => {
            MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
                setPhoto(undefined);
                console.log(dominantEmotion);
                navigation.navigate("MusicStyles", { mood: dominantEmotion });
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
                    <Button title={"Save"} onPress={savePic} color={"#91a0b9"} />
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
            <Button
                title={"Pick from Gallery"}
                onPress={pickImage}
                color={"#5372af"}
            />
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
