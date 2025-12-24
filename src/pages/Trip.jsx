import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Camera, MapPin, Navigation, CheckCircle2, Eye, X } from 'lucide-react';
import ImagePreviewModal from '../components/ImagePreviewModal';

const Trip = () => {
    const { activeTrip, startTrip, endTrip, cars, drivers, loading } = useAppContext();
    const [formData, setFormData] = useState({
        car_id: '',
        driver_id: '',
        start_km: '',
        end_km: '',
        location: 'Rio de Janeiro, RJ',
        observations: ''
    });
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isEndingTrip, setIsEndingTrip] = useState(false);
    const [startOdometerFile, setStartOdometerFile] = useState(null);
    const [startOdometerPreview, setStartOdometerPreview] = useState('');
    const [endOdometerFile, setEndOdometerFile] = useState(null);
    const [endOdometerPreview, setEndOdometerPreview] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    const handleStartOdometerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStartOdometerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setStartOdometerPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEndOdometerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEndOdometerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setEndOdometerPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleStart = (e) => {
        e.preventDefault();
        const car = cars.find(c => c.id === formData.car_id);
        const driver = drivers.find(d => d.id === formData.driver_id);

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

    const completeStart = async (car, driver, finalLocation) => {
        let startOdometerUrl = '';

        // Upload foto do odômetro inicial se existir
        if (startOdometerFile) {
            try {
                const fileExt = startOdometerFile.name.split('.').pop();
                const fileName = `trip-start-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('odometer-photos')
                    .upload(fileName, startOdometerFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('odometer-photos')
                    .getPublicUrl(fileName);

                startOdometerUrl = data.publicUrl;
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert('Erro ao fazer upload da foto do odômetro');
            }
        }

        await startTrip({
            car_id: car.id,
            driver_id: driver.id,
            start_km: parseFloat(formData.start_km),
            origin: finalLocation,
            start_odometer_photo: startOdometerUrl
        });
        setIsFetchingLocation(false);
        setStartOdometerFile(null);
        setStartOdometerPreview('');
    };

    const handleEnd = (e) => {
        e.preventDefault();

        if ("geolocation" in navigator) {
            setIsEndingTrip(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let locationString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data.display_name) {
                            locationString = data.display_name.split(',').slice(0, 3).join(',');
                        }
                    } catch (err) {
                        console.error("Erro ao converter coordenadas em endereço", err);
                    }

                    completeEnd(locationString);
                },
                (error) => {
                    console.error("Erro GPS:", error);
                    alert("Não foi possível obter sua localização via GPS para o encerramento.");
                    completeEnd(formData.location);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            completeEnd(formData.location);
        }
    };

    const completeEnd = async (finalLocation) => {
        let endOdometerUrl = '';

        // Upload foto do odômetro final se existir
        if (endOdometerFile) {
            try {
                const fileExt = endOdometerFile.name.split('.').pop();
                const fileName = `trip-end-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('odometer-photos')
                    .upload(fileName, endOdometerFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('odometer-photos')
                    .getPublicUrl(fileName);

                endOdometerUrl = data.publicUrl;
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert('Erro ao fazer upload da foto do odômetro');
            }
        }

        await endTrip({
            end_km: parseFloat(formData.end_km),
            destination: finalLocation,
            observations: formData.observations,
            end_odometer_photo: endOdometerUrl
        });
        setFormData({ ...formData, end_km: '', observations: '' });
        setEndOdometerFile(null);
        setEndOdometerPreview('');
        setIsEndingTrip(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

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
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                                value={formData.car_id}
                                onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                            >
                                <option value="" className="bg-slate-900">Escolher Carro</option>
                                {cars.map(car => <option key={car.id} value={car.id} className="bg-slate-900">{car.model} ({car.plate})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Selecionar Motorista</label>
                            <select
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                                value={formData.driver_id}
                                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                            >
                                <option value="" className="bg-slate-900">Escolher Motorista</option>
                                {drivers.map(driver => <option key={driver.id} value={driver.id} className="bg-slate-900">{driver.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Quilometragem Inicial (km)</label>
                        <input
                            required
                            type="number"
                            placeholder="ex: 124500"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                            value={formData.start_km}
                            onChange={(e) => setFormData({ ...formData, start_km: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Foto do Odômetro (no início)</label>
                        <label className={`block border-2 border-dashed ${startOdometerPreview ? 'border-primary bg-primary/10' : 'border-white/10'} rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group`}>
                            {startOdometerPreview ? (
                                <div className="text-center">
                                    <img src={startOdometerPreview} alt="Preview" className="max-h-32 mx-auto rounded mb-2 shadow-lg" />
                                    <div className="flex gap-2 justify-center mt-3">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPreviewImage(startOdometerPreview);
                                            }}
                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            Ver Preview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setStartOdometerPreview('');
                                                setStartOdometerFile(null);
                                            }}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                        >
                                            <X size={16} />
                                            Remover
                                        </button>
                                    </div>
                                    <p className="text-xs text-primary font-bold mt-2">Clique na área para alterar</p>
                                </div>
                            ) : (
                                <>
                                    <Camera size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="text-sm text-muted-foreground">Toque para carregar ou tirar foto</p>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleStartOdometerChange} />
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

    const currentCar = cars.find(c => c.id === activeTrip.car_id);
    const currentDriver = drivers.find(d => d.id === activeTrip.driver_id);

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
                        <span>{currentCar?.model} • {currentDriver?.name}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Iniciado às</p>
                    <p className="font-mono">{new Date(activeTrip.start_time).toLocaleTimeString()}</p>
                </div>
            </header>

            <form onSubmit={handleEnd} className="glass-morphism p-8 rounded-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quilometragem Final (km)</label>
                    <input
                        required
                        type="number"
                        placeholder="ex: 124650"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                        value={formData.end_km}
                        onChange={(e) => setFormData({ ...formData, end_km: e.target.value })}
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-white"
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Foto do Odômetro (no final)</label>
                    <label className={`block border-2 border-dashed ${endOdometerPreview ? 'border-primary bg-primary/10' : 'border-white/10'} rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group`}>
                        {endOdometerPreview ? (
                            <div className="text-center">
                                <img src={endOdometerPreview} alt="Preview" className="max-h-32 mx-auto rounded mb-2 shadow-lg" />
                                <div className="flex gap-2 justify-center mt-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPreviewImage(endOdometerPreview);
                                        }}
                                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        Ver Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setEndOdometerPreview('');
                                            setEndOdometerFile(null);
                                        }}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Remover
                                    </button>
                                </div>
                                <p className="text-xs text-primary font-bold mt-2">Clique na área para alterar</p>
                            </div>
                        ) : (
                            <>
                                <Camera size={32} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                <p className="text-sm text-muted-foreground">Toque para carregar a foto final do odômetro</p>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleEndOdometerChange} />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isEndingTrip}
                    className={`w-full bg-green-600 py-4 rounded-xl font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${isEndingTrip ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isEndingTrip ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>OBTENDO LOCALIZAÇÃO FINAL...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={20} />
                            <span>FINALIZAR VIAGEM</span>
                        </>
                    )}
                </button>
            </form>

            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title="Preview do Odômetro"
            />
        </div>
    );
};

export default Trip;
