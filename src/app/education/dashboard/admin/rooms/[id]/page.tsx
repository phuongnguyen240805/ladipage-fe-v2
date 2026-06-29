import RoomDetailClient from './RoomDetailClient';

const apiBaseUrl = (
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://apiems.ryon.website'
).replace(/\/$/, '');

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.content)) return value.data.content;
  if (Array.isArray(value?.content)) return value.content;
  return [];
};

export const dynamicParams = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function RoomDetailPage() {
  return <RoomDetailClient />;
}
