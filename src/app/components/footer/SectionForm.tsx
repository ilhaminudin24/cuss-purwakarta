import { useState, useCallback } from 'react';

export interface SectionFormProps {
  initialData?: {
    title: string;
    content?: string;
    position: number;
    visible: boolean;
    sectionType: string;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    position: number;
    visible: boolean;
    sectionType: string;
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const sectionTypes = [
  { value: 'company-info', label: 'Company Info' },
  { value: 'quick-links', label: 'Quick Links' },
  { value: 'services', label: 'Services' },
  { value: 'contact', label: 'Contact' },
  { value: 'social-media', label: 'Social Media' },
] as const;

export default function SectionForm({ initialData, onSubmit, onCancel, loading }: SectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [position, setPosition] = useState(initialData?.position || 0);
  const [visible, setVisible] = useState<boolean>(initialData?.visible ?? true);
  const [sectionType, setSectionType] = useState(initialData?.sectionType || sectionTypes[0].value);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      position: Number(position),
      visible: Boolean(visible),
      sectionType
    });
  }, [title, content, position, visible, sectionType, onSubmit]);

  const handleVisibilityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVisible(e.target.checked);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          className="mt-1 block w-full border rounded px-3 py-2"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Section Type</label>
        <select
          className="mt-1 block w-full border rounded px-3 py-2"
          value={sectionType}
          onChange={e => setSectionType(e.target.value)}
        >
          {sectionTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="number"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={position}
            onChange={e => setPosition(parseInt(e.target.value, 10) || 0)}
            min={0}
          />
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            id="visible"
            checked={visible}
            onChange={handleVisibilityChange}
            className="mr-2"
          />
          <label htmlFor="visible" className="text-sm text-gray-700">Visible</label>
        </div>
      </div>
      <div className="flex space-x-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
        )}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
} 