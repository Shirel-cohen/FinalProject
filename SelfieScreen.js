import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, ActivityIndicator, Alert, TouchableOpacity} from "react-native";
import { Camera } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";


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
    const [moodConfirmed, setMoodConfirmed] = useState(false);
    const [showLoadingAlert, setShowLoadingAlert] = useState(false);
    const [analyzingMood, setAnalyzingMood] = useState(false);
    const [cameraKey, setCameraKey] = useState(new Date().getTime());


    useEffect(() => {
        // Cleanup function to release camera resources when leaving the screen
        return () => {
            if (cameraRef.current) {
                cameraRef.current.release();
            }
        };
    }, []);

    useEffect(() => {
        if (analyzingMood) {
            setShowLoadingAlert(true);
        } else {
            setShowLoadingAlert(false);
        }
    }, [analyzingMood]);

    const cameraPermissionFunction =async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMediaLibraryPermission(
                mediaLibraryPermission.status === "granted"
            );
        };
        useEffect(() => {
            cameraPermissionFunction(); // Call the camera permission function initially

            // Navigation listener to set a new cameraKey when navigating to this screen
            const unsubscribe = navigation.addListener("focus", () => {
                cameraPermissionFunction(); // Call the camera permission function when the screen comes into focus
                setCameraKey(new Date().getTime()); // Change the key to remount the Camera component
            });

            return unsubscribe; // Cleanup listener when unmounting the component
        }, [navigation]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [5, 5],
                quality: 1,
            });

            if (!result.canceled && result.assets.length > 0) {
                setPhoto(result.assets[0]);

                // Analyze the mood in the selected image
                await analyzeMood(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking an image from the gallery:", error);
        }
    };

    const analyzeMood = async (imageUri) => {
        const apiUrl = "https://fd04-46-116-1-219.ngrok.io";
        const formData = new FormData();
        formData.append("image", {
            uri: imageUri,
            name: "image.jpg",
            type: "image/jpeg",
        });

        try {
            setAnalyzingMood(true); // Set analyzingMood to true while waiting for the result

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
                                setMoodConfirmed(true);
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
            setAnalyzingMood(false); // Set analyzingMood back to false when done
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
    const resetCamera = () => {
        setCameraKey(new Date().getTime());
        setCameraType(Camera.Constants.Type.front); // Reset camera type
    };
    let takePic = async () => {
        try {

            setAnalyzingMood(true);
            setShowLoadingAlert(true);

            let options = {
                quality: 1,
                base64: true,
                exif: false,
            };

            let newPhoto = await cameraRef.current.takePictureAsync(options);
            setPhoto(newPhoto);
            await analyzeMood(newPhoto.uri);
            resetCamera();
        } finally {
            setShowLoadingAlert(false);
            setAnalyzingMood(false);
        }
    };
    const resetStates = () => {
        // Reset your states here
        setPhoto(null);
        setMoodConfirmed(false);
        // Add other state resets as needed
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
                //  setPhoto(undefined);
            });
        };

        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.preview}
                    source={{ uri: photo.uri }}
                />

                {hasMediaLibraryPermission && moodConfirmed  ? (
                    <TouchableOpacity  onPress={saveAndNavigate} style={{backgroundColor:"#91a0b9",padding: 10}}>
                        <Text style={styles.buttonText}>Continue</Text></TouchableOpacity>


                ) : undefined}
                {moodConfirmed &&
                    <SafeAreaView>
                        <TouchableOpacity  onPress={sharePic} style={{backgroundColor:"#5372af",padding: 10}}>
                            <Text style={styles.buttonText}>Share</Text></TouchableOpacity>
                        <TouchableOpacity  onPress={() => setPhoto(undefined)} style={{backgroundColor:"#afc0e3",padding: 10}}>
                            <Text style={styles.buttonText}>Discard</Text></TouchableOpacity>
                    </SafeAreaView>
                }

                {showLoadingAlert && (
                    <View style={styles.loadingAlert}>
                        <ActivityIndicator size="large" color="#5372af" />
                    </View>
                )}

                <StatusBar style={"auto"} />
            </SafeAreaView>
        );
    }

    return (
        <Camera key={cameraKey} style={styles.container} ref={cameraRef} type={cameraType}>
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

            {!showLoadingAlert && (
                <TouchableOpacity
                    onPress={pickImage}
                    style={{ backgroundColor: "#5372af", padding: 10, borderRadius: 5 }}>
                    <Text style={styles.buttonText}>Pick from Gallery</Text>
                </TouchableOpacity>
            )}

            {analyzingMood && (
                <View style={styles.loadingAlert}>
                    <ActivityIndicator size="large" color="#5372af" />
                </View>
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
        fontFamily:'Lemon-Regular'
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
    buttonText: {
        fontFamily: 'Lemon-Regular', // Apply your custom font here
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
    },
    loadingAlert: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Background color with some opacity
    },
});