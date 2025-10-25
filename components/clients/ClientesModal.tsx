import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useToast } from '../../contexts/ToastContext';
import { useClienteForm } from '../../hooks/useClienteForm';

interface ClientesModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ClientesModal({ visible, onClose }: ClientesModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const [isLoading, setIsLoading] = useState(false);

    const {
        formData,
        errors,
        handleInputChange,
        handleCrear
    } = useClienteForm();

    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 0.3,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, fadeAnim, scaleAnim]);

    const handleCrearCliente = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await handleCrear(() => {
                // Cerrar el modal primero
                onClose();
                // Mostrar toast después de un pequeño delay
                setTimeout(() => {
                    showSuccess('Cliente creado correctamente');
                }, 300);
            });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            showError('No se pudo crear el cliente');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Nuevo Cliente</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.content}>
                                <View style={styles.form}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Nombre *</Text>
                                        <TextInput
                                            style={[styles.input, errors.nombre && styles.inputError]}
                                            value={formData.nombre}
                                            onChangeText={(value) => handleInputChange('nombre', value)}
                                            placeholder="Nombre del cliente"
                                            placeholderTextColor="#999"
                                        />
                                        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Dirección</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={formData.direccion}
                                            onChangeText={(value) => handleInputChange('direccion', value)}
                                            placeholder="Dirección del cliente (opcional)"
                                            placeholderTextColor="#999"
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Teléfono</Text>
                                        <TextInput
                                            style={[styles.input, errors.telefono && styles.inputError]}
                                            value={formData.telefono}
                                            onChangeText={(value) => handleInputChange('telefono', value)}
                                            placeholder="Teléfono del cliente (opcional)"
                                            placeholderTextColor="#999"
                                            keyboardType="phone-pad"
                                        />
                                        {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                                        onPress={handleCrearCliente}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                                <Text style={styles.createButtonText}>Creando...</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.createButtonText}>Crear Cliente</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

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
        padding: 20,
        width: '90%',
        maxWidth: 450,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
        alignItems: 'center',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    inputError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    createButtonDisabled: {
        backgroundColor: '#A0A0A0',
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
