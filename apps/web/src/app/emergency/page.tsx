import React from 'react';
import { Metadata } from 'next';
import EmergencyClient from './EmergencyClient';

export const metadata: Metadata = {
  title: 'Экстренная помощь | Эмоциональный баланс',
  description: 'Если вы находитесь в кризисной ситуации и вам нужна немедленная помощь, пожалуйста, обратитесь в соответствующие службы.',
};

export default function EmergencyPage() {
  return <EmergencyClient />;
}
