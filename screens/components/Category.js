import { Feather, FontAwesome5, Fontisto, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

function Category({ category, amountVisible, amount, onPressCategory, index }) {
    let cardColors = [
        '#ffddc2',
        '#cbefef',
        '#e6e8fd',
        '#ffebd9',
        '#dff7f7',
        '#eef0fe',
        '#ffd7c5',
        '#d1eeee',
        '#e4e5fa',
        '#f8f8f8',
        '#e0e0e0',
        '#b0b0b0',
        '#ffead3',
        '#d8f5f5',
        '#ebedff'
    ]

    let cardColor = cardColors[index % cardColors.length]

    return (
        <TouchableOpacity onPress={onPressCategory} >
            <View className=" h-[150] my-1" style={{ borderRadius: 20, backgroundColor: cardColor }} >
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Fontisto name="visa" size={24} color="black" />
                    <MaterialIcons name="wifi" size={24} color="black" />
                </View>
                <View className="flex-row items-center justify-between px-4">
                    < Text className=" text-xl font-semibold text-[#200b06] " >
                        {category}
                    </ Text>
                </View>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <View>
                        <Text className="text-[#9b7b62]">Amount</Text>
                        {amountVisible ? (<Text className="text-[#110100] font-bold"> {amount}</Text>) : (
                            <View className="ml-3">
                                <Feather name="eye-off" size={24} color="#110100" />
                            </View>
                        )}
                    </View>
                    <FontAwesome5 name="sim-card" size={24} color="black" />
                </View>

            </View>
        </TouchableOpacity >
    )
}

export default Category