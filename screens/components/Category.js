import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Button, View, Text, TouchableOpacity } from 'react-native'


function Category({ categoryName, amountVisible, amount, onPressCategory }) {
    return (

        <View className="bg-[#1D267D] p-4 my-2" style={{ borderRadius: 20 }}>
            <View className="flex-row justify-center items-center p-2">

                <MaterialIcons name="account-balance" size={24} color="white" />
                < Text className=" text-2xl text-white font-extrabold pl-1 " >
                    {categoryName}
                </ Text>
            </View>
            {amountVisible ? (
                <Button className="" style={{ borderRadius: 50, width: "50%" }}
                    onPress={onPressCategory}
                    title={amount}
                    color="#5C469C"
                />) : (
                <View className="flex items-center">
                    <Feather name="eye-off" size={24} color="white" />
                </View>
            )}

        </View>
    )
}

export default Category