import { Ionicons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ToastProvider, useToast } from "../contexts/ToastContext";
import ClientesModal from "./clients/ClientesModal";
import FacturasModal from "./factura/FacturasModal";
import InfoModal from "./InfoModal";
import ProductosModal from "./products/ProductosModal";
import Toast from "./Toast";

function FloatingTabBarContent() {
    const [clientesModalVisible, setClientesModalVisible] = useState(false);
    const [productosModalVisible, setProductosModalVisible] = useState(false);
    const [facturasModalVisible, setFacturasModalVisible] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);

    const segments = useSegments();
    const currentRoute = segments[segments.length - 1] as string || 'index';
    const { toast, hideToast } = useToast();

    const handleFloatingButtonPress = () => {
        // Cerrar todos los modales primero
        setClientesModalVisible(false);
        setProductosModalVisible(false);
        setFacturasModalVisible(false);
        setInfoModalVisible(false);

        // Abrir el modal correspondiente según la vista actual
        switch (currentRoute) {
            case 'index':
            case 'floating-button':
                setClientesModalVisible(true);
                break;
            case 'productos':
                setProductosModalVisible(true);
                break;
            case 'facturas':
                setFacturasModalVisible(true);
                break;
            case 'info':
                setInfoModalVisible(true);
                break;
            default:
                setClientesModalVisible(true);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#007AFF",
                    tabBarInactiveTintColor: "#8E8E93",
                    tabBarStyle: {
                        backgroundColor: "#FFFFFF",
                        borderTopColor: "#E5E5EA",
                        height: 110,
                        paddingTop: 10,
                    },
                    headerShown: true,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Clientes",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="people" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="productos"
                    options={{
                        title: "Productos",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cube" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="floating-button"
                    options={{
                        title: "",
                        tabBarIcon: () => (
                            <View style={styles.floatingButtonWrapper}>
                                <View style={styles.floatingButton}>
                                    <Ionicons name="add" size={28} color="#FFFFFF" />
                                </View>
                            </View>
                        ),
                        tabBarButton: (props) => {
                            const {
                                delayLongPress,
                                disabled,
                                onBlur,
                                onFocus,
                                onLayout,
                                onLongPress,
                                onPressIn,
                                onPressOut,
                                ref,
                                ...rest
                            } = props;

                            return (
                                <TouchableOpacity
                                    {...rest}
                                    style={styles.floatingButtonContainer}
                                    onPress={handleFloatingButtonPress}
                                />
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name="facturas"
                    options={{
                        title: "Facturas",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="receipt" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="info"
                    options={{
                        title: "Info",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="information-circle" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>

            {/* Modales */}
            <ClientesModal
                visible={clientesModalVisible}
                onClose={() => setClientesModalVisible(false)}
            />
            <ProductosModal
                visible={productosModalVisible}
                onClose={() => setProductosModalVisible(false)}
            />
            <FacturasModal
                visible={facturasModalVisible}
                onClose={() => setFacturasModalVisible(false)}
            />
            <InfoModal
                visible={infoModalVisible}
                onClose={() => setInfoModalVisible(false)}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </View>
    );
}

export default function FloatingTabBar() {
    return (
        <ToastProvider>
            <FloatingTabBarContent />
        </ToastProvider>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    floatingButtonWrapper: {
        position: "absolute",
        top: -40,
        left: "50%",
        marginLeft: -35,
        width: 70,
        height: 70,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 50,
    },
    floatingButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
});
