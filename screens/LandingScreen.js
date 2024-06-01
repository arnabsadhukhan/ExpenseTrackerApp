import React, { useLayoutEffect } from 'react'
import { Image, SafeAreaView, Text, View } from 'react-native'
import loadingGif from '../assets/loading.gif'
import { auth } from '../firebase'

function LandingScreen({ navigation }) {
    useLayoutEffect(() => {
        setTimeout(function () {
            if (auth.currentUser) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }]
                })
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }]
                })
            }
        }, 3000);
        auth.onAuthStateChanged((user) => {
            if (user) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }]
                })
            }
        })


    }, [])
    return (
        <SafeAreaView className="h-full bg-white">
            <Image style={{ objectFit: "contain", width: "100" }} source={loadingGif} />
            <View className="flex-row justify-center  px-2 mt-2">
                < Text className="font-bold text-md text-[#6c5ffd]"> Expense Tracker </ Text>
            </View>
        </SafeAreaView>
    )
}

export default LandingScreen