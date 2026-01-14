import React from 'react';
import { RitualsCatalogClient } from './RitualsCatalogClient';

export default function RitualsPage() {
  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <RitualsCatalogClient />
      </div>
    </div>
  );
}
