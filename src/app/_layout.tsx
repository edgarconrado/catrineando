import { CharacterProvider } from '@/components/hooks/CharacterContext'
import { Slot } from 'expo-router'
import React from 'react'

export default function RootLayout() {
    return (
        <CharacterProvider>
            <Slot />
        </CharacterProvider>

    )
}
