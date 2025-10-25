import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { useProductoForm } from '../hooks/useProductoForm';

interface ProductosModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ProductosModal({ visible, onClose }: ProductosModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const [isLoading, setIsLoading] = useState(false);

    const {
        formData,
        errors,
        handleInputChange,
        handleCrear
    } = useProductoForm();

    const { showSuccess, showError } = useToast();

    const handlePriceChange = (value: string) => {
        // Solo permitir números y un punto decimal
        const cleanValue = value.replace(/[^0-9.]/g, '');

        // Evitar múltiples puntos decimales
        const parts = cleanValue.split('.');
        const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;

        handleInputChange('precio', finalValue);
    };

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

    const handleCrearProducto = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await handleCrear(() => {
                // Cerrar el modal primero
                onClose();
                // Mostrar toast después de un pequeño delay
                setTimeout(() => {
                    showSuccess('Producto creado correctamente');
                }, 300);
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            showError('No se pudo crear el producto');
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
                                <Text style={styles.title}>Nuevo Producto</Text>
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
                                            placeholder="Nombre del producto"
                                            placeholderTextColor="#999"
                                        />
                                        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Descripción</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={formData.descripcion}
                                            onChangeText={(value) => handleInputChange('descripcion', value)}
                                            placeholder="Descripción del producto (opcional)"
                                            placeholderTextColor="#999"
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, styles.halfWidth]}>
                                            <Text style={styles.label}>Precio *</Text>
                                            <View style={styles.priceInputContainer}>
                                                <Text style={styles.dollarSign}>$</Text>
                                                <TextInput
                                                    style={[styles.input, styles.priceInput, errors.precio && styles.inputError]}
                                                    value={formData.precio}
                                                    onChangeText={handlePriceChange}
                                                    placeholder="0.00"
                                                    placeholderTextColor="#999"
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            {errors.precio && <Text style={styles.errorText}>{errors.precio}</Text>}
                                        </View>

                                        <View style={[styles.inputGroup, styles.halfWidth]}>
                                            <Text style={styles.label}>Cantidad *</Text>
                                            <TextInput
                                                style={[styles.input, errors.cantidad && styles.inputError]}
                                                value={formData.cantidad}
                                                onChangeText={(value) => handleInputChange('cantidad', value)}
                                                placeholder="0"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                            />
                                            {errors.cantidad && <Text style={styles.errorText}>{errors.cantidad}</Text>}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                                        onPress={handleCrearProducto}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                                <Text style={styles.createButtonText}>Creando...</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.createButtonText}>Crear Producto</Text>
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
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
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
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
    },
    dollarSign: {
        fontSize: 16,
        color: '#333',
        paddingLeft: 12,
        paddingRight: 4,
        fontWeight: '600',
    },
    priceInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingLeft: 0,
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
