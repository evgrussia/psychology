import React from 'react';
import { ContactsClient } from './ContactsClient';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <ContactsClient />
    </div>
  );
}
