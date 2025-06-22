import { useState } from 'react';

export interface CompanyInfoFormProps {
  initialData?: {
    companyName: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    copyright?: string;
    isActive: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function CompanyInfoForm({ initialData, onSubmit, onCancel, loading }: CompanyInfoFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [logo, setLogo] = useState(initialData?.logo || '');
  const [copyright, setCopyright] = useState(initialData?.copyright || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    setError(null);
    onSubmit({ companyName, description, address, phone, email, website, logo, copyright, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="mt-1 block w-full border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          className="mt-1 block w-full border rounded px-3 py-2"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={website}
          onChange={e => setWebsite(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Logo URL</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={logo}
          onChange={e => setLogo(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Copyright</label>
        <input
          type="text"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={copyright}
          onChange={e => setCopyright(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="mr-2"
          id="isActive"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
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