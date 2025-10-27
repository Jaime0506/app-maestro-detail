import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Factura } from '../../lib/firebase/factura';

interface FacturaDetailModalProps {
    visible: boolean;
    factura: Factura | null;
    onClose: () => void;
    onStatusChange?: (factura: Factura) => void;
    changingStatus?: boolean;
}

export const FacturaDetailModal: React.FC<FacturaDetailModalProps> = ({
    visible,
    factura,
    onClose,
    onStatusChange,
    changingStatus = false,
}) => {
    if (!factura) return null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Sin fecha';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente':
                return '#FF9800';
            case 'pagada':
                return '#4CAF50';
            case 'cancelada':
                return '#f44336';
            default:
                return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pendiente':
                return 'Pendiente';
            case 'pagada':
                return 'Pagada';
            case 'cancelada':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const getNextStatusAction = (status: string) => {
        switch (status) {
            case 'pendiente':
                return 'Marcar como Pagada';
            case 'pagada':
                return 'Cancelar Factura';
            case 'cancelada':
                return 'Reactivar Factura';
            default:
                return 'Cambiar Estado';
        }
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={styles.productItem}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productoNombre}</Text>
                <Text style={styles.productDetails}>
                    Cantidad: {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.productSubtotal}>
                ${item.subtotal.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>Detalle de Factura</Text>
                            <Text style={styles.facturaId}>#{factura.id?.slice(-8) || 'N/A'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Información del Cliente */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cliente</Text>
                            <View style={styles.clientInfo}>
                                <Text style={styles.clientName}>{factura.clienteNombre}</Text>
                                <Text style={styles.clientId}>ID: {factura.clienteId}</Text>
                            </View>
                        </View>

                        {/* Información de la Factura */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información de la Factura</Text>
                            <View style={styles.facturaInfo}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Fecha:</Text>
                                    <Text style={styles.infoValue}>{formatDate(factura.fecha)}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Estado:</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(factura.status) }
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {getStatusText(factura.status)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Productos:</Text>
                                    <Text style={styles.infoValue}>{factura.items.length} items</Text>
                                </View>
                            </View>
                        </View>

                        {/* Lista de Productos */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Productos</Text>
                            <View style={styles.productsContainer}>
                                <FlatList
                                    data={factura.items}
                                    renderItem={renderProductItem}
                                    keyExtractor={(item, index) => `${item.productoId}-${index}`}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </View>

                        {/* Total */}
                        <View style={styles.totalSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalAmount}>
                                    ${factura.total.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer con Acciones */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.statusButton,
                                { backgroundColor: getStatusColor(factura.status) },
                                changingStatus && styles.disabledButton
                            ]}
                            onPress={() => onStatusChange?.(factura)}
                            disabled={changingStatus}
                        >
                            {changingStatus ? (
                                <View style={styles.buttonLoadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={[styles.actionButtonText, styles.buttonLoadingText]}>
                                        Cambiando...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.actionButtonText}>
                                    {getNextStatusAction(factura.status)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        maxWidth: 500,
        height: '85%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: 'white',
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    facturaId: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    clientInfo: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    clientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    clientId: {
        fontSize: 14,
        color: '#666',
    },
    facturaInfo: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    productsContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
        marginRight: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productDetails: {
        fontSize: 14,
        color: '#666',
    },
    productSubtotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    totalSection: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 12,
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        backgroundColor: 'white',
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusButton: {
        backgroundColor: '#007AFF',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLoadingText: {
        marginLeft: 8,
    },
});

export default FacturaDetailModal;
