import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClientSelectorButtonProps {
    onPress: () => void;
    hasError?: boolean;
}

export default function ClientSelectorButton({ onPress, hasError }: ClientSelectorButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.selectorButton, hasError && styles.selectorButtonError]}
            onPress={onPress}
        >
            <View style={styles.selectorContent}>
                <Ionicons name="person-add" size={20} color="#666" />
                <Text style={[styles.selectorText, styles.placeholderText]}>
                    Seleccionar cliente
                </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
    },
    selectorButtonError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    placeholderText: {
        color: '#999',
    },
});
