import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cliente } from '../../lib/firebase/clients';

interface ClientSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelectClient: (cliente: Cliente) => void;
    clientes: Cliente[];
    loading: boolean;
}

export default function ClientSelector({
    visible,
    onClose,
    onSelectClient,
    clientes,
    loading
}: ClientSelectorProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.selectorModal}>
                    <View style={styles.selectorHeader}>
                        <Text style={styles.selectorTitle}>Seleccionar Cliente</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Cargando clientes...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={clientes}
                            keyExtractor={(item) => item.id!}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.clientItem}
                                    onPress={() => onSelectClient(item)}
                                >
                                    <View style={styles.clientItemContent}>
                                        <Ionicons name="person-circle" size={40} color="#007AFF" />
                                        <View style={styles.clientInfo}>
                                            <Text style={styles.clientName}>{item.nombre}</Text>
                                            {item.telefono && <Text style={styles.clientPhone}>📞 {item.telefono}</Text>}
                                            {item.direccion && <Text style={styles.clientAddress}>📍 {item.direccion}</Text>}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>No hay clientes disponibles</Text>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    selectorModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    selectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    selectorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    clientItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    clientItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clientInfo: {
        flex: 1,
        marginLeft: 12,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    clientPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    clientAddress: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 40,
    },
});
