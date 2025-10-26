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
} from "firebase/firestore";
import { db } from "../../config/firebase";

export interface Producto {
    id?: string;
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    status: "activo" | "inactivo";
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface CreateProductoData {
    nombre: string;
    descripcion: string;
    precio: number;
    cantidad: number;
}

// Create a new product
export const createProduct = async (
    productData: CreateProductoData
): Promise<string> => {
    try {
        const now = Timestamp.now();

        const product: Omit<Producto, "id"> = {
            nombre: productData.nombre.trim(),
            descripcion: productData.descripcion.trim(),
            precio: Number(productData.precio),
            cantidad: Number(productData.cantidad),
            status: "activo",
            created_at: now,
            updated_at: now,
        };

        const docRef = await addDoc(collection(db, "productos"), product);
        console.log("Product created with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Could not create the product");
    }
};

// Get all products
export const getProducts = async (): Promise<Producto[]> => {
    try {
        const q = query(
            collection(db, "productos"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const products: Producto[] = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            } as Producto);
        });

        return products;
    } catch (error) {
        console.error("Error getting products:", error);
        throw new Error("Could not get products");
    }
};

// Get active products (simplified to avoid index issues)
export const getActiveProducts = async (): Promise<Producto[]> => {
    try {
        // Use simple query and filter client-side to avoid index requirements
        const q = query(
            collection(db, "productos"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const products: Producto[] = [];
        querySnapshot.forEach((doc) => {
            const product = {
                id: doc.id,
                ...doc.data(),
            } as Producto;

            // Filter by status client-side
            if (product.status === "activo") {
                products.push(product);
            }
        });

        return products;
    } catch (error) {
        console.error("Error getting active products:", error);
        throw new Error("Could not get active products");
    }
};

// Update a product
export const updateProduct = async (
    id: string,
    productData: Partial<CreateProductoData>
): Promise<void> => {
    try {
        const productRef = doc(db, "productos", id);
        const updateData = {
            ...productData,
            updated_at: Timestamp.now(),
        };

        await updateDoc(productRef, updateData);
        console.log("Product updated:", id);
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Could not update the product");
    }
};

// Change product status
export const changeProductStatus = async (
    id: string,
    status: "activo" | "inactivo"
): Promise<void> => {
    try {
        const productRef = doc(db, "productos", id);
        await updateDoc(productRef, {
            status,
            updated_at: Timestamp.now(),
        });
        console.log("Product status changed:", id, status);
    } catch (error) {
        console.error("Error changing product status:", error);
        throw new Error("Could not change product status");
    }
};

// Delete a product (soft delete - change status to inactive)
export const deleteProduct = async (id: string): Promise<void> => {
    try {
        await changeProductStatus(id, "inactivo");
        console.log("Product deleted (soft delete):", id);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Could not delete the product");
    }
};

// Delete a product permanently
export const deleteProductPermanently = async (id: string): Promise<void> => {
    try {
        const productRef = doc(db, "productos", id);
        await deleteDoc(productRef);
        console.log("Product deleted permanently:", id);
    } catch (error) {
        console.error("Error deleting product permanently:", error);
        throw new Error("Could not delete the product permanently");
    }
};

// Search products by name (simplified to avoid index issues)
export const searchProductsByName = async (
    name: string,
    status?: "activo" | "inactivo"
): Promise<Producto[]> => {
    try {
        // Use simple query and filter client-side to avoid index requirements
        const q = query(
            collection(db, "productos"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);
        const products: Producto[] = [];

        querySnapshot.forEach((doc) => {
            const product = {
                id: doc.id,
                ...doc.data(),
            } as Producto;

            // Apply filters client-side
            let includeProduct = true;

            // Filter by name (case-insensitive search)
            if (!product.nombre.toLowerCase().includes(name.toLowerCase())) {
                includeProduct = false;
            }

            // Filter by status if specified
            if (status && product.status !== status) {
                includeProduct = false;
            }

            if (includeProduct) {
                products.push(product);
            }
        });

        return products;
    } catch (error) {
        console.error("Error searching products by name:", error);
        throw new Error("Could not search products");
    }
};

// Get products by status (simplified to avoid index issues)
export const getProductsByStatus = async (
    status: "activo" | "inactivo"
): Promise<Producto[]> => {
    try {
        // Use simple query and filter client-side to avoid index requirements
        const q = query(
            collection(db, "productos"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const products: Producto[] = [];
        querySnapshot.forEach((doc) => {
            const product = {
                id: doc.id,
                ...doc.data(),
            } as Producto;

            // Filter by status client-side
            if (product.status === status) {
                products.push(product);
            }
        });

        return products;
    } catch (error) {
        console.error("Error getting products by status:", error);
        throw new Error("Could not get products by status");
    }
};

// Get products with combined filters (completely client-side filtering)
export const getProductsWithFilters = async (filters: {
    status?: "activo" | "inactivo";
    nombre?: string;
    limite?: number;
}): Promise<Producto[]> => {
    try {
        // Always use the simplest possible query to avoid index issues
        const q = query(
            collection(db, "productos"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);
        const products: Producto[] = [];

        querySnapshot.forEach((doc) => {
            const product = {
                id: doc.id,
                ...doc.data(),
            } as Producto;

            // Apply all filters client-side
            let includeProduct = true;

            // Filter by status if specified
            if (filters.status && product.status !== filters.status) {
                includeProduct = false;
            }

            // Filter by name if specified
            if (
                filters.nombre &&
                !product.nombre
                    .toLowerCase()
                    .includes(filters.nombre.toLowerCase())
            ) {
                includeProduct = false;
            }

            if (includeProduct) {
                products.push(product);
            }
        });

        // Apply limit if specified (client-side)
        if (filters.limite && products.length > filters.limite) {
            return products.slice(0, filters.limite);
        }

        return products;
    } catch (error) {
        console.error("Error getting products with filters:", error);
        throw new Error("Could not get products with filters");
    }
};
