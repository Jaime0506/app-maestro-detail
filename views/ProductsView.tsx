import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProductList } from '../components/products/ProductList';
import { useToast } from '../contexts/ToastContext';
import { Producto } from '../lib/firebase/productos';

export default function ProductsView() {
    const { showInfo } = useToast();

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
