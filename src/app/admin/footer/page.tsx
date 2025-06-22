'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Settings,
  Link,
  Share2,
  Building2,
  X
} from 'lucide-react';
import SectionForm from '@/app/components/footer/SectionForm';
import LinkForm from '@/app/components/footer/LinkForm';
import SocialMediaForm from '@/app/components/footer/SocialMediaForm';
import CompanyInfoForm from '@/app/components/footer/CompanyInfoForm';

interface FooterSection {
  id: string;
  title: string;
  content?: string;
  position: number;
  visible: boolean;
  sectionType: string;
  links: FooterLink[];
  createdAt: string;
  updatedAt: string;
}

interface FooterLink {
  id: string;
  title: string;
  url: string;
  position: number;
  visible: boolean;
  isExternal: boolean;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  visible: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyInfo {
  id: string;
  companyName: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  copyright?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function FooterManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('sections');
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/admin/login');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/admin');
      return;
    }

    fetchFooterData();
  }, [session, status, router]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      
      const [sectionsRes, linksRes, socialMediaRes, companyInfoRes] = await Promise.all([
        fetch('/api/admin/footer/sections'),
        fetch('/api/admin/footer/links'),
        fetch('/api/admin/footer/social-media'),
        fetch('/api/admin/footer/company-info')
      ]);

      if (!sectionsRes.ok) throw new Error('Failed to fetch sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData);
      }

      if (socialMediaRes.ok) {
        const socialMediaData = await socialMediaRes.json();
        setSocialMedia(socialMediaData);
      }

      if (companyInfoRes.ok) {
        const companyInfoData = await companyInfoRes.json();
        setCompanyInfo(companyInfoData);
      }

    } catch (err) {
      setError('Failed to fetch footer data');
      console.error('Error fetching footer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionVisibilityToggle = async (sectionId: string, currentVisibility: boolean) => {
    try {
      const newVisibility = !currentVisibility;
      
      // Update optimistically
      setSections(prev => prev.map(section => 
        section.id === sectionId ? { ...section, visible: newVisibility } : section
      ));

      const response = await fetch(`/api/admin/footer/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newVisibility })
      });

      if (!response.ok) {
        // Revert on error
        setSections(prev => prev.map(section => 
          section.id === sectionId ? { ...section, visible: currentVisibility } : section
        ));
        throw new Error('Failed to update section visibility');
      }

      addToast('success', 'Section visibility updated successfully');
    } catch (err) {
      console.error('Error toggling section visibility:', err);
      addToast('error', 'Failed to update section visibility');
    }
  };

  const handleLinkVisibilityToggle = async (linkId: string, currentVisibility: boolean) => {
    try {
      const newVisibility = !currentVisibility;
      setLinks(prev => prev.map(link =>
        link.id === linkId ? { ...link, visible: newVisibility } : link
      ));
      const response = await fetch(`/api/admin/footer/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newVisibility })
      });
      if (!response.ok) {
        setLinks(prev => prev.map(link =>
          link.id === linkId ? { ...link, visible: currentVisibility } : link
        ));
        throw new Error('Failed to update link visibility');
      }
      addToast('success', 'Link visibility updated successfully');
    } catch (err) {
      console.error('Error toggling link visibility:', err);
      addToast('error', 'Failed to update link visibility');
    }
  };

  const handleSocialMediaVisibilityToggle = async (socialId: string, currentVisibility: boolean) => {
    try {
      const newVisibility = !currentVisibility;
      setSocialMedia(prev => prev.map(social =>
        social.id === socialId ? { ...social, visible: newVisibility } : social
      ));
      const response = await fetch(`/api/admin/footer/social-media/${socialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newVisibility })
      });
      if (!response.ok) {
        setSocialMedia(prev => prev.map(social =>
          social.id === socialId ? { ...social, visible: currentVisibility } : social
        ));
        throw new Error('Failed to update social media visibility');
      }
      addToast('success', 'Social media visibility updated successfully');
    } catch (err) {
      console.error('Error toggling social media visibility:', err);
      addToast('error', 'Failed to update social media visibility');
    }
  };

  const handleSectionSubmit = async (data: Partial<FooterSection>) => {
    try {
      setFormLoading(true);
      const url = editingItem 
        ? `/api/admin/footer/sections/${editingItem.id}`
        : '/api/admin/footer/sections';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          position: data.position,
          visible: Boolean(data.visible),
          sectionType: data.sectionType,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      const result = await response.json();
      
      setSections(prev => {
        if (editingItem) {
          return prev.map(section => section.id === editingItem.id ? result : section);
        }
        return [...prev, result];
      });

      setShowSectionForm(false);
      setEditingItem(null);
      addToast('success', `Section ${editingItem ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving section:', err);
      addToast('error', 'Failed to save section');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLinkSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      const url = editingItem 
        ? `/api/admin/footer/links/${editingItem.id}`
        : '/api/admin/footer/links';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        if (editingItem) {
          setLinks(prev => prev.map(link => 
            link.id === editingItem.id ? result : link
          ));
          addToast('success', 'Link updated successfully');
        } else {
          setLinks(prev => [...prev, result]);
          addToast('success', 'Link created successfully');
        }
        setShowLinkForm(false);
        setEditingItem(null);
      } else {
        addToast('error', 'Failed to save link');
      }
    } catch (err) {
      console.error('Error saving link:', err);
      addToast('error', 'Failed to save link');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSocialMediaSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      const url = editingItem 
        ? `/api/admin/footer/social-media/${editingItem.id}`
        : '/api/admin/footer/social-media';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        if (editingItem) {
          setSocialMedia(prev => prev.map(social => 
            social.id === editingItem.id ? result : social
          ));
          addToast('success', 'Social media updated successfully');
        } else {
          setSocialMedia(prev => [...prev, result]);
          addToast('success', 'Social media created successfully');
        }
        setShowSocialForm(false);
        setEditingItem(null);
      } else {
        addToast('error', 'Failed to save social media');
      }
    } catch (err) {
      console.error('Error saving social media:', err);
      addToast('error', 'Failed to save social media');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCompanyInfoSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      const url = companyInfo 
        ? `/api/admin/footer/company-info/${companyInfo.id}`
        : '/api/admin/footer/company-info';
      
      const response = await fetch(url, {
        method: companyInfo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setCompanyInfo(result);
        addToast('success', companyInfo ? 'Company info updated successfully' : 'Company info created successfully');
        setShowCompanyForm(false);
      } else {
        addToast('error', 'Failed to save company info');
      }
    } catch (err) {
      console.error('Error saving company info:', err);
      addToast('error', 'Failed to save company info');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    switch (type) {
      case 'section':
        setShowSectionForm(true);
        break;
      case 'link':
        setShowLinkForm(true);
        break;
      case 'social':
        setShowSocialForm(true);
        break;
      case 'company':
        setShowCompanyForm(true);
        break;
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/admin/footer/${type}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        switch (type) {
          case 'sections':
            setSections(prev => prev.filter(section => section.id !== id));
            break;
          case 'links':
            setLinks(prev => prev.filter(link => link.id !== id));
            break;
          case 'social-media':
            setSocialMedia(prev => prev.filter(social => social.id !== id));
            break;
        }
        addToast('success', 'Item deleted successfully');
      } else {
        addToast('error', 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      addToast('error', 'Failed to delete item');
    }
  };

  const closeForm = () => {
    setShowSectionForm(false);
    setShowLinkForm(false);
    setShowSocialForm(false);
    setShowCompanyForm(false);
    setEditingItem(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading footer management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchFooterData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Footer Management</h1>
              <p className="text-gray-600">Manage your website footer content and structure</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Preview Footer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Sections
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Link className="w-5 h-5 inline mr-2" />
              Links
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Share2 className="w-5 h-5 inline mr-2" />
              Social Media
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5 inline mr-2" />
              Company Info
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Footer Sections</h2>
              <button 
                onClick={() => setShowSectionForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No footer sections found</p>
                    <button 
                      onClick={() => setShowSectionForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create First Section
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <div key={section.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{section.title}</h3>
                              <p className="text-sm text-gray-500">{section.sectionType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSectionVisibilityToggle(section.id, section.visible)}
                              className={`p-2 rounded-lg ${
                                section.visible 
                                  ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                  : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {section.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleEdit(section, 'section')}
                              className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(section.id, 'sections')}
                              className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {section.links.length > 0 && (
                          <div className="mt-3 pl-8">
                            <p className="text-sm text-gray-500">
                              {section.links.length} link{section.links.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Footer Links</h2>
              <button 
                onClick={() => setShowLinkForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {links.length === 0 ? (
                  <div className="text-center py-8">
                    <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No footer links found</p>
                    <button 
                      onClick={() => setShowLinkForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create First Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {links.map((link) => (
                      <div key={link.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{link.title}</h3>
                              <p className="text-sm text-gray-500">{link.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLinkVisibilityToggle(link.id, link.visible)}
                              className={`p-2 rounded-lg ${
                                link.visible 
                                  ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                  : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {link.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleEdit(link, 'link')}
                              className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(link.id, 'links')}
                              className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Social Media</h2>
              <button 
                onClick={() => setShowSocialForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Social Media
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {socialMedia.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No social media links found</p>
                    <button 
                      onClick={() => setShowSocialForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Social Media
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {socialMedia.map((social) => (
                      <div key={social.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 capitalize">{social.platform}</h3>
                              <p className="text-sm text-gray-500">{social.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSocialMediaVisibilityToggle(social.id, social.visible)}
                              className={`p-2 rounded-lg ${
                                social.visible 
                                  ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                  : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {social.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleEdit(social, 'social')}
                              className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(social.id, 'social-media')}
                              className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
              <button 
                onClick={() => setShowCompanyForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {companyInfo ? 'Edit Company Info' : 'Add Company Info'}
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {!companyInfo ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No company information found</p>
                    <button 
                      onClick={() => setShowCompanyForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Company Information
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{companyInfo.companyName}</h3>
                          <p className="text-sm text-gray-500">{companyInfo.description}</p>
                          {companyInfo.address && (
                            <p className="text-sm text-gray-500 mt-1">{companyInfo.address}</p>
                          )}
                          {companyInfo.phone && (
                            <p className="text-sm text-gray-500">{companyInfo.phone}</p>
                          )}
                          {companyInfo.email && (
                            <p className="text-sm text-gray-500">{companyInfo.email}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            companyInfo.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {companyInfo.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button 
                            onClick={() => handleEdit(companyInfo, 'company')}
                            className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Forms */}
      {(showSectionForm || showLinkForm || showSocialForm || showCompanyForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit' : 'Add'} {
                  showSectionForm ? 'Section' :
                  showLinkForm ? 'Link' :
                  showSocialForm ? 'Social Media' :
                  'Company Info'
                }
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {showSectionForm && (
              <SectionForm
                initialData={editingItem}
                onSubmit={handleSectionSubmit}
                onCancel={closeForm}
                loading={formLoading}
              />
            )}
            
            {showLinkForm && (
              <LinkForm
                initialData={editingItem}
                sectionOptions={sections.map(section => ({
                  value: section.id,
                  label: section.title
                }))}
                onSubmit={handleLinkSubmit}
                onCancel={closeForm}
                loading={formLoading}
              />
            )}
            
            {showSocialForm && (
              <SocialMediaForm
                initialData={editingItem}
                onSubmit={handleSocialMediaSubmit}
                onCancel={closeForm}
                loading={formLoading}
              />
            )}
            
            {showCompanyForm && (
              <CompanyInfoForm
                initialData={editingItem}
                onSubmit={handleCompanyInfoSubmit}
                onCancel={closeForm}
                loading={formLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 