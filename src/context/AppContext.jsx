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
    const [activeTrip, setActiveTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist login state
    useEffect(() => {
        localStorage.setItem('ama_user', JSON.stringify(user));
    }, [user]);

    // Fetch initial data from Supabase
    useEffect(() => {
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

    return (
        <AppContext.Provider value={{
            cars, drivers, trips, activeTrip, user, fuelRecords, loading,
            addCar, addDriver, startTrip, endTrip, addFuelRecord, login, logout,
            refreshData: fetchInitialData
        }}>
            {children}
        </AppContext.Provider>
    );
};
