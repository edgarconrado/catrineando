import { CharacterProvider } from '@/components/hooks/CharacterContext'
import { Slot } from 'expo-router'
import React, { useEffect } from 'react'
import { asegurarSesion } from '../lib/supabase'

export default function RootLayout() {
    useEffect(() => {
        // Sesión anónima para poder llamar a la Edge Function con cuota por usuario.
        asegurarSesion();
    }, []);

    return (
        <CharacterProvider>
            <Slot />
        </CharacterProvider>
    )
}
