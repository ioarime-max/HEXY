/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AIAdvisor from './components/AIAdvisor';
import FinanceTracker from './components/FinanceTracker';
import MicroLearning from './components/MicroLearning';
import CommunityFeed from './components/CommunityFeed';
import MarketingGenerator from './components/MarketingGenerator';
import FinanceSuite from './components/FinanceSuite';
import Warehouse from './components/Warehouse';
import ProfileSettings from './components/ProfileSettings';
import Marketplace from './components/Marketplace';
import LoanHelper from './components/LoanHelper';
import Auth from './components/Auth';
import { SocketProvider } from './components/SocketProvider';
import { api } from './api';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<{ id: string | number; name: string } | null>(null);

  useEffect(() => {
    // Initial theme check
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // One-time cleanup of offensive content in localStorage
    const cleanupKey = 'honeybee_cleanup_done_v1';
    if (!localStorage.getItem(cleanupKey)) {
      try {
        const keys = ['honeybee_posts', 'honeybee_profile', 'honeybee_transactions', 'growgrid_posts', 'growgrid_profile', 'growgrid_transactions'];
        keys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data && (data.includes('hawk tuah') || data.includes('kms'))) {
            // Remove offensive content or reset key
            localStorage.removeItem(key);
            console.log(`Cleaned up offensive content in ${key}`);
          }
        });
        localStorage.setItem(cleanupKey, 'true');
      } catch (e) {
        console.error('Cleanup failed', e);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid JWT format");
        }
        // Handle base64url encoding
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        setUser({ id: payload.id, name: payload.name });

        // Verify token with server
        api.getProfile().catch((err) => {
          console.error("Token verification failed", err);
          // api.ts middle-ware already handles 401 logout/redirect
        });
      } catch (e) {
        console.error("Failed to decode token", e);
        setToken(null);
        localStorage.removeItem("token");
      }
    } else {
      setUser(null);
    }
  }, [token]);

  if (!token) {
    return <Auth onAuth={(t) => setToken(t)} />;
  }

  return (
    <SocketProvider user={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="advisor" element={<AIAdvisor />} />
            <Route path="finance" element={<FinanceTracker />} />
            <Route path="learn" element={<MicroLearning />} />
            <Route path="community" element={<CommunityFeed mode="community" />} />
            <Route path="forum" element={<CommunityFeed mode="forum" />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketing" element={<MarketingGenerator />} />
            <Route path="finance-suite" element={<FinanceSuite />} />
            <Route path="inventory" element={<Warehouse />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
