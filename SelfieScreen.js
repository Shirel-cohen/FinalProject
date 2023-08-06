
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {Button,StyleSheet,Text,View,SafeAreaView,Image} from "react-native";
import { Camera } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Ionicons, MaterialCommunityIcons  } from "@expo/vector-icons"; // Import the Ionicons icon library
import { useNavigation } from "@react-navigation/native";

import MusicStyles from "./MusicStyles";

export default function SelfieScreen() {
    const navigation = useNavigation();
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
        useState();
    const [photo, setPhoto] = useState();
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
        })();
    }, []);

    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission...</Text>;
    } else if (!hasCameraPermission) {
        return (
            <Text>
                Permission for camera not granted. Please change this in settings.
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

        // let savePic = () => {
        //     MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        //         setPhoto(undefined);
        //     });
        //
        // };
        let savePic = async () => {
            MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
                setPhoto(undefined);
                navigation.navigate("MusicStyles"); // Navigate to the PhotoSavedScreen after saving the photo
            });
        };

        return (
            <SafeAreaView style={styles.container} >
                <Image
                    style={styles.preview}
                    source={{ uri: "data:image/jpg;base64," + photo.base64 }}
                />

                    <Button title={"Share"} onPress={sharePic} color={"#5372af"}  />
                    {hasMediaLibraryPermission ? (
                        <Button title={"Save"} onPress={savePic} color={"#91a0b9"} />
                    ) : undefined}
                    <Button title={"Discard"} onPress={() => setPhoto(undefined)} color={"#afc0e3"} />

            </SafeAreaView>
        );
    }


    return (
            <Camera style={styles.container} ref={cameraRef} type={cameraType}>
            <View style={styles.buttonContainer} >
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