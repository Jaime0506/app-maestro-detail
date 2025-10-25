import { useState } from "react";
import { createClient } from "../lib/firebase/clients";

interface FormData {
    nombre: string;
    direccion: string;
    telefono: string;
}

interface Errors {
    nombre: string;
    direccion: string;
    telefono: string;
}

export const useClienteForm = () => {
    const [formData, setFormData] = useState<FormData>({
        nombre: "",
        direccion: "",
        telefono: "",
    });

    const [errors, setErrors] = useState<Errors>({
        nombre: "",
        direccion: "",
        telefono: "",
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
            direccion: "",
            telefono: "",
        };

        // Validar nombre
        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        // Validar teléfono (opcional pero si se proporciona debe ser válido)
        if (
            formData.telefono.trim() &&
            !/^[\d\s\-\+\(\)]+$/.test(formData.telefono.trim())
        ) {
            newErrors.telefono =
                "El teléfono debe contener solo números y caracteres válidos";
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== "");
    };

    const handleCrear = async (onSuccess?: () => void) => {
        if (!validateForm()) {
            return;
        }

        try {
            // Crear el objeto cliente para Firebase
            const clienteData = {
                nombre: formData.nombre.trim(),
                direccion: formData.direccion.trim(),
                telefono: formData.telefono.trim(),
            };

            // Crear el cliente en Firebase
            const clienteId = await createClient(clienteData);
            console.log("Cliente creado en Firebase con ID:", clienteId);

            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error("Error al crear cliente:", error);
            throw error; // Re-lanzar el error para que lo maneje el componente
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            direccion: "",
            telefono: "",
        });
        setErrors({
            nombre: "",
            direccion: "",
            telefono: "",
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
