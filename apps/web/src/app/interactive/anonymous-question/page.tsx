import React from 'react';
import AnonymousQuestionClient from './AnonymousQuestionClient';

export default function AnonymousQuestionPage() {
  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnonymousQuestionClient />
      </div>
    </div>
  );
}
