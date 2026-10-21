import type { Metadata } from 'next';
import LocalContentEditor from '@/components/LocalContentEditor';

export const metadata: Metadata = { title: 'Biên tập dữ liệu | Bình Mỹ Du Ký Website' };
export default function EditorPage() { return <LocalContentEditor />; }
