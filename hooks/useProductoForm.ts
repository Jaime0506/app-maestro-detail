import { useState } from "react";
import { crearProducto } from "../lib/firebase/productos";

interface FormData {
    nombre: string;
    descripcion: string;
    precio: string;
    cantidad: string;
}

interface Errors {
    nombre: string;
    precio: string;
    cantidad: string;
}

export const useProductoForm = () => {
    const [formData, setFormData] = useState<FormData>({
        nombre: "",
        descripcion: "",
        precio: "",
        cantidad: "",
    });

    const [errors, setErrors] = useState<Errors>({
        nombre: "",
        precio: "",
        cantidad: "",
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpiar error cuando el usuario empiece a escribir
        if (errors[field as keyof Errors]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {
            nombre: "",
            precio: "",
            cantidad: "",
        };

        // Validar nombre
        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        // Validar precio
        if (!formData.precio.trim()) {
            newErrors.precio = "El precio es obligatorio";
        } else {
            const precioNum = parseFloat(formData.precio);
            if (isNaN(precioNum) || precioNum <= 0) {
                newErrors.precio = "El precio debe ser mayor a 0";
            }
        }

        // Validar cantidad
        if (!formData.cantidad.trim()) {
            newErrors.cantidad = "La cantidad es obligatoria";
        } else {
            const cantidadNum = parseInt(formData.cantidad);
            if (isNaN(cantidadNum) || cantidadNum <= 0) {
                newErrors.cantidad = "La cantidad debe ser mayor a 0";
            }
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== "");
    };

    const handleCrear = async (onSuccess?: () => void) => {
        if (!validateForm()) {
            return;
        }

        try {
            // Crear el objeto producto para Firebase
            const productoData = {
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                precio: parseFloat(formData.precio),
                cantidad: parseInt(formData.cantidad),
            };

            // Crear el producto en Firebase
            const productoId = await crearProducto(productoData);
            console.log("Producto creado en Firebase con ID:", productoId);

            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error("Error al crear producto:", error);
            throw error; // Re-lanzar el error para que lo maneje el componente
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            cantidad: "",
        });
        setErrors({
            nombre: "",
            precio: "",
            cantidad: "",
        });
    };

    return {
        formData,
        errors,
        handleInputChange,
        handleCrear,
        resetForm,
        validateForm,
    };
};
