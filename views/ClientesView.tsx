import { StyleSheet, Text, View } from 'react-native';

export default function Clientes() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clientes</Text>
            <Text style={styles.subtitle}>Gestiona tu lista de clientes</Text>
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
