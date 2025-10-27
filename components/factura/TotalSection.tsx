import { StyleSheet, Text, View } from 'react-native';

interface TotalSectionProps {
    total: number;
}

export default function TotalSection({ total }: TotalSectionProps) {
    return (
        <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 60,
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
});
