import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useToast } from '../../contexts/ToastContext';
import { Producto, changeProductStatus, getProducts, getProductsWithFilters, updateProduct } from '../../lib/firebase/productos';

interface ProductListProps {
    onProductPress?: (producto: Producto) => void;
    onProductEdit?: (producto: Producto) => void;
    showActions?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
    onProductPress,
    onProductEdit,
    showActions = true,
}) => {
    const { showError, showSuccess } = useToast();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');

    // Estados para edición inline
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad: '',
    });
    const [savingProduct, setSavingProduct] = useState<string | null>(null);
    const [changingStatus, setChangingStatus] = useState<string | null>(null);

    const loadProductos = useCallback(async () => {
        try {
            setLoading(true);
            let productosData: Producto[];

            if (searchText.trim()) {
                // If there's search text, use combined filters
                productosData = await getProductsWithFilters({
                    nombre: searchText.trim(),
                    status: statusFilter === 'todos' ? undefined : statusFilter,
                });
            } else {
                // If no search text, use status filter
                if (statusFilter === 'todos') {
                    productosData = await getProducts();
                } else {
                    productosData = await getProductsWithFilters({
                        status: statusFilter,
                    });
                }
            }

            setProductos(productosData);
        } catch (error) {
            console.error('Error loading products:', error);
            showError('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    }, [searchText, statusFilter, showError]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadProductos();
        setRefreshing(false);
    };

    const handleStatusChange = async (product: Producto) => {
        try {
            const newStatus = product.status === 'activo' ? 'inactivo' : 'activo';

            // Activar loading
            setChangingStatus(product.id!);

            await changeProductStatus(product.id!, newStatus);

            // Update local state
            setProductos(prevProductos =>
                prevProductos.map(p =>
                    p.id === product.id ? { ...p, status: newStatus } : p
                )
            );

            showSuccess(
                `Producto ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`
            );
        } catch (error) {
            console.error('Error changing status:', error);
            showError('No se pudo cambiar el estado del producto');
        } finally {
            // Desactivar loading
            setChangingStatus(null);
        }
    };

    const startEditing = (product: Producto) => {
        setEditingProduct(product.id!);
        setEditForm({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio.toString(),
            cantidad: product.cantidad.toString(),
        });
    };

    const cancelEditing = () => {
        setEditingProduct(null);
        setEditForm({
            nombre: '',
            descripcion: '',
            precio: '',
            cantidad: '',
        });
    };

    const saveProduct = async (productId: string) => {
        try {
            // Validar campos
            if (!editForm.nombre.trim()) {
                showError('El nombre es requerido');
                return;
            }
            if (!editForm.descripcion.trim()) {
                showError('La descripción es requerida');
                return;
            }
            if (!editForm.precio.trim() || isNaN(Number(editForm.precio)) || Number(editForm.precio) < 0) {
                showError('El precio debe ser un número válido');
                return;
            }
            if (!editForm.cantidad.trim() || isNaN(Number(editForm.cantidad)) || Number(editForm.cantidad) < 0) {
                showError('La cantidad debe ser un número válido');
                return;
            }

            // Activar loading
            setSavingProduct(productId);

            // Actualizar producto
            await updateProduct(productId, {
                nombre: editForm.nombre.trim(),
                descripcion: editForm.descripcion.trim(),
                precio: Number(editForm.precio),
                cantidad: Number(editForm.cantidad),
            });

            // Actualizar estado local
            setProductos(prevProductos =>
                prevProductos.map(p =>
                    p.id === productId
                        ? {
                            ...p,
                            nombre: editForm.nombre.trim(),
                            descripcion: editForm.descripcion.trim(),
                            precio: Number(editForm.precio),
                            cantidad: Number(editForm.cantidad),
                        }
                        : p
                )
            );

            // Salir del modo edición
            cancelEditing();
            showSuccess('Producto actualizado correctamente');
        } catch (error) {
            console.error('Error saving product:', error);
            showError('No se pudo actualizar el producto');
        } finally {
            // Desactivar loading
            setSavingProduct(null);
        }
    };

    useEffect(() => {
        loadProductos();
    }, [loadProductos]);

    const renderProducto = ({ item }: { item: Producto }) => {
        const isEditing = editingProduct === item.id;
        const isSaving = savingProduct === item.id;
        const isChangingStatus = changingStatus === item.id;

        return (
            <View
                style={[
                    styles.productoCard,
                    isEditing && styles.editingCard
                ]}
            >
                <View style={styles.productoHeader}>
                    {isEditing ? (
                        <TextInput
                            style={styles.editInput}
                            value={editForm.nombre}
                            onChangeText={(text) => setEditForm(prev => ({ ...prev, nombre: text }))}
                            placeholder="Nombre del producto"
                        />
                    ) : (
                        <Text style={styles.productoNombre}>{item.nombre}</Text>
                    )}
                    <View style={[
                        styles.statusBadge,
                        item.status === 'activo' ? styles.statusActivo : styles.statusInactivo
                    ]}>
                        <Text style={styles.statusText}>
                            {item.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </Text>
                    </View>
                </View>

                {isEditing ? (
                    <TextInput
                        style={[styles.editInput, styles.editTextArea]}
                        value={editForm.descripcion}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, descripcion: text }))}
                        placeholder="Descripción del producto"
                        multiline
                        numberOfLines={2}
                    />
                ) : (
                    <Text style={styles.productoDescripcion} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                )}

                <View style={styles.productoInfo}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Precio:</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editInputSmall}
                                value={editForm.precio}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, precio: text }))}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        ) : (
                            <Text style={styles.infoValue}>${item.precio.toFixed(2)}</Text>
                        )}
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Cantidad:</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.editInputSmall}
                                value={editForm.cantidad}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, cantidad: text }))}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{item.cantidad}</Text>
                        )}
                    </View>
                </View>

                {showActions && (
                    <View style={styles.actionsContainer}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.saveButton,
                                        isSaving && styles.disabledButton
                                    ]}
                                    onPress={() => saveProduct(item.id!)}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <View style={styles.buttonLoadingContainer}>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={[styles.actionButtonText, styles.buttonLoadingText]}>
                                                Guardando...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.actionButtonText}>GUARDAR</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.cancelButton,
                                        isSaving && styles.disabledButton
                                    ]}
                                    onPress={cancelEditing}
                                    disabled={isSaving}
                                >
                                    <Text style={styles.actionButtonText}>✕</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => startEditing(item)}
                                >
                                    <Text style={styles.actionButtonText}>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        item.status === 'activo' ? styles.deactivateButton : styles.activateButton,
                                        isChangingStatus && styles.disabledButton
                                    ]}
                                    onPress={() => handleStatusChange(item)}
                                    disabled={isChangingStatus}
                                >
                                    {isChangingStatus ? (
                                        <View style={styles.buttonLoadingContainer}>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={[styles.actionButtonText, styles.buttonLoadingText]}>
                                                {item.status === 'activo' ? 'Desactivando...' : 'Activando...'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.actionButtonText}>
                                            {item.status === 'activo' ? 'Desactivar' : 'Activar'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {searchText.trim() || statusFilter !== 'todos'
                    ? 'No se encontraron productos con los filtros aplicados'
                    : 'No hay productos registrados'
                }
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar productos..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Filtros de estado */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        statusFilter === 'todos' && styles.filterButtonActive
                    ]}
                    onPress={() => setStatusFilter('todos')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        statusFilter === 'todos' && styles.filterButtonTextActive
                    ]}>
                        Todos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        statusFilter === 'activo' && styles.filterButtonActive
                    ]}
                    onPress={() => setStatusFilter('activo')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        statusFilter === 'activo' && styles.filterButtonTextActive
                    ]}>
                        Activos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        statusFilter === 'inactivo' && styles.filterButtonActive
                    ]}
                    onPress={() => setStatusFilter('inactivo')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        statusFilter === 'inactivo' && styles.filterButtonTextActive
                    ]}>
                        Inactivos
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            ) : (
                <FlatList
                    data={productos}
                    renderItem={renderProducto}
                    keyExtractor={(item) => item.id!}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    productoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productoInactivo: {
        opacity: 0.6,
    },
    productoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActivo: {
        backgroundColor: '#4CAF50',
    },
    statusInactivo: {
        backgroundColor: '#f44336',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productoDescripcion: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    productoInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    activateButton: {
        backgroundColor: '#4CAF50',
    },
    deactivateButton: {
        backgroundColor: '#f44336',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
    },
    // Estilos para edición
    editingCard: {
        borderWidth: 2,
        borderColor: '#007AFF',
        backgroundColor: '#f8f9ff',
    },
    editInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 16,
        backgroundColor: '#fff',
        flex: 1,
        marginRight: 8,
    },
    editTextArea: {
        minHeight: 60,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    editInputSmall: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 14,
        backgroundColor: '#fff',
        width: 80,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#f44336',
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

export default ProductList;
