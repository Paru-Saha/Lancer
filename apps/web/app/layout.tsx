import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Lancer | NEAR Hackathon 2026', description: 'Milestone payments with clear approval, timeout, and dispute rules, built for the NEAR Hackathon 2026.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }