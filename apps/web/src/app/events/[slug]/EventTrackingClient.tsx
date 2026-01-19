 'use client';
 
 import React from 'react';
 import { track } from '@/lib/tracking';
 
 export function EventTrackingClient({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
   React.useEffect(() => {
     track('event_viewed', {
       event_id: eventId,
       event_slug: eventSlug,
     });
   }, [eventId, eventSlug]);
 
   return null;
 }
