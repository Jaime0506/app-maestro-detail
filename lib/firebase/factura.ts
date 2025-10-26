import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { updateProduct } from "./productos";

export interface FacturaItem {
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface Factura {
    id?: string;
    clienteId: string;
    clienteNombre: string;
    items: FacturaItem[];
    total: number;
    fecha: Timestamp;
    status: "pendiente" | "pagada" | "cancelada";
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface CreateFacturaData {
    clienteId: string;
    clienteNombre: string;
    items: FacturaItem[];
    total: number;
}

// Create a new invoice
export const createFactura = async (
    facturaData: CreateFacturaData
): Promise<string> => {
    try {
        const now = Timestamp.now();

        const factura: Omit<Factura, "id"> = {
            clienteId: facturaData.clienteId,
            clienteNombre: facturaData.clienteNombre,
            items: facturaData.items,
            total: facturaData.total,
            fecha: now,
            status: "pendiente",
            created_at: now,
            updated_at: now,
        };

        // Crear la factura en Firebase
        const docRef = await addDoc(collection(db, "facturas"), factura);
        console.log("Factura creada con ID:", docRef.id);

        // Descontar stock de productos
        for (const item of facturaData.items) {
            try {
                // Obtener el producto actual para verificar stock
                const productosRef = collection(db, "productos");
                const productoDoc = await getDocs(
                    query(
                        productosRef,
                        where("__name__", "==", item.productoId)
                    )
                );

                if (!productoDoc.empty) {
                    const productoData = productoDoc.docs[0].data();
                    const stockActual = productoData.cantidad;

                    if (stockActual >= item.cantidad) {
                        // Descontar del stock
                        await updateProduct(item.productoId, {
                            cantidad: stockActual - item.cantidad,
                        });
                        console.log(
                            `Stock actualizado para producto ${
                                item.productoNombre
                            }: ${stockActual} -> ${stockActual - item.cantidad}`
                        );
                    } else {
                        throw new Error(
                            `Stock insuficiente para ${item.productoNombre}. Disponible: ${stockActual}, Solicitado: ${item.cantidad}`
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `Error actualizando stock para ${item.productoNombre}:`,
                    error
                );
                throw error;
            }
        }

        return docRef.id;
    } catch (error) {
        console.error("Error creating factura:", error);
        throw new Error("Could not create the factura");
    }
};

// Get all invoices
export const getFacturas = async (): Promise<Factura[]> => {
    try {
        const q = query(
            collection(db, "facturas"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const facturas: Factura[] = [];
        querySnapshot.forEach((doc) => {
            facturas.push({
                id: doc.id,
                ...doc.data(),
            } as Factura);
        });

        return facturas;
    } catch (error) {
        console.error("Error getting facturas:", error);
        throw new Error("Could not get facturas");
    }
};

// Get invoices by status
export const getFacturasByStatus = async (
    status: "pendiente" | "pagada" | "cancelada"
): Promise<Factura[]> => {
    try {
        const q = query(
            collection(db, "facturas"),
            where("status", "==", status),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const facturas: Factura[] = [];
        querySnapshot.forEach((doc) => {
            facturas.push({
                id: doc.id,
                ...doc.data(),
            } as Factura);
        });

        return facturas;
    } catch (error) {
        console.error("Error getting facturas by status:", error);
        throw new Error("Could not get facturas by status");
    }
};

// Get invoices by client
export const getFacturasByClient = async (
    clienteId: string
): Promise<Factura[]> => {
    try {
        const q = query(
            collection(db, "facturas"),
            where("clienteId", "==", clienteId),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const facturas: Factura[] = [];
        querySnapshot.forEach((doc) => {
            facturas.push({
                id: doc.id,
                ...doc.data(),
            } as Factura);
        });

        return facturas;
    } catch (error) {
        console.error("Error getting facturas by client:", error);
        throw new Error("Could not get facturas by client");
    }
};

// Update invoice status
export const updateFacturaStatus = async (
    id: string,
    status: "pendiente" | "pagada" | "cancelada"
): Promise<void> => {
    try {
        const facturaRef = doc(db, "facturas", id);
        await updateDoc(facturaRef, {
            status,
            updated_at: Timestamp.now(),
        });
        console.log("Factura status updated:", id, status);
    } catch (error) {
        console.error("Error updating factura status:", error);
        throw new Error("Could not update factura status");
    }
};

// Delete an invoice (soft delete - change status to canceled)
export const deleteFactura = async (id: string): Promise<void> => {
    try {
        await updateFacturaStatus(id, "cancelada");
        console.log("Factura deleted (soft delete):", id);
    } catch (error) {
        console.error("Error deleting factura:", error);
        throw new Error("Could not delete the factura");
    }
};

// Delete an invoice permanently
export const deleteFacturaPermanently = async (id: string): Promise<void> => {
    try {
        const facturaRef = doc(db, "facturas", id);
        await deleteDoc(facturaRef);
        console.log("Factura deleted permanently:", id);
    } catch (error) {
        console.error("Error deleting factura permanently:", error);
        throw new Error("Could not delete the factura permanently");
    }
};

// Get invoices with filters
export const getFacturasWithFilters = async (filters: {
    status?: "pendiente" | "pagada" | "cancelada";
    clienteId?: string;
    fechaDesde?: Timestamp;
    fechaHasta?: Timestamp;
    limite?: number;
}): Promise<Factura[]> => {
    try {
        // Always use the simplest possible query to avoid index issues
        const q = query(
            collection(db, "facturas"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);
        const facturas: Factura[] = [];

        querySnapshot.forEach((doc) => {
            const factura = {
                id: doc.id,
                ...doc.data(),
            } as Factura;

            // Apply all filters client-side
            let includeFactura = true;

            // Filter by status if specified
            if (filters.status && factura.status !== filters.status) {
                includeFactura = false;
            }

            // Filter by client if specified
            if (filters.clienteId && factura.clienteId !== filters.clienteId) {
                includeFactura = false;
            }

            // Filter by date range if specified
            if (filters.fechaDesde && factura.fecha < filters.fechaDesde) {
                includeFactura = false;
            }

            if (filters.fechaHasta && factura.fecha > filters.fechaHasta) {
                includeFactura = false;
            }

            if (includeFactura) {
                facturas.push(factura);
            }
        });

        // Apply limit if specified (client-side)
        if (filters.limite && facturas.length > filters.limite) {
            return facturas.slice(0, filters.limite);
        }

        return facturas;
    } catch (error) {
        console.error("Error getting facturas with filters:", error);
        throw new Error("Could not get facturas with filters");
    }
};

// Calculate total for invoice items
export const calculateFacturaTotal = (items: FacturaItem[]): number => {
    return items.reduce((total, item) => total + item.subtotal, 0);
};

// Validate stock availability for invoice items
export const validateStockAvailability = async (
    items: FacturaItem[]
): Promise<{
    isValid: boolean;
    errors: string[];
}> => {
    const errors: string[] = [];

    try {
        for (const item of items) {
            const productosRef = collection(db, "productos");
            const productoDoc = await getDocs(
                query(productosRef, where("__name__", "==", item.productoId))
            );

            if (!productoDoc.empty) {
                const productoData = productoDoc.docs[0].data();
                const stockActual = productoData.cantidad;

                if (stockActual < item.cantidad) {
                    errors.push(
                        `Stock insuficiente para ${item.productoNombre}. Disponible: ${stockActual}, Solicitado: ${item.cantidad}`
                    );
                }
            } else {
                errors.push(`Producto ${item.productoNombre} no encontrado`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    } catch (error) {
        console.error("Error validating stock:", error);
        return {
            isValid: false,
            errors: ["Error al validar el stock de los productos"],
        };
    }
};
