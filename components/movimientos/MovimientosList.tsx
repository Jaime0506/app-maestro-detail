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
import {
    Movimiento,
    getMovimientos,
    getMovimientosByClient,
    getMovimientosByType
} from '../../lib/firebase/factura';

interface MovimientosListProps {
    onMovimientoPress?: (movimiento: Movimiento) => void;
    showActions?: boolean;
}

export const MovimientosList: React.FC<MovimientosListProps> = ({
    onMovimientoPress,
    showActions = true,
}) => {
    const { showError, showSuccess } = useToast();
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState<'todos' | 'venta' | 'compra' | 'ajuste' | 'devolucion'>('todos');

    const loadMovimientos = useCallback(async () => {
        try {
            setLoading(true);
            let movimientosData: Movimiento[];

            if (searchText.trim()) {
                // Si hay texto de búsqueda, buscar por cliente
                movimientosData = await getMovimientosByClient(searchText.trim());
            } else {
                // Si no hay texto de búsqueda, usar filtro de tipo
                if (typeFilter === 'todos') {
                    movimientosData = await getMovimientos();
                } else {
                    movimientosData = await getMovimientosByType(typeFilter);
                }
            }

            setMovimientos(movimientosData);
        } catch {
            showError('No se pudieron cargar los movimientos');
        } finally {
            setLoading(false);
        }
    }, [searchText, typeFilter, showError]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadMovimientos();
        setRefreshing(false);
    };

    useEffect(() => {
        loadMovimientos();
    }, [loadMovimientos]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Sin fecha';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case 'venta':
                return '#4CAF50';
            case 'compra':
                return '#2196F3';
            case 'ajuste':
                return '#FF9800';
            case 'devolucion':
                return '#f44336';
            default:
                return '#666';
        }
    };

    const getTypeText = (tipo: string) => {
        switch (tipo) {
            case 'venta':
                return 'Venta';
            case 'compra':
                return 'Compra';
            case 'ajuste':
                return 'Ajuste';
            case 'devolucion':
                return 'Devolución';
            default:
                return tipo;
        }
    };

    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case 'venta':
                return '📈';
            case 'compra':
                return '📥';
            case 'ajuste':
                return '⚖️';
            case 'devolucion':
                return '↩️';
            default:
                return '📋';
        }
    };

    const renderMovimiento = ({ item }: { item: Movimiento }) => {
        return (
            <TouchableOpacity
                style={styles.movimientoCard}
                onPress={() => onMovimientoPress?.(item)}
                disabled={!onMovimientoPress}
            >
                <View style={styles.movimientoHeader}>
                    <View style={styles.movimientoInfo}>
                        <Text style={styles.movimientoTipo}>
                            {getTypeIcon(item.tipo)} {getTypeText(item.tipo)}
                        </Text>
                        <Text style={styles.movimientoFecha}>{formatDate(item.fecha)}</Text>
                    </View>
                    <View style={[
                        styles.typeBadge,
                        { backgroundColor: getTypeColor(item.tipo) }
                    ]}>
                        <Text style={styles.typeText}>
                            {getTypeText(item.tipo)}
                        </Text>
                    </View>
                </View>

                <View style={styles.movimientoDetails}>
                    <Text style={styles.clienteNombre}>
                        {item.clienteNombre || 'Sin cliente'}
                    </Text>
                    <Text style={styles.itemsCount}>
                        {item.items.length} producto{item.items.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                <View style={styles.movimientoFooter}>
                    <Text style={styles.descripcion} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                    <Text style={styles.totalAmount}>
                        ${item.total.toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {searchText.trim() || typeFilter !== 'todos'
                    ? 'No se encontraron movimientos con los filtros aplicados'
                    : 'No hay movimientos registrados'
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
                    placeholder="Buscar por cliente..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Filtros de tipo */}
            {/* <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        typeFilter === 'todos' && styles.filterButtonActive
                    ]}
                    onPress={() => setTypeFilter('todos')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        typeFilter === 'todos' && styles.filterButtonTextActive
                    ]}>
                        Todos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        typeFilter === 'venta' && styles.filterButtonActive
                    ]}
                    onPress={() => setTypeFilter('venta')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        typeFilter === 'venta' && styles.filterButtonTextActive
                    ]}>
                        Ventas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        typeFilter === 'compra' && styles.filterButtonActive
                    ]}
                    onPress={() => setTypeFilter('compra')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        typeFilter === 'compra' && styles.filterButtonTextActive
                    ]}>
                        Compras
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        typeFilter === 'ajuste' && styles.filterButtonActive
                    ]}
                    onPress={() => setTypeFilter('ajuste')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        typeFilter === 'ajuste' && styles.filterButtonTextActive
                    ]}>
                        Ajustes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        typeFilter === 'devolucion' && styles.filterButtonActive
                    ]}
                    onPress={() => setTypeFilter('devolucion')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        typeFilter === 'devolucion' && styles.filterButtonTextActive
                    ]}>
                        Devoluciones
                    </Text>
                </TouchableOpacity>
            </View> */}

            {/* Contenido principal */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Cargando movimientos...</Text>
                </View>
            ) : (
                <FlatList
                    data={movimientos}
                    renderItem={renderMovimiento}
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
        width: '100%',
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
        paddingHorizontal: 6,
        marginHorizontal: 2,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    movimientoCard: {
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
    movimientoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    movimientoInfo: {
        flex: 1,
        marginRight: 8,
    },
    movimientoTipo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    movimientoFecha: {
        fontSize: 14,
        color: '#666',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    movimientoDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clienteNombre: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    itemsCount: {
        fontSize: 14,
        color: '#666',
    },
    movimientoFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    descripcion: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginRight: 12,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
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
});

export default MovimientosList;
