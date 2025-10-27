import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MovimientosList } from '../components/movimientos/MovimientosList';

export default function Movimientos() {
    return (
        <View style={styles.container}>
            <MovimientosList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});
