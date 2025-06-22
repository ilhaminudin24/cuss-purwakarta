import { useState } from 'react';

export interface LinkFormProps {
  initialData?: {
    title: string;
    url: string;
    position: number;
    visible: boolean;
    isExternal: boolean;
    sectionId: string;
  };
  sectionOptions: { value: string; label: string }[];
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function LinkForm({ initialData, sectionOptions, onSubmit, onCancel, loading }: LinkFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [position, setPosition] = useState(initialData?.position || 0);
  const [visible, setVisible] = useState(initialData?.visible ?? true);
  const [isExternal, setIsExternal] = useState(initialData?.isExternal ?? false);
  const [sectionId, setSectionId] = useState(initialData?.sectionId || (sectionOptions[0]?.value || ''));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    setError(null);
    onSubmit({ title, url, position, visible, isExternal, sectionId });
  };

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
        <label className="block text-sm font-medium text-gray-700">URL</label>
        <input
          type="url"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Section</label>
        <select
          className="mt-1 block w-full border rounded px-3 py-2"
          value={sectionId}
          onChange={e => setSectionId(e.target.value)}
        >
          {sectionOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
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
            onChange={e => setPosition(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            checked={visible}
            onChange={e => setVisible(e.target.checked)}
            className="mr-2"
            id="visible"
          />
          <label htmlFor="visible" className="text-sm text-gray-700">Visible</label>
        </div>
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            checked={isExternal}
            onChange={e => setIsExternal(e.target.checked)}
            className="mr-2"
            id="isExternal"
          />
          <label htmlFor="isExternal" className="text-sm text-gray-700">External</label>
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