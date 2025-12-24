import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Camera, MapPin, Navigation, CheckCircle2, Eye, X, Edit2, Trash2, Calendar, Car, User, Printer } from 'lucide-react';
import { format } from 'date-fns';
import AdminPasswordModal from '../components/AdminPasswordModal';
import ImagePreviewModal from '../components/ImagePreviewModal';

const Trip = () => {
    const { trips, activeTrip, startTrip, endTrip, updateTrip, deleteTrip, cars, drivers, loading, uploadImage } = useAppContext();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const handleStartOdometerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStartOdometerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setStartOdometerPreview(reader.result);
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEndOdometerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEndOdometerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEndOdometerPreview(reader.result);
                setPreviewImage(reader.result);
            };
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
        // Upload foto do odômetro inicial se existir
        if (startOdometerFile) {
            try {
                startOdometerUrl = await uploadImage(startOdometerFile, 'odometer-photos');
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert(`Erro ao fazer upload da foto do odômetro: ${error.message}. Verifique se o bucket 'odometer-photos' existe.`);
                setIsFetchingLocation(false); // Stop loading on error
                return; // Stop execution if upload fails
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
        // Upload foto do odômetro final se existir
        if (endOdometerFile) {
            try {
                endOdometerUrl = await uploadImage(endOdometerFile, 'odometer-photos');
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert(`Erro ao fazer upload da foto do odômetro: ${error.message}. Verifique se o bucket 'odometer-photos' existe.`);
                setIsEndingTrip(false); // Stop loading on error
                return; // Stop execution if upload fails
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

    const handleEdit = (trip) => {
        setPendingAction({ type: 'edit', data: trip });
        setShowPasswordModal(true);
    };

    const handleDelete = (id) => {
        setPendingAction({ type: 'delete', data: id });
        setShowPasswordModal(true);
    };

    const executeAction = async () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'edit') {
            // Implementar edição de viagem se necessário
            alert('Edição de viagens em desenvolvimento');
        } else if (pendingAction.type === 'delete') {
            try {
                await deleteTrip(pendingAction.data);
                alert('Viagem excluída com sucesso!');
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }

        setPendingAction(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!activeTrip && !isCreating) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Navigation className="text-primary" />
                            Viagens
                        </h2>
                        <p className="text-muted-foreground">Gerencie e acompanhe todas as viagens.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="accent-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                    >
                        NOVA VIAGEM
                    </button>
                </header>

                <div className="grid gap-6">
                    {trips.length > 0 ? (
                        trips.map((trip) => {
                            const car = cars.find(c => c.id === trip.car_id);
                            const driver = drivers.find(d => d.id === trip.driver_id);
                            const kmPercorridos = parseFloat(trip.end_km) - parseFloat(trip.start_km);

                            return (
                                <div key={trip.id} className="glass-morphism p-6 rounded-2xl border-l-4 border-blue-500 hover:bg-white/10 transition-all group overflow-hidden relative">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                                    VIAGEM #{(trip.id.substring(0, 5)).toUpperCase()}
                                                </span>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar size={14} className="mr-2" />
                                                    {format(new Date(trip.end_time), "dd/MM/yyyy HH:mm")}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Veículo</p>
                                                    <p className="text-lg font-bold flex items-center gap-2">
                                                        <Car size={16} className="text-primary" />
                                                        {car?.model || 'Veículo'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Motorista</p>
                                                    <p className="text-lg font-bold flex items-center gap-2">
                                                        <User size={16} className="text-blue-400" />
                                                        {driver?.name || 'Motorista'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="grid grid-cols-3 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">KM Inicial</p>
                                                        <p className="text-sm font-mono">{trip.start_km} km</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">KM Final</p>
                                                        <p className="text-sm font-mono">{trip.end_km} km</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Percorridos</p>
                                                        <p className="text-sm font-mono text-primary font-bold">+{kmPercorridos.toFixed(1)} km</p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-white/5 pt-3">
                                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Destino</p>
                                                    <p className="text-sm flex items-center gap-2">
                                                        <MapPin size={14} className="text-primary" />
                                                        {trip.destination || trip.origin || 'Rio de Janeiro'}
                                                    </p>
                                                </div>
                                                {trip.observations && (
                                                    <div className="border-t border-white/5 pt-3 mt-3">
                                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Observações</p>
                                                        <p className="text-sm">{trip.observations}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {(trip.start_odometer_photo || trip.end_odometer_photo) && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {trip.start_odometer_photo && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Odômetro Inicial</p>
                                                            <div className="relative group/img">
                                                                <img
                                                                    src={trip.start_odometer_photo}
                                                                    alt="Odômetro Inicial"
                                                                    className="max-h-32 w-full object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => setPreviewImage(trip.start_odometer_photo)}
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                                    <Eye className="text-white" size={24} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {trip.end_odometer_photo && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Odômetro Final</p>
                                                            <div className="relative group/img">
                                                                <img
                                                                    src={trip.end_odometer_photo}
                                                                    alt="Odômetro Final"
                                                                    className="max-h-32 w-full object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => setPreviewImage(trip.end_odometer_photo)}
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                                    <Eye className="text-white" size={24} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2 print:hidden mt-4">
                                                <button
                                                    onClick={() => window.print()}
                                                    className="p-3 bg-white/5 rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                                                    title="Imprimir"
                                                >
                                                    <Printer size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trip.id)}
                                                    className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Print Version of the Card */}
                                    <div className="hidden print:block fixed inset-0 bg-white text-black p-8 z-[1000] overflow-hidden">
                                        <div className="border-2 border-black p-6 h-full flex flex-col">
                                            {/* Header */}
                                            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                                                <div>
                                                    <h1 className="text-2xl font-black italic">AMA TRIP</h1>
                                                    <p className="text-[10px] uppercase tracking-tighter">Relatório de Viagem Individual</p>
                                                </div>
                                                <div className="text-right">
                                                    <h2 className="text-xl font-bold">RELATÓRIO DE VIAGEM</h2>
                                                    <p className="font-mono text-xs">ID {(trip.id.substring(0, 8)).toUpperCase()}</p>
                                                    <p className="text-[10px] mt-1">{format(new Date(trip.end_time), "dd/MM/yyyy HH:mm")}</p>
                                                </div>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                                                <div className="border-b border-gray-300 pb-2">
                                                    <span className="block text-[10px] uppercase font-bold text-gray-500">Veículo</span>
                                                    <span className="font-bold text-lg">{car?.model}</span>
                                                    <span className="text-xs ml-2 text-gray-600">({car?.plate})</span>
                                                </div>
                                                <div className="border-b border-gray-300 pb-2">
                                                    <span className="block text-[10px] uppercase font-bold text-gray-500">Motorista</span>
                                                    <span className="font-bold text-lg">{driver?.name}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 border border-gray-200 rounded">
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-gray-500">Saída</span>
                                                    <span className="font-mono font-bold block">{trip.start_km} km</span>
                                                    <span className="text-[10px] text-gray-400">{trip.origin || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-gray-500">Chegada</span>
                                                    <span className="font-mono font-bold block">{trip.end_km} km</span>
                                                    <span className="text-[10px] text-gray-400">{trip.destination || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-gray-500">Percorrido</span>
                                                    <span className="font-mono font-bold text-lg">+{kmPercorridos.toFixed(1)} km</span>
                                                </div>
                                            </div>

                                            {trip.observations && (
                                                <div className="mb-6 border border-gray-300 p-3 rounded">
                                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Observações</p>
                                                    <p className="text-xs">{trip.observations}</p>
                                                </div>
                                            )}

                                            {/* Photos */}
                                            <div className="flex-1 flex flex-col gap-4">
                                                <p className="text-[10px] uppercase font-bold border-b border-black pb-1">Registros Fotográficos (Odômetro)</p>
                                                <div className="flex-1 grid grid-cols-2 gap-4 h-full min-h-[200px]">
                                                    <div className="border border-gray-200 rounded p-2 flex flex-col">
                                                        <span className="text-[10px] text-center mb-1 uppercase font-bold">Início</span>
                                                        <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
                                                            {trip.start_odometer_photo ? (
                                                                <img src={trip.start_odometer_photo} className="max-h-full max-w-full object-contain" alt="Início" />
                                                            ) : <span className="text-[10px] text-gray-400">Sem foto</span>}
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-200 rounded p-2 flex flex-col">
                                                        <span className="text-[10px] text-center mb-1 uppercase font-bold">Fim</span>
                                                        <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
                                                            {trip.end_odometer_photo ? (
                                                                <img src={trip.end_odometer_photo} className="max-h-full max-w-full object-contain" alt="Fim" />
                                                            ) : <span className="text-[10px] text-gray-400">Sem foto</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-4 text-[8px] text-gray-400 text-center uppercase border-t border-gray-200 pt-2">
                                                Gerado em {new Date().toLocaleString('pt-BR')} via Ama Trip System
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 glass-morphism rounded-2xl border-dashed border-2 border-white/10">
                            <Navigation size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-xl font-medium text-muted-foreground">Nenhuma Viagem</h3>
                            <p className="text-sm text-muted-foreground/60 mt-1">Clique em 'Nova Viagem' para começar.</p>
                        </div>
                    )}
                </div>

                <AdminPasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setPendingAction(null);
                    }}
                    onSuccess={executeAction}
                    title="Autorização Necessária"
                />

                <ImagePreviewModal
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                    imageUrl={previewImage}
                    title="Preview do Odômetro"
                />
            </div>
        );
    }

    if (activeTrip) {
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
    }

    // Form para iniciar nova viagem
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Iniciar Nova Viagem</h2>
                    <p className="text-muted-foreground">Preencha os detalhes para começar o acompanhamento.</p>
                </div>
                <button
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                >
                    Cancelar
                </button>
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

            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title="Preview do Odômetro"
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    /* Show only the printed Trip version */
                    div.fixed.inset-0.bg-white { visibility: visible !important; display: block !important; position: static !important; }
                    div.fixed.inset-0.bg-white * { visibility: visible !important; }
                }
            ` }} />
        </div>
    );
};

export default Trip;
