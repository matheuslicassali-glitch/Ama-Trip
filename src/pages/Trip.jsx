import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, MapPin, Navigation, CheckCircle2 } from 'lucide-react';

const Trip = () => {
    const { activeTrip, startTrip, endTrip, cars, drivers } = useAppContext();
    const [formData, setFormData] = useState({
        carId: '',
        driverId: '',
        initialMileage: '',
        finalMileage: '',
        location: 'Rio de Janeiro, RJ',
        comments: ''
    });
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const handleStart = (e) => {
        e.preventDefault();
        const car = cars.find(c => c.id === parseInt(formData.carId));
        const driver = drivers.find(d => d.id === parseInt(formData.driverId));

        if (!car || !driver) {
            alert('Por favor, selecione um carro e um motorista primeiro!');
            return;
        }

        if ("geolocation" in navigator) {
            setIsFetchingLocation(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let locationString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

                    try {
                        // Opcional: Aqui poderíamos usar uma API de geocoding reverso para pegar o nome da rua/bairro
                        // Por enquanto, salvaremos as coordenadas para precisão total.
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data.display_name) {
                            locationString = data.display_name.split(',').slice(0, 3).join(',');
                        }
                    } catch (err) {
                        console.error("Erro ao converter coordenadas em endereço", err);
                    }

                    completeStart(car, driver, locationString);
                },
                (error) => {
                    console.error("Erro GPS:", error);
                    alert("Não foi possível obter sua localização via GPS. A viagem será iniciada com a localização padrão.");
                    completeStart(car, driver, formData.location);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            completeStart(car, driver, formData.location);
        }
    };

    const completeStart = (car, driver, finalLocation) => {
        startTrip({
            carId: car.id,
            carModel: car.model,
            driverId: driver.id,
            driverName: driver.name,
            initialMileage: formData.initialMileage,
            startLocation: finalLocation
        });
        setIsFetchingLocation(false);
    };

    const handleEnd = (e) => {
        e.preventDefault();
        endTrip({
            finalMileage: formData.finalMileage,
            destination: formData.location,
            comments: formData.comments,
        });
        setFormData({ ...formData, finalMileage: '', comments: '' });
    };

    if (!activeTrip) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <header>
                    <h2 className="text-3xl font-bold">Iniciar Nova Viagem</h2>
                    <p className="text-muted-foreground">Preencha os detalhes para começar o acompanhamento.</p>
                </header>

                <form onSubmit={handleStart} className="glass-morphism p-8 rounded-2xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Selecionar Veículo</label>
                            <select
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={formData.carId}
                                onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                            >
                                <option value="">Escolher Carro</option>
                                {cars.map(car => <option key={car.id} value={car.id}>{car.model} ({car.plate})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Selecionar Motorista</label>
                            <select
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                            >
                                <option value="">Escolher Motorista</option>
                                {drivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Quilometragem Inicial (km)</label>
                        <input
                            required
                            type="number"
                            placeholder="ex: 124500"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={formData.initialMileage}
                            onChange={(e) => setFormData({ ...formData, initialMileage: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Foto do Odômetro (no início)</label>
                        <label className="block border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                            <Camera size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-sm text-muted-foreground">Toque para carregar ou tirar foto</p>
                            <input type="file" accept="image/*" className="hidden" />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isFetchingLocation}
                        className={`w-full accent-gradient py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${isFetchingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isFetchingLocation ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>OBTENDO LOCALIZAÇÃO GPS...</span>
                            </>
                        ) : (
                            <>
                                <Navigation size={20} />
                                <span>INICIAR MISSÃO</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Missão em Andamento</h2>
                    <p className="text-green-400 flex items-center space-x-2 mt-1">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span>{activeTrip.carModel} • {activeTrip.driverName}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Iniciado às</p>
                    <p className="font-mono">{new Date(activeTrip.startTime).toLocaleTimeString()}</p>
                </div>
            </header>

            <form onSubmit={handleEnd} className="glass-morphism p-8 rounded-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quilometragem Final (km)</label>
                    <input
                        required
                        type="number"
                        placeholder="ex: 124650"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.finalMileage}
                        onChange={(e) => setFormData({ ...formData, finalMileage: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Cidade / Bairro Atual (RJ)</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="ex: Barra da Tijuca, RJ"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Observações / Verificações</label>
                    <textarea
                        rows="3"
                        placeholder="Nível de óleo ok? Algum problema?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Foto do Odômetro (no final)</label>
                    <label className="block border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                        <Camera size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-sm text-muted-foreground">Toque para carregar a foto final do odômetro</p>
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 py-4 rounded-xl font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                    <CheckCircle2 size={20} />
                    <span>FINALIZAR VIAGEM</span>
                </button>
            </form>
        </div>
    );
};

export default Trip;
