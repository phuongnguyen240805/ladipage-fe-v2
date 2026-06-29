import React from 'react';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { feature: ['notifications'] },
    { feature: ['documents'] },
    { feature: ['tuition'] },
    { feature: ['registrations'] },
    { feature: ['exams'] },
    { feature: ['requests'] },
  ];
}

export default function StudentFeatureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
