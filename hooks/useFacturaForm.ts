import { useState } from "react";
import { Cliente } from "../lib/firebase/clients";
import {
    calculateFacturaTotal,
    createFactura,
    FacturaItem,
    validateStockAvailability,
} from "../lib/firebase/factura";
import { Producto } from "../lib/firebase/productos";

interface FacturaFormData {
    clienteId: string;
    clienteNombre: string;
    items: FacturaItem[];
    total: number;
}

interface Errors {
    cliente: string;
    items: string;
    stock: string;
}

export const useFacturaForm = () => {
    const [formData, setFormData] = useState<FacturaFormData>({
        clienteId: "",
        clienteNombre: "",
        items: [],
        total: 0,
    });

    const [errors, setErrors] = useState<Errors>({
        cliente: "",
        items: "",
        stock: "",
    });

    const [isValidatingStock, setIsValidatingStock] = useState(false);

    const setCliente = (cliente: Cliente) => {
        setFormData((prev) => ({
            ...prev,
            clienteId: cliente.id!,
            clienteNombre: cliente.nombre,
        }));

        // Limpiar error de cliente
        if (errors.cliente) {
            setErrors((prev) => ({ ...prev, cliente: "" }));
        }
    };

    const addProducto = (producto: Producto, cantidad: number) => {
        if (cantidad <= 0) {
            setErrors((prev) => ({
                ...prev,
                items: "La cantidad debe ser mayor a 0",
            }));
            return;
        }

        if (cantidad > producto.cantidad) {
            setErrors((prev) => ({
                ...prev,
                stock: `Stock insuficiente. Disponible: ${producto.cantidad}`,
            }));
            return;
        }

        const existingItemIndex = formData.items.findIndex(
            (item) => item.productoId === producto.id
        );

        if (existingItemIndex >= 0) {
            // Actualizar cantidad del producto existente
            const updatedItems = [...formData.items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                cantidad: updatedItems[existingItemIndex].cantidad + cantidad,
                subtotal:
                    (updatedItems[existingItemIndex].cantidad + cantidad) *
                    producto.precio,
            };

            setFormData((prev) => ({
                ...prev,
                items: updatedItems,
                total: calculateFacturaTotal(updatedItems),
            }));
        } else {
            // Agregar nuevo producto
            const newItem: FacturaItem = {
                productoId: producto.id!,
                productoNombre: producto.nombre,
                cantidad,
                precioUnitario: producto.precio,
                subtotal: cantidad * producto.precio,
            };

            const updatedItems = [...formData.items, newItem];
            setFormData((prev) => ({
                ...prev,
                items: updatedItems,
                total: calculateFacturaTotal(updatedItems),
            }));
        }

        // Limpiar errores
        setErrors((prev) => ({ ...prev, items: "", stock: "" }));
    };

    const updateItemQuantity = (productoId: string, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            removeItem(productoId);
            return;
        }

        const updatedItems = formData.items.map((item) => {
            if (item.productoId === productoId) {
                return {
                    ...item,
                    cantidad: nuevaCantidad,
                    subtotal: nuevaCantidad * item.precioUnitario,
                };
            }
            return item;
        });

        setFormData((prev) => ({
            ...prev,
            items: updatedItems,
            total: calculateFacturaTotal(updatedItems),
        }));
    };

    const removeItem = (productoId: string) => {
        const updatedItems = formData.items.filter(
            (item) => item.productoId !== productoId
        );
        setFormData((prev) => ({
            ...prev,
            items: updatedItems,
            total: calculateFacturaTotal(updatedItems),
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {
            cliente: "",
            items: "",
            stock: "",
        };

        // Validar cliente
        if (!formData.clienteId) {
            newErrors.cliente = "Debe seleccionar un cliente";
        }

        // Validar items
        if (formData.items.length === 0) {
            newErrors.items = "Debe agregar al menos un producto";
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== "");
    };

    const validateStock = async (): Promise<boolean> => {
        if (formData.items.length === 0) return true;

        setIsValidatingStock(true);
        try {
            const validation = await validateStockAvailability(formData.items);

            if (!validation.isValid) {
                setErrors((prev) => ({
                    ...prev,
                    stock: validation.errors.join(", "),
                }));
            } else {
                setErrors((prev) => ({ ...prev, stock: "" }));
            }

            return validation.isValid;
        } catch (error) {
            console.error("Error validating stock:", error);
            setErrors((prev) => ({
                ...prev,
                stock: "Error al validar el stock",
            }));
            return false;
        } finally {
            setIsValidatingStock(false);
        }
    };

    const handleCrear = async (onSuccess?: () => void) => {
        if (!validateForm()) {
            return;
        }

        // Validar stock antes de crear la factura
        const stockValid = await validateStock();
        if (!stockValid) {
            return;
        }

        try {
            // Crear la factura en Firebase
            const facturaId = await createFactura({
                clienteId: formData.clienteId,
                clienteNombre: formData.clienteNombre,
                items: formData.items,
                total: formData.total,
            });

            console.log("Factura creada en Firebase con ID:", facturaId);

            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error("Error al crear factura:", error);
            throw error; // Re-lanzar el error para que lo maneje el componente
        }
    };

    const resetForm = () => {
        setFormData({
            clienteId: "",
            clienteNombre: "",
            items: [],
            total: 0,
        });
        setErrors({
            cliente: "",
            items: "",
            stock: "",
        });
    };

    return {
        formData,
        errors,
        isValidatingStock,
        setCliente,
        addProducto,
        updateItemQuantity,
        removeItem,
        handleCrear,
        resetForm,
        validateForm,
        validateStock,
    };
};
