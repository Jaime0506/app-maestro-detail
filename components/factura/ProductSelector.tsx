import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Producto } from '../../lib/firebase/productos';

interface ProductSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelectProduct: (producto: Producto, cantidad: number) => void;
    productos: Producto[];
    loading: boolean;
}

export default function ProductSelector({
    visible,
    onClose,
    onSelectProduct,
    productos,
    loading
}: ProductSelectorProps) {
    const [selectedQuantity, setSelectedQuantity] = useState('1');

    const handleSelectProduct = (producto: Producto) => {
        const cantidad = parseInt(selectedQuantity) || 1;
        onSelectProduct(producto, cantidad);
        setSelectedQuantity('1');
    };

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
                        <Text style={styles.selectorTitle}>Seleccionar Producto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.quantitySelector}>
                        <Text style={styles.quantityLabel}>Cantidad:</Text>
                        <TextInput
                            style={styles.quantityInput}
                            value={selectedQuantity}
                            onChangeText={setSelectedQuantity}
                            keyboardType="numeric"
                            placeholder="1"
                        />
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Cargando productos...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={productos}
                            keyExtractor={(item) => item.id!}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.productSelectorItem}
                                    onPress={() => handleSelectProduct(item)}
                                >
                                    <View style={styles.productSelectorContent}>
                                        <Ionicons name="cube" size={30} color="#007AFF" />
                                        <View style={styles.productSelectorInfo}>
                                            <Text style={styles.productSelectorName}>{item.nombre}</Text>
                                            <Text style={styles.productSelectorDescription}>{item.descripcion}</Text>
                                            <Text style={styles.productSelectorStock}>📦 Stock: {item.cantidad}</Text>
                                        </View>
                                        <View style={styles.productSelectorPrice}>
                                            <Text style={styles.productSelectorPriceText}>${item.precio.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>No hay productos disponibles</Text>
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
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    quantityLabel: {
        fontSize: 16,
        color: '#333',
        marginRight: 12,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        width: 80,
        textAlign: 'center',
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
    productSelectorItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    productSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productSelectorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productSelectorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productSelectorDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    productSelectorStock: {
        fontSize: 12,
        color: '#007AFF',
    },
    productSelectorPrice: {
        alignItems: 'flex-end',
    },
    productSelectorPriceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 40,
    },
});
