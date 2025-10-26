import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacturaItem } from '../../lib/firebase/factura';

interface ProductListProps {
    items: FacturaItem[];
    onUpdateQuantity: (productoId: string, cantidad: number) => void;
    onRemoveItem: (productoId: string) => void;
}

export default function ProductList({ items, onUpdateQuantity, onRemoveItem }: ProductListProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {items.map((item, index) => (
                <View key={`${item.productoId}-${index}`} style={styles.productCard}>
                    <View style={styles.productCardContent}>
                        <Ionicons name="cube" size={30} color="#007AFF" />
                        <View style={styles.productCardInfo}>
                            <Text style={styles.productCardName}>{item.productoNombre}</Text>
                            <Text style={styles.productCardPrice}>${item.precioUnitario.toFixed(2)} c/u</Text>
                        </View>
                        <View style={styles.productCardActions}>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => onUpdateQuantity(item.productoId, item.cantidad - 1)}
                                >
                                    <Ionicons name="remove" size={16} color="#666" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.cantidad}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => onUpdateQuantity(item.productoId, item.cantidad + 1)}
                                >
                                    <Ionicons name="add" size={16} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.removeProductButton}
                                onPress={() => onRemoveItem(item.productoId)}
                            >
                                <Ionicons name="trash" size={18} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.productCardSubtotal}>
                        <Text style={styles.subtotalLabel}>Subtotal:</Text>
                        <Text style={styles.subtotalAmount}>${item.subtotal.toFixed(2)}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    productCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        padding: 16,
        marginBottom: 12,
    },
    productCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productCardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productCardPrice: {
        fontSize: 14,
        color: '#666',
    },
    productCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 12,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    removeProductButton: {
        padding: 8,
        backgroundColor: '#FFE5E5',
        borderRadius: 20,
    },
    productCardSubtotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    subtotalLabel: {
        fontSize: 14,
        color: '#666',
    },
    subtotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
});
