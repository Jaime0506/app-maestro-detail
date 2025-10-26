import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddProductButtonProps {
    onPress: () => void;
}

export default function AddProductButton({ onPress }: AddProductButtonProps) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity
                style={styles.addProductButton}
                onPress={onPress}
            >
                <Ionicons name="add-circle" size={20} color="#007AFF" />
                <Text style={styles.addProductText}>Agregar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    addProductButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#F0F8FF',
    },
    addProductText: {
        fontSize: 16,
        color: '#007AFF',
        marginLeft: 8,
    },
});
