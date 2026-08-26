import { CharacterProvider } from '@/components/hooks/CharacterContext'
import { Slot } from 'expo-router'
import React, { useEffect } from 'react'
import { asegurarSesion } from '../lib/supabase'
import { configurarGoogle } from '../services/authService'

export default function RootLayout() {
    useEffect(() => {
        // Configura el SDK de Google antes de que alguien pueda tocar el botón.
        configurarGoogle();
        // Sesión anónima para poder llamar a las Edge Functions.
        asegurarSesion();
    }, []);

    return (
        <CharacterProvider>
            <Slot />
        </CharacterProvider>
    )
}