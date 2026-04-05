import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CustomDatePicker({ value, onChange, show }) {
    if (!show) return null;

    return (
        <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={onChange}
        />
    );
}
