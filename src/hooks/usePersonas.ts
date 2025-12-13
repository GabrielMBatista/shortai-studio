import { useState, useEffect } from 'react';
import { Persona } from '../types/personas';
import { personasApi } from '../api/personas';

export function usePersonas() {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPersonas();
    }, []);

    const loadPersonas = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await personasApi.getAll();
            setPersonas(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load personas');
            console.error('Error loading personas:', err);
        } finally {
            setLoading(false);
        }
    };

    const createPersona = async (data: any) => {
        try {
            setLoading(true);
            const newPersona = await personasApi.create(data);
            setPersonas(prev => [newPersona, ...prev]);
            return newPersona;
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePersona = async (id: string, data: any) => {
        try {
            const updatedPersona = await personasApi.update(id, data);
            setPersonas(prev => prev.map(p => p.id === id ? updatedPersona : p));
            return updatedPersona;
        } catch (err: any) {
            throw err;
        }
    };

    const deletePersona = async (id: string) => {
        try {
            await personasApi.delete(id);
            setPersonas(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            throw err;
        }
    };

    return {
        personas,
        loading,
        error,
        refetch: loadPersonas,
        createPersona,
        updatePersona,
        deletePersona
    };
}
