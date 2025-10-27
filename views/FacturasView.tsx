import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FacturaDetailModal } from '../components/factura/FacturaDetailModal';
import { FacturaList } from '../components/factura/FacturaList';
import { useToast } from '../contexts/ToastContext';
import { Factura, updateFacturaStatus } from '../lib/firebase/factura';

export default function Facturas() {
    const { showError, showSuccess } = useToast();
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);

    const handleFacturaPress = (factura: Factura) => {
        setSelectedFactura(factura);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedFactura(null);
    };

    const handleStatusChange = async (factura: Factura) => {
        try {
            let newStatus: "pendiente" | "pagada" | "cancelada";

            // Ciclo de estados: pendiente -> pagada -> cancelada -> pendiente
            if (factura.status === 'pendiente') {
                newStatus = 'pagada';
            } else if (factura.status === 'pagada') {
                newStatus = 'cancelada';
            } else {
                newStatus = 'pendiente';
            }

            setChangingStatus(true);
            await updateFacturaStatus(factura.id!, newStatus);

            // Actualizar la factura seleccionada
            setSelectedFactura(prev => prev ? { ...prev, status: newStatus } : null);

            showSuccess(
                `Factura ${newStatus === 'pagada' ? 'marcada como pagada' :
                    newStatus === 'cancelada' ? 'cancelada' : 'marcada como pendiente'} correctamente`
            );
        } catch {
            showError('No se pudo cambiar el estado de la factura');
        } finally {
            setChangingStatus(false);
        }
    };

    return (
        <View style={styles.container}>
            <FacturaList onFacturaPress={handleFacturaPress} />

            <FacturaDetailModal
                visible={showDetailModal}
                factura={selectedFactura}
                onClose={handleCloseDetail}
                onStatusChange={handleStatusChange}
                changingStatus={changingStatus}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
