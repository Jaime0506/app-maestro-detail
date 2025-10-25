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
import { Cliente, changeClientStatus, getClients, getClientsWithFilters, updateClient } from '../../lib/firebase/clients';

interface ClientsListProps {
    onClientPress?: (cliente: Cliente) => void;
    onClientEdit?: (cliente: Cliente) => void;
    showActions?: boolean;
}

export const ClientsList: React.FC<ClientsListProps> = ({
    onClientPress,
    onClientEdit,
    showActions = true,
}) => {
    const { showError, showSuccess } = useToast();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');

    // Estados para edición inline
    const [editingClient, setEditingClient] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
    });
    const [savingClient, setSavingClient] = useState<string | null>(null);
    const [changingStatus, setChangingStatus] = useState<string | null>(null);

    const loadClientes = useCallback(async () => {
        try {
            setLoading(true);
            let clientesData: Cliente[];

            if (searchText.trim()) {
                // If there's search text, use combined filters
                clientesData = await getClientsWithFilters({
                    nombre: searchText.trim(),
                    status: statusFilter === 'todos' ? undefined : statusFilter,
                });
            } else {
                // If no search text, use status filter
                if (statusFilter === 'todos') {
                    clientesData = await getClients();
                } else {
                    clientesData = await getClientsWithFilters({
                        status: statusFilter,
                    });
                }
            }

            setClientes(clientesData);
        } catch (error) {
            console.error('Error loading clients:', error);
            showError('No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
    }, [searchText, statusFilter, showError]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadClientes();
        setRefreshing(false);
    };

    const handleStatusChange = async (client: Cliente) => {
        try {
            const newStatus = client.status === 'activo' ? 'inactivo' : 'activo';

            // Activar loading
            setChangingStatus(client.id!);

            await changeClientStatus(client.id!, newStatus);

            // Update local state
            setClientes(prevClientes =>
                prevClientes.map(c =>
                    c.id === client.id ? { ...c, status: newStatus } : c
                )
            );

            showSuccess(
                `Cliente ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`
            );
        } catch (error) {
            console.error('Error changing status:', error);
            showError('No se pudo cambiar el estado del cliente');
        } finally {
            // Desactivar loading
            setChangingStatus(null);
        }
    };

    const startEditing = (client: Cliente) => {
        setEditingClient(client.id!);
        setEditForm({
            nombre: client.nombre,
            direccion: client.direccion,
            telefono: client.telefono,
        });
    };

    const cancelEditing = () => {
        setEditingClient(null);
        setEditForm({
            nombre: '',
            direccion: '',
            telefono: '',
        });
    };

    const saveClient = async (clientId: string) => {
        try {
            // Validar campos
            if (!editForm.nombre.trim()) {
                showError('El nombre es requerido');
                return;
            }

            // Activar loading
            setSavingClient(clientId);

            // Actualizar cliente
            await updateClient(clientId, {
                nombre: editForm.nombre.trim(),
                direccion: editForm.direccion.trim(),
                telefono: editForm.telefono.trim(),
            });

            // Actualizar estado local
            setClientes(prevClientes =>
                prevClientes.map(c =>
                    c.id === clientId
                        ? {
                            ...c,
                            nombre: editForm.nombre.trim(),
                            direccion: editForm.direccion.trim(),
                            telefono: editForm.telefono.trim(),
                        }
                        : c
                )
            );

            // Salir del modo edición
            cancelEditing();
            showSuccess('Cliente actualizado correctamente');
        } catch (error) {
            console.error('Error saving client:', error);
            showError('No se pudo actualizar el cliente');
        } finally {
            // Desactivar loading
            setSavingClient(null);
        }
    };

    useEffect(() => {
        loadClientes();
    }, [loadClientes]);

    const renderCliente = ({ item }: { item: Cliente }) => {
        const isEditing = editingClient === item.id;
        const isSaving = savingClient === item.id;
        const isChangingStatus = changingStatus === item.id;

        return (
            <View
                style={[
                    styles.clienteCard,
                    isEditing && styles.editingCard
                ]}
            >
                <View style={styles.clienteHeader}>
                    {isEditing ? (
                        <TextInput
                            style={styles.editInput}
                            value={editForm.nombre}
                            onChangeText={(text) => setEditForm(prev => ({ ...prev, nombre: text }))}
                            placeholder="Nombre del cliente"
                        />
                    ) : (
                        <Text style={styles.clienteNombre}>{item.nombre}</Text>
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
                        value={editForm.direccion}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, direccion: text }))}
                        placeholder="Dirección del cliente"
                        multiline
                        numberOfLines={2}
                    />
                ) : (
                    item.direccion ? (
                        <Text style={styles.clienteDireccion} numberOfLines={2}>
                            📍 {item.direccion}
                        </Text>
                    ) : null
                )}

                {isEditing ? (
                    <TextInput
                        style={styles.editInput}
                        value={editForm.telefono}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, telefono: text }))}
                        placeholder="Teléfono del cliente"
                        keyboardType="phone-pad"
                    />
                ) : (
                    item.telefono ? (
                        <Text style={styles.clienteTelefono}>
                            📞 {item.telefono}
                        </Text>
                    ) : null
                )}

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
                                    onPress={() => saveClient(item.id!)}
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
                    ? 'No se encontraron clientes con los filtros aplicados'
                    : 'No hay clientes registrados'
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
                    placeholder="Buscar clientes..."
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
                    <Text style={styles.loadingText}>Cargando clientes...</Text>
                </View>
            ) : (
                <FlatList
                    data={clientes}
                    renderItem={renderCliente}
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
    clienteCard: {
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
    clienteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clienteNombre: {
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
    clienteDireccion: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    clienteTelefono: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
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
        marginBottom: 8,
    },
    editTextArea: {
        minHeight: 60,
        textAlignVertical: 'top',
        marginBottom: 12,
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

export default ClientsList;
