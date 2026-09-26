import { Client } from "@/types/client";

export default async function getClients(token: string , skip: number, limit: number): Promise<Client[]> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/?skip=${skip}&limit=${limit}`, {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            }
        })
        if (!res.ok) {
            throw new Error(`Failed to fetch clients: ${res.statusText}`);
        }
        const data = await res.json();
        return data as Client[];
}