import React from 'react';
import { View, TextInput } from 'react-native';

export default function CustomDatePicker({ value, onChange, show }) {
    if (!show) return null;
    
    return (
        <View style={{ marginTop: 10 }}>
            <TextInput
                // Using standard web type if available, otherwise just text
                type="date"
                style={{ 
                    borderWidth: 1, 
                    borderRadius: 12, 
                    paddingHorizontal: 15, 
                    height: 55, 
                    fontSize: 16,
                    backgroundColor: '#1C1C1E', // Default dark 
                    color: '#FFF'
                }}
                value={value.toISOString().split('T')[0]}
                onChangeText={(val) => {
                    const newDate = new Date(val);
                    if (!isNaN(newDate.getTime())) {
                        onChange(null, newDate);
                    }
                }}
            />
        </View>
    );
}
