import CourseDetailClient from './CourseDetailClient';

export const dynamicParams = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
