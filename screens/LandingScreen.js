import React, { useLayoutEffect } from 'react'
import { Image, SafeAreaView, Text, View } from 'react-native'
import loadingGif from '../assets/loading.gif'
import { useDispatch } from 'react-redux';

function LandingScreen({ navigation }) {
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        setTimeout(function () {
            // if (auth.currentUser) {
            //     console.log("auth 2",auth);
            //     // dispatch(setUser(auth.currentUser.uid));
            //     navigation.reset({
            //         index: 0,
            //         routes: [{ name: "Home" }]
            //     })
            // } else {
            //     console.log("auth 3",auth);
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }]
                })
            // }
        }, 1000);
        // auth.onAuthStateChanged((user) => {
        //     console.log("auth 4",auth);
        //     if (user) {
        //         console.log("auth 5",user);
        //         // dispatch(setUser(user.uid));
        //         navigation.reset({
        //             index: 0,
        //             routes: [{ name: "Home" }]
        //         })
        //     }
        // })


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