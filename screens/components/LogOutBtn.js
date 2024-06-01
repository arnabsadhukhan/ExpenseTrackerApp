import React from 'react'
import { Alert, TouchableOpacity } from 'react-native';
import { auth, logOutUser } from '../../firebase';
import { AntDesign } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slice/appSlice';
import { useNavigation } from '@react-navigation/native';

function LogOutBtn() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => {
            logOutUser(auth).then(() => {
                dispatch(setUser(null))
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }]
                })
            }).catch((error) => {
                Alert.alert("Error Signing Out");
            });
        }}>
            <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity>
    )
}

export default LogOutBtn