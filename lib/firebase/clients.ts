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

export interface Cliente {
    id?: string;
    nombre: string;
    direccion: string;
    telefono: string;
    status: "activo" | "inactivo";
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface CreateClienteData {
    nombre: string;
    direccion: string;
    telefono: string;
}

// Create a new client
export const createClient = async (
    clientData: CreateClienteData
): Promise<string> => {
    try {
        const now = Timestamp.now();

        const client: Omit<Cliente, "id"> = {
            nombre: clientData.nombre.trim(),
            direccion: clientData.direccion.trim(),
            telefono: clientData.telefono.trim(),
            status: "activo",
            created_at: now,
            updated_at: now,
        };

        const docRef = await addDoc(collection(db, "clientes"), client);
        console.log("Client created with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating client:", error);
        throw new Error("Could not create the client");
    }
};

// Get all clients
export const getClients = async (): Promise<Cliente[]> => {
    try {
        const q = query(
            collection(db, "clientes"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const clients: Cliente[] = [];
        querySnapshot.forEach((doc) => {
            clients.push({
                id: doc.id,
                ...doc.data(),
            } as Cliente);
        });

        return clients;
    } catch (error) {
        console.error("Error getting clients:", error);
        throw new Error("Could not get clients");
    }
};

// Get active clients
export const getActiveClients = async (): Promise<Cliente[]> => {
    try {
        const q = query(
            collection(db, "clientes"),
            where("status", "==", "activo"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const clients: Cliente[] = [];
        querySnapshot.forEach((doc) => {
            clients.push({
                id: doc.id,
                ...doc.data(),
            } as Cliente);
        });

        return clients;
    } catch (error) {
        console.error("Error getting active clients:", error);
        throw new Error("Could not get active clients");
    }
};

// Update a client
export const updateClient = async (
    id: string,
    clientData: Partial<CreateClienteData>
): Promise<void> => {
    try {
        const clientRef = doc(db, "clientes", id);
        const updateData = {
            ...clientData,
            updated_at: Timestamp.now(),
        };

        await updateDoc(clientRef, updateData);
        console.log("Client updated:", id);
    } catch (error) {
        console.error("Error updating client:", error);
        throw new Error("Could not update the client");
    }
};

// Change client status
export const changeClientStatus = async (
    id: string,
    status: "activo" | "inactivo"
): Promise<void> => {
    try {
        const clientRef = doc(db, "clientes", id);
        await updateDoc(clientRef, {
            status,
            updated_at: Timestamp.now(),
        });
        console.log("Client status changed:", id, status);
    } catch (error) {
        console.error("Error changing client status:", error);
        throw new Error("Could not change client status");
    }
};

// Delete a client (soft delete - change status to inactive)
export const deleteClient = async (id: string): Promise<void> => {
    try {
        await changeClientStatus(id, "inactivo");
        console.log("Client deleted (soft delete):", id);
    } catch (error) {
        console.error("Error deleting client:", error);
        throw new Error("Could not delete the client");
    }
};

// Delete a client permanently
export const deleteClientPermanently = async (id: string): Promise<void> => {
    try {
        const clientRef = doc(db, "clientes", id);
        await deleteDoc(clientRef);
        console.log("Client deleted permanently:", id);
    } catch (error) {
        console.error("Error deleting client permanently:", error);
        throw new Error("Could not delete the client permanently");
    }
};

// Search clients by name (simplified to avoid index issues)
export const searchClientsByName = async (
    name: string,
    status?: "activo" | "inactivo"
): Promise<Cliente[]> => {
    try {
        // Use simple query and filter client-side to avoid index requirements
        const q = query(
            collection(db, "clientes"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);
        const clients: Cliente[] = [];

        querySnapshot.forEach((doc) => {
            const client = {
                id: doc.id,
                ...doc.data(),
            } as Cliente;

            // Apply filters client-side
            let includeClient = true;

            // Filter by name (case-insensitive search)
            if (!client.nombre.toLowerCase().includes(name.toLowerCase())) {
                includeClient = false;
            }

            // Filter by status if specified
            if (status && client.status !== status) {
                includeClient = false;
            }

            if (includeClient) {
                clients.push(client);
            }
        });

        return clients;
    } catch (error) {
        console.error("Error searching clients by name:", error);
        throw new Error("Could not search clients");
    }
};

// Get clients by status (simplified to avoid index issues)
export const getClientsByStatus = async (
    status: "activo" | "inactivo"
): Promise<Cliente[]> => {
    try {
        // Use simple query and filter client-side to avoid index requirements
        const q = query(
            collection(db, "clientes"),
            orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);

        const clients: Cliente[] = [];
        querySnapshot.forEach((doc) => {
            const client = {
                id: doc.id,
                ...doc.data(),
            } as Cliente;

            // Filter by status client-side
            if (client.status === status) {
                clients.push(client);
            }
        });

        return clients;
    } catch (error) {
        console.error("Error getting clients by status:", error);
        throw new Error("Could not get clients by status");
    }
};

// Get clients with combined filters (completely client-side filtering)
export const getClientsWithFilters = async (filters: {
    status?: "activo" | "inactivo";
    nombre?: string;
    limite?: number;
}): Promise<Cliente[]> => {
    try {
        // Always use the simplest possible query to avoid index issues
        const q = query(
            collection(db, "clientes"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);
        const clients: Cliente[] = [];

        querySnapshot.forEach((doc) => {
            const client = {
                id: doc.id,
                ...doc.data(),
            } as Cliente;

            // Apply all filters client-side
            let includeClient = true;

            // Filter by status if specified
            if (filters.status && client.status !== filters.status) {
                includeClient = false;
            }

            // Filter by name if specified
            if (
                filters.nombre &&
                !client.nombre
                    .toLowerCase()
                    .includes(filters.nombre.toLowerCase())
            ) {
                includeClient = false;
            }

            if (includeClient) {
                clients.push(client);
            }
        });

        // Apply limit if specified (client-side)
        if (filters.limite && clients.length > filters.limite) {
            return clients.slice(0, filters.limite);
        }

        return clients;
    } catch (error) {
        console.error("Error getting clients with filters:", error);
        throw new Error("Could not get clients with filters");
    }
};
