import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClientCardProps {
    clienteNombre: string;
    onRemove: () => void;
}

export default function ClientCard({ clienteNombre, onRemove }: ClientCardProps) {
    return (
        <View style={styles.clientCard}>
            <View style={styles.clientCardContent}>
                <Ionicons name="person-circle" size={40} color="#007AFF" />
                <View style={styles.clientCardInfo}>
                    <Text style={styles.clientCardName}>{clienteNombre}</Text>
                </View>
                <TouchableOpacity
                    style={styles.removeClientButton}
                    onPress={onRemove}
                >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    clientCard: {
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
        padding: 16,
    },
    clientCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clientCardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    clientCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    removeClientButton: {
        padding: 4,
    },
});
