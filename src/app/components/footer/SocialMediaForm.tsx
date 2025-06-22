import { useState } from 'react';

export interface SocialMediaFormProps {
  initialData?: {
    platform: string;
    url: string;
    icon: string;
    position: number;
    visible: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const platformOptions = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
];

export default function SocialMediaForm({ initialData, onSubmit, onCancel, loading }: SocialMediaFormProps) {
  const [platform, setPlatform] = useState(initialData?.platform || platformOptions[0].value);
  const [url, setUrl] = useState(initialData?.url || '');
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [position, setPosition] = useState(initialData?.position || 0);
  const [visible, setVisible] = useState(initialData?.visible ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    if (!icon.trim()) {
      setError('Icon is required');
      return;
    }
    setError(null);
    onSubmit({ platform, url, icon, position, visible });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Platform</label>
        <select
          className="mt-1 block w-full border rounded px-3 py-2"
          value={platform}
          onChange={e => setPlatform(e.target.value)}
        >
          {platformOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
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
        <label className="block text-sm font-medium text-gray-700">Icon (SVG or class)</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={icon}
          onChange={e => setIcon(e.target.value)}
          required
        />
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