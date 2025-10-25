import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductList } from '../components/products/ProductList';
import { useToast } from '../contexts/ToastContext';
import { Producto } from '../lib/firebase/productos';

export default function ProductsView() {
    const { showInfo } = useToast();
    const insets = useSafeAreaInsets();

    const handleProductPress = (product: Producto) => {
        // Here you can implement navigation to product details
        showInfo(`Has seleccionado: ${product.nombre}`);
    };

    const handleProductEdit = (product: Producto) => {
        // Here you can implement navigation to edit modal
        showInfo(`Editando: ${product.nombre}`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.title}>Productos</Text>
            </View>
            <ProductList
                onProductPress={handleProductPress}
                onProductEdit={handleProductEdit}
                showActions={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
