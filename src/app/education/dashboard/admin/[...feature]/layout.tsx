import React from 'react';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { feature: ['notifications'] },
    { feature: ['reports'] },
    { feature: ['settings'] },
  ];
}

export default function AdminFeatureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
