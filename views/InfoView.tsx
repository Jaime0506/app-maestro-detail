import { StyleSheet, Text, View } from 'react-native';

export default function Info() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Información</Text>
            <Text style={styles.subtitle}>Configuración y datos de la aplicación</Text>
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
