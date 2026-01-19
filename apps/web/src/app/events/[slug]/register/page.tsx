import React from 'react';
import { notFound } from 'next/navigation';
import { EventRegistrationClient } from './registration-client';

async function getEvent(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/events/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventRegisterPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) notFound();

  return <EventRegistrationClient event={event} />;
}

