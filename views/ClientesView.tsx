import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ClientsList } from '../components/clients/ClientsList';
import { useToast } from '../contexts/ToastContext';
import { Cliente } from '../lib/firebase/clients';

export default function ClientesView() {
    const { showInfo } = useToast();

    const handleClientPress = (client: Cliente) => {
        // Here you can implement navigation to client details
        showInfo(`Has seleccionado: ${client.nombre}`);
    };

    const handleClientEdit = (client: Cliente) => {
        // Here you can implement navigation to edit modal
        showInfo(`Editando: ${client.nombre}`);
    };

    return (
        <View style={styles.container}>
            <ClientsList
                onClientPress={handleClientPress}
                onClientEdit={handleClientEdit}
                showActions={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
