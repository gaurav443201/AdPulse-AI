import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CampaignWizard from './components/CampaignWizard';
import CreativeStudio from './components/CreativeStudio';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import Toast from './components/Toast';
import { Campaign, CreativeAsset, CampaignStatus, ActivityLog } from './types';
import { MOCK_CAMPAIGNS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Initial activity log
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', text: 'System initialized', timestamp: new Date(), type: 'info' }
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  const addActivity = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setActivities(prev => [{
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      type
    }, ...prev]);
  };

  const handleCampaignCreate = (newCampaign: Campaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    addActivity(`New campaign created: ${newCampaign.name}`, 'success');
    showToast(`Campaign "${newCampaign.name}" created successfully!`, 'success');
    // Switch to studio after creation to generate assets
    setActiveTab('creatives');
  };

  const handleAssetsGenerated = (newAssets: CreativeAsset[]) => {
    setAssets(prev => [...prev, ...newAssets]);
    addActivity(`Generated ${newAssets.length} new creative assets`, 'success');
    showToast(`${newAssets.length} creative variations generated`, 'success');
  };

  const handleAssetUpdate = (assetId: string, updates: Partial<CreativeAsset>) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, ...updates } : a));
    if (updates.status === 'Approved') {
      addActivity('Creative asset approved', 'info');
      showToast('Asset approved for publication', 'success');
    }
  };

  const handleCampaignUpdate = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates } : c));
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && updates.status) {
      addActivity(`Campaign "${campaign.name}" status changed to ${updates.status}`, 'warning');
      showToast(`Campaign status updated to ${updates.status}`, 'info');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard campaigns={campaigns} activities={activities} />;
      case 'campaigns':
        return <CampaignWizard onCampaignCreate={handleCampaignCreate} />;
      case 'creatives':
        return (
          <CreativeStudio 
            campaigns={campaigns}
            assets={assets}
            onAssetsGenerated={handleAssetsGenerated}
            onAssetUpdate={handleAssetUpdate}
          />
        );
      case 'workflow':
        return (
          <ApprovalWorkflow 
            campaigns={campaigns} 
            onCampaignUpdate={handleCampaignUpdate}
          />
        );
      default:
        return <Dashboard campaigns={campaigns} activities={activities} />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab} activities={activities}>
        {renderContent()}
      </Layout>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
};

export default App;