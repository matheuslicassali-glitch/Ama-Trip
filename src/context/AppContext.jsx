import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('ama_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [cars, setCars] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [fuelRecords, setFuelRecords] = useState([]);
    const [serviceOrders, setServiceOrders] = useState([]);
    const [activeTrip, setActiveTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist login state
    useEffect(() => {
        localStorage.setItem('ama_user', JSON.stringify(user));
    }, [user]);

    // Fetch initial data from Supabase
    useEffect(() => {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setLoading(false);
            return;
        }

        fetchInitialData();

        // Setup Realtime subscriptions
        const carsSub = supabase.channel('cars-changes').on('postgres_changes', { event: '*', table: 'cars' }, fetchCars).subscribe();
        const driversSub = supabase.channel('drivers-changes').on('postgres_changes', { event: '*', table: 'drivers' }, fetchDrivers).subscribe();
        const tripsSub = supabase.channel('trips-changes').on('postgres_changes', { event: '*', table: 'trips' }, fetchTrips).subscribe();

        return () => {
            supabase.removeChannel(carsSub);
            supabase.removeChannel(driversSub);
            supabase.removeChannel(tripsSub);
        };
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([
            fetchCars(),
            fetchDrivers(),
            fetchTrips(),
            fetchFuelRecords(),
            fetchServiceOrders(),
            fetchActiveTrip()
        ]);
        setLoading(false);
    };

    const fetchCars = async () => {
        const { data, error } = await supabase.from('cars').select('*').order('model');
        if (error) console.error('Error fetching cars:', error);
        else setCars(data);
    };

    const fetchDrivers = async () => {
        const { data, error } = await supabase.from('drivers').select('*').order('name');
        if (error) console.error('Error fetching drivers:', error);
        else setDrivers(data);
    };

    const fetchTrips = async () => {
        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                cars (model, plate),
                drivers (name)
            `)
            .eq('status', 'completed')
            .order('end_time', { ascending: false });

        if (error) console.error('Error fetching trips:', error);
        else setTrips(data);
    };

    const fetchFuelRecords = async () => {
        const { data, error } = await supabase.from('fuel_records').select('*').order('date', { ascending: false });
        if (error) console.error('Error fetching fuel records:', error);
        else setFuelRecords(data);
    };

    const fetchServiceOrders = async () => {
        const { data, error } = await supabase.from('service_orders').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching service orders:', error);
        else setServiceOrders(data);
    };

    const fetchActiveTrip = async () => {
        const { data, error } = await supabase.from('trips').select('*').eq('status', 'active').single();
        if (error && error.code !== 'PGRST116') console.error('Error fetching active trip:', error);
        else setActiveTrip(data || null);
    };

    const login = (username, password) => {
        if (username === 'admin' && password === '123') {
            const adminUser = { username: 'admin', role: 'admin' };
            setUser(adminUser);
            return { success: true };
        } else if (username === 'user' && password === '123') {
            const regularUser = { username: 'user', role: 'user' };
            setUser(regularUser);
            return { success: true };
        }
        return { success: false, message: 'Usuário ou senha inválidos' };
    };

    const logout = () => {
        setUser(null);
    };

    const addCar = async (car) => {
        const { data, error } = await supabase.from('cars').insert([car]).select();
        if (error) throw error;
        await fetchCars();
    };

    const addDriver = async (driver) => {
        const { data, error } = await supabase.from('drivers').insert([driver]).select();
        if (error) throw error;
        await fetchDrivers();
    };

    const startTrip = async (trip) => {
        const { data, error } = await supabase.from('trips').insert([{
            ...trip,
            status: 'active',
            start_time: new Date().toISOString()
        }]).select().single();

        if (error) throw error;
        setActiveTrip(data);
    };

    const endTrip = async (tripData) => {
        if (!activeTrip) return;

        const { error } = await supabase
            .from('trips')
            .update({
                ...tripData,
                status: 'completed',
                end_time: new Date().toISOString()
            })
            .eq('id', activeTrip.id);

        if (error) throw error;
        setActiveTrip(null);
        await fetchTrips();
    };

    const addFuelRecord = async (fuel) => {
        const { error } = await supabase.from('fuel_records').insert([fuel]);
        if (error) throw error;
        await fetchFuelRecords();
    };

    const updateFuelRecord = async (id, fuel) => {
        const { error } = await supabase.from('fuel_records').update(fuel).eq('id', id);
        if (error) throw error;
        await fetchFuelRecords();
    };

    const deleteFuelRecord = async (id) => {
        const { error } = await supabase.from('fuel_records').delete().eq('id', id);
        if (error) throw error;
        await fetchFuelRecords();
    };

    const addServiceOrder = async (order) => {
        const { error } = await supabase.from('service_orders').insert([{
            ...order,
            created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        await fetchServiceOrders();
    };

    const updateServiceOrder = async (id, order) => {
        const { error } = await supabase.from('service_orders').update(order).eq('id', id);
        if (error) throw error;
        await fetchServiceOrders();
    };

    const deleteServiceOrder = async (id) => {
        const { error } = await supabase.from('service_orders').delete().eq('id', id);
        if (error) throw error;
        await fetchServiceOrders();
    };

    const updateTrip = async (id, tripData) => {
        const { error } = await supabase.from('trips').update(tripData).eq('id', id);
        if (error) throw error;
        await fetchTrips();
    };

    const deleteTrip = async (id) => {
        const { error } = await supabase.from('trips').delete().eq('id', id);
        if (error) throw error;
        await fetchTrips();
    };

    const uploadImage = async (file, bucket) => {
        if (!file) return null;

        try {
            // Check for HEIC
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                alert("Atenção: Imagem HEIC detectada.\n\nComo não foi possível instalar o conversor automático, recomendamos que altere a câmera do celular para 'Mais Compatível' (JPEG) para garantir que todos consigam visualizar as fotos.\n\nA imagem será salva, mas pode não abrir em alguns computadores.");
            }

            const fileExt = file.name.split('.').pop();
            // Create a unique file name
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) {
                console.error(`Upload error details for bucket ${bucket}:`, uploadError);
                throw new Error(`Falha no upload para ${bucket}: ${uploadError.message}`);
            }

            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload helper error:', error);
            throw error;
        }
    };

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="glass-morphism p-8 max-w-md w-full text-center border-red-500/30">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Configuração Pendente</h2>
                    <p className="text-foreground/70 mb-6">
                        As variáveis de ambiente do Supabase não foram encontradas.
                        Por favor, configure <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> no painel da Vercel.
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl text-left text-xs font-mono text-blue-300">
                        Acesse: Vercel Project > Settings > Environment Variables
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{
            cars, drivers, trips, activeTrip, user, fuelRecords, serviceOrders, loading,
            addCar, addDriver, startTrip, endTrip, addFuelRecord, addServiceOrder, login, logout,
            updateFuelRecord, deleteFuelRecord,
            updateServiceOrder, deleteServiceOrder,
            updateServiceOrder, deleteServiceOrder,
            updateTrip, deleteTrip, uploadImage,
            refreshData: fetchInitialData
        }}>
            {children}
        </AppContext.Provider>
    );
};
