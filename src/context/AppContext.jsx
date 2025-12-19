import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [cars, setCars] = useState(() => {
        const saved = localStorage.getItem('ama_cars');
        return saved ? JSON.parse(saved) : [];
    });

    const [drivers, setDrivers] = useState(() => {
        const saved = localStorage.getItem('ama_drivers');
        return saved ? JSON.parse(saved) : [];
    });

    const [trips, setTrips] = useState(() => {
        const saved = localStorage.getItem('ama_trips');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeTrip, setActiveTrip] = useState(() => {
        const saved = localStorage.getItem('ama_active_trip');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('ama_cars', JSON.stringify(cars));
    }, [cars]);

    useEffect(() => {
        localStorage.setItem('ama_drivers', JSON.stringify(drivers));
    }, [drivers]);

    useEffect(() => {
        localStorage.setItem('ama_trips', JSON.stringify(trips));
    }, [trips]);

    useEffect(() => {
        localStorage.setItem('ama_active_trip', JSON.stringify(activeTrip));
    }, [activeTrip]);

    const addCar = (car) => setCars([...cars, { ...car, id: Date.now() }]);
    const addDriver = (driver) => setDrivers([...drivers, { ...driver, id: Date.now() }]);

    const startTrip = (trip) => {
        setActiveTrip({ ...trip, id: Date.now(), startTime: new Date().toISOString() });
    };

    const endTrip = (tripData) => {
        const completedTrip = {
            ...activeTrip,
            ...tripData,
            endTime: new Date().toISOString(),
        };
        setTrips([completedTrip, ...trips]);
        setActiveTrip(null);
    };

    const addFuelRecord = (fuel) => {
        const updatedTrips = [...trips];
        // In a real app we'd link this to a trip or a car
        // For now, let's just keep a separate list or attach to the last trip
        console.log('Fuel added:', fuel);
    };

    return (
        <AppContext.Provider value={{
            cars, drivers, trips, activeTrip,
            addCar, addDriver, startTrip, endTrip, addFuelRecord
        }}>
            {children}
        </AppContext.Provider>
    );
};
