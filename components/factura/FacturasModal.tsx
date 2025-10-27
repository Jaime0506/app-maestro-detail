import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../contexts/ToastContext';
import { useFacturaForm } from '../../hooks/useFacturaForm';
import { Cliente, getActiveClients } from '../../lib/firebase/clients';
import { getActiveProducts, Producto } from '../../lib/firebase/productos';
import AddProductButton from './AddProductButton';
import ClientCard from './ClientCard';
import ClientSelector from './ClientSelector';
import ClientSelectorButton from './ClientSelectorButton';
import ProductSelector from './ProductSelector';
import TotalSection from './TotalSection';

interface FacturasModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function FacturasModal({ visible, onClose }: FacturasModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [showClientSelector, setShowClientSelector] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [selectedProductQuantity, setSelectedProductQuantity] = useState('1');

    const {
        formData,
        errors,
        setCliente,
        addProducto,
        updateItemQuantity,
        removeItem,
        handleCrear,
        resetForm
    } = useFacturaForm();

    const { showSuccess, showError } = useToast();

    const loadData = useCallback(async () => {
        try {
            setLoadingData(true);
            console.log('Loading data...');
            const [clientesData, productosData] = await Promise.all([
                getActiveClients(),
                getActiveProducts()
            ]);
            console.log('Clientes loaded:', clientesData.length);
            console.log('Productos loaded:', productosData.length);
            setClientes(clientesData);
            setProductos(productosData);
        } catch (error) {
            console.error('Error loading data:', error);
            showError('Error al cargar los datos');
        } finally {
            setLoadingData(false);
        }
    }, [showError]);

    const handleCrearFactura = async () => {
        console.log('🔴 handleCrearFactura llamado!', { isLoading, itemsLength: formData.items.length, clienteId: formData.clienteId });

        if (isLoading) {
            console.log('🔴 Ya está cargando, ignorando...');
            return;
        }

        console.log('🔴 Iniciando proceso de creación de factura...');
        setIsLoading(true);
        try {
            await handleCrear(() => {
                console.log('✅ Factura creada exitosamente');
                // Cerrar el modal primero
                onClose();
                // Mostrar toast después de un pequeño delay
                setTimeout(() => {
                    showSuccess('¡Factura creada correctamente!');
                }, 300);
            });
        } catch (error) {
            console.error('❌ Error al crear factura:', error);

            // Mostrar mensaje de error específico
            let errorMessage = 'No se pudo crear la factura';

            if (error instanceof Error) {
                if (error.message.includes('Stock insuficiente')) {
                    errorMessage = 'Stock insuficiente para algunos productos';
                } else if (error.message.includes('Debe seleccionar')) {
                    errorMessage = 'Debe seleccionar un cliente';
                } else if (error.message.includes('Debe agregar')) {
                    errorMessage = 'Debe agregar al menos un producto';
                } else if (error.message.includes('total calculado')) {
                    errorMessage = 'Error en el cálculo del total';
                } else {
                    errorMessage = error.message;
                }
            }

            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectClient = (cliente: Cliente) => {
        setCliente(cliente);
        setShowClientSelector(false);
    };

    const handleSelectProduct = (producto: Producto) => {
        const cantidad = parseInt(selectedProductQuantity) || 1;
        addProducto(producto, cantidad);
        setSelectedProductQuantity('1');
        setShowProductSelector(false);
    };

    const handleRemoveClient = () => {
        setCliente({
            id: '',
            nombre: '',
            direccion: '',
            telefono: '',
            status: 'activo',
            created_at: Timestamp.now(),
            updated_at: Timestamp.now()
        });
    };

    const handleClose = () => {
        resetForm();
        setShowClientSelector(false);
        setShowProductSelector(false);
        setSelectedProductQuantity('1');
        onClose();
    };

    // Crear datos para FlatList (incluyendo el botón)
    const renderContentData = [
        { type: 'client', id: 'client-section' },
        { type: 'products-header', id: 'products-header' },
        ...formData.items.map((item, index) => ({ type: 'product', id: `product-${item.productoId}-${index}`, data: item })),
        { type: 'total', id: 'total-section' },
        { type: 'button', id: 'create-button' },
    ];

    const renderContentItem = ({ item }: { item: any }) => {
        switch (item.type) {
            case 'client':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cliente *</Text>
                        {formData.clienteId ? (
                            <ClientCard
                                clienteNombre={formData.clienteNombre}
                                onRemove={handleRemoveClient}
                            />
                        ) : (
                            <ClientSelectorButton
                                onPress={() => setShowClientSelector(true)}
                                hasError={!!errors.cliente}
                            />
                        )}
                        {errors.cliente && <Text style={styles.errorText}>{errors.cliente}</Text>}
                    </View>
                );
            case 'products-header':
                return (
                    <View style={styles.section}>
                        <AddProductButton onPress={() => setShowProductSelector(true)} />
                        {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}
                    </View>
                );
            case 'product':
                const productItem = item.data;
                return (
                    <View style={styles.productCard}>
                        <View style={styles.productCardContent}>
                            <Ionicons name="cube" size={30} color="#007AFF" />
                            <View style={styles.productCardInfo}>
                                <Text style={styles.productCardName}>{productItem.productoNombre}</Text>
                                <Text style={styles.productCardPrice}>${productItem.precioUnitario.toFixed(2)} c/u</Text>
                            </View>
                            <View style={styles.productCardActions}>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateItemQuantity(productItem.productoId, productItem.cantidad - 1)}
                                    >
                                        <Ionicons name="remove" size={16} color="#666" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{productItem.cantidad}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateItemQuantity(productItem.productoId, productItem.cantidad + 1)}
                                    >
                                        <Ionicons name="add" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeProductButton}
                                    onPress={() => removeItem(productItem.productoId)}
                                >
                                    <Ionicons name="trash" size={18} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.productCardSubtotal}>
                            <Text style={styles.subtotalLabel}>Subtotal:</Text>
                            <Text style={styles.subtotalAmount}>${productItem.subtotal.toFixed(2)}</Text>
                        </View>
                    </View>
                );
            case 'total':
                return formData.items.length > 0 ? (
                    <TotalSection total={formData.total} />
                ) : null;

            default:
                return null;
        }
    };

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible, loadData]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nueva Factura</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={renderContentData.filter(item => item.type !== 'button')} // QUITAR EL BOTÓN
                        renderItem={renderContentItem}
                        keyExtractor={(item) => item.id}
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                        scrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    />

                </View>
            </View>

            {/* Botón súper simple sin estilos conflictivos */}
            <View style={{ alignItems: 'center', backgroundColor: 'red', width: '100%', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        left: '12.5%',
                        backgroundColor: isLoading ? '#A0A0A0' : '#007AFF',
                        padding: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        width: '75%',
                        opacity: isLoading ? 0.7 : 1,
                    }}
                    onPress={() => {
                        console.log('🔴 BOTÓN SÚPER SIMPLE PRESIONADO!');
                        handleCrearFactura();
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                Procesando...
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            Generar Venta
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modales de selección */}
            <ClientSelector
                visible={showClientSelector}
                onClose={() => setShowClientSelector(false)}
                onSelectClient={handleSelectClient}
                clientes={clientes}
                loading={loadingData}
            />

            <ProductSelector
                visible={showProductSelector}
                onClose={() => setShowProductSelector(false)}
                onSelectProduct={handleSelectProduct}
                productos={productos}
                loading={loadingData}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        // QUITAR: pointerEvents: 'box-none',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        maxWidth: 450,
        height: '85%',
        overflow: 'hidden', // Cambiar de 'visible' a 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: 'white', // Asegurar fondo blanco
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 20, // Reducir padding bottom
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        marginTop: 8,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
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
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
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
    productPrice: {
        fontSize: 14,
        color: '#666',
    },
    productDescription: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    productStock: {
        fontSize: 12,
        color: '#007AFF',
    },
    productActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    createButtonDisabled: {
        backgroundColor: '#CCCCCC', // Cambiar color
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    // Estilos para cards de productos
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
