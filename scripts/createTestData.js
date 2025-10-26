// Script para crear datos de prueba
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Configuración de Firebase (debe coincidir con tu config)
const firebaseConfig = {
    // Aquí va tu configuración de Firebase
    // Por ahora usaremos una configuración de ejemplo
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "app-maestro-detail",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestData() {
    try {
        console.log('Creating test data...');

        // Crear clientes de prueba
        const clientes = [
            {
                nombre: 'Juan Pérez',
                direccion: 'Calle 123, Ciudad',
                telefono: '555-0123',
                status: 'activo',
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            },
            {
                nombre: 'María García',
                direccion: 'Avenida 456, Ciudad',
                telefono: '555-0456',
                status: 'activo',
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            }
        ];

        for (const cliente of clientes) {
            const docRef = await addDoc(collection(db, 'clientes'), cliente);
            console.log('Cliente creado con ID:', docRef.id);
        }

        // Crear productos de prueba
        const productos = [
            {
                nombre: 'Producto 1',
                descripcion: 'Descripción del producto 1',
                precio: 10.50,
                cantidad: 100,
                status: 'activo',
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            },
            {
                nombre: 'Producto 2',
                descripcion: 'Descripción del producto 2',
                precio: 25.00,
                cantidad: 50,
                status: 'activo',
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            }
        ];

        for (const producto of productos) {
            const docRef = await addDoc(collection(db, 'productos'), producto);
            console.log('Producto creado con ID:', docRef.id);
        }

        console.log('Datos de prueba creados exitosamente!');
    } catch (error) {
        console.error('Error creating test data:', error);
    }
}

createTestData();
