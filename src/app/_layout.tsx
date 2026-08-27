import { CharacterProvider } from '@/components/hooks/CharacterContext'
import { Slot } from 'expo-router'
import React, { useEffect } from 'react'
import { asegurarSesion } from '../lib/supabase'
import { configurarGoogle } from '../services/authService'
import { configurarCompras } from '../services/comprasService'

export default function RootLayout() {
    useEffect(() => {
        configurarGoogle();
        asegurarSesion().then(() => configurarCompras());
    }, []);

    return (
        <CharacterProvider>
            <Slot />
        </CharacterProvider>
    )
}