import React from 'react'
import { Tabs } from 'expo-router'
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'black' }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: "Home",
                    headerTitle: "Catrinenado",
                    headerTintColor: "#FF5700",
                    tabBarIcon: ({ color }) =>
                        <AntDesign name="home" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name='tutorial'
                options={{
                    title: "Tutorial",
                    headerTitle: "Tutorial",
                    headerTintColor: "#FF5700",
                    tabBarIcon: ({ color }) =>
                        <AntDesign name="play-circle" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name='galery'
                options={{
                    title: "Galeria",
                    headerTitle: "Galeria",
                    headerTintColor: "#FF5700",
                    tabBarIcon: ({ color }) =>
                        <AntDesign name="picture" size={24} color={color} />
                }}
            /> 

            <Tabs.Screen
                name='about'
                options={{
                    title: "Acerca de..",
                    headerTitle: "Acerca de..",
                    headerTintColor: "#FF5700",
                    tabBarIcon: ({ color }) =>
                        <AntDesign name="verified" size={24} color={color} />
                }}
            />                        
        </Tabs>
    )
}