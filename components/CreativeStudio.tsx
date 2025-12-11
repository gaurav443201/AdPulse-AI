import React, { useState } from 'react';
import { Campaign, CreativeAsset } from '../types';
import { generateCreativeCopy, validateCompliance } from '../services/geminiService';
import { MOCK_IMAGES } from '../constants';

interface CreativeStudioProps {
  campaigns: Campaign[];
  assets: CreativeAsset[];
  onAssetsGenerated: (assets: CreativeAsset[]) => void;
  onAssetUpdate: (id: string, updates: Partial<CreativeAsset>) => void;
}

const CreativeStudio: React.FC<CreativeStudioProps> = ({ 
  campaigns, 
  assets, 
  onAssetsGenerated, 
  onAssetUpdate 
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns.length > 0 ? campaigns[0].id : '');
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const campaignAssets = assets.filter(a => a.campaignId === selectedCampaignId);

  const handleGenerate = async () => {
    if (!activeCampaign) return;
    
    setIsGenerating(true);
    
    try {
      const promises = activeCampaign.platforms.map(async (platform, index) => {
        const copyData = await generateCreativeCopy(
          activeCampaign.advertiser,
          platform,
          "Premium Product",
          activeCampaign.targetAudience,
          activeCampaign.objective
        );

        const complianceData = await validateCompliance(
          platform,
          copyData.headline,
          copyData.description,
          activeCampaign.advertiser
        );

        const imagePrompt = `${activeCampaign.advertiser} product advertisement ${activeCampaign.objective} ${platform} style high quality retail`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

        return {
          id: `asset-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          campaignId: activeCampaign.id,
          platform: platform,
          type: 'Banner',
          headline: copyData.headline || "Experience Excellence",
          description: copyData.description || "Shop now for the best deals.",
          cta: copyData.cta || "Shop Now",
          imageUrl: imageUrl, 
          complianceScore: complianceData.score || 85,
          complianceIssues: complianceData.issues || [],
          status: 'Generated'
        } as CreativeAsset;
      });

      const newAssets = await Promise.all(promises);
      onAssetsGenerated(newAssets);
    } catch (e) {
      console.error(e);
      alert("Failed to generate assets.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-slide-up">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Creative Studio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Campaign</label>
            <div className="relative">
              <select 
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none appearance-none font-medium text-slate-700"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.advertiser})</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-2">Configuration</div>
            {activeCampaign ? (
              <div className="flex gap-2 text-xs flex-wrap">
                <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 border border-slate-200 truncate max-w-[150px]" title={activeCampaign.targetAudience}>
                  <i className="fas fa-users mr-1"></i>
                  {activeCampaign.targetAudience}
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 border border-slate-200 truncate max-w-[150px]" title={activeCampaign.objective}>
                  <i className="fas fa-bullseye mr-1"></i>
                  {activeCampaign.objective}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No campaign selected</span>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !activeCampaign}
            className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex justify-center items-center gap-2 active:scale-95"
          >
            {isGenerating ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i> Generating...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles"></i> Generate Concepts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeletons or Results */}
      {isGenerating ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
         </div>
      ) : campaignAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {campaignAssets.map((asset, idx) => (
            <div key={asset.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CreativeCard 
                asset={asset} 
                onUpdate={(updates) => onAssetUpdate(asset.id, updates)} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <i className="fas fa-paint-brush text-slate-300 text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Ready to create?</h3>
          <p className="text-slate-500 text-sm max-w-xs mt-2">
            {activeCampaign ? "Click 'Generate Concepts' to let our AI design creative assets for this campaign." : "Select a campaign above to get started."}
          </p>
        </div>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[400px] animate-pulse">
    <div className="md:w-1/2 bg-slate-200 h-full relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
    <div className="md:w-1/2 p-6 flex flex-col space-y-4">
      <div className="flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      </div>
      <div className="space-y-2 flex-1 pt-4">
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4 mt-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-slate-200 rounded flex-1"></div>
        <div className="h-10 bg-slate-200 rounded flex-1"></div>
      </div>
    </div>
  </div>
);

interface CreativeCardProps {
  asset: CreativeAsset;
  onUpdate: (updates: Partial<CreativeAsset>) => void;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ asset, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ headline: asset.headline, description: asset.description });
  
  const isCompliant = asset.complianceScore >= 80;
  const isApproved = asset.status === 'Approved';

  const handleSave = () => {
    onUpdate({ headline: editForm.headline, description: editForm.description });
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col md:flex-row h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isApproved ? 'shadow-green-100 border-green-200 ring-1 ring-green-400' : 'shadow-slate-200/50 border-slate-100'}`}>
      {/* Visual Preview */}
      <div className="md:w-1/2 relative group overflow-hidden bg-gray-100 min-h-[300px]">
        <img 
          src={asset.imageUrl} 
          alt="Ad Creative" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
             (e.target as HTMLImageElement).src = MOCK_IMAGES[0];
          }}
        />
        {/* Mock Ad Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
          <p className="text-white text-lg font-bold leading-tight mb-3 drop-shadow-md font-sans">{isEditing ? editForm.headline : asset.headline}</p>
          <button className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full w-fit hover:bg-gray-100 transition-colors uppercase tracking-wide">
            {asset.cta}
          </button>
        </div>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-md text-xs font-medium flex gap-2 border border-white/10">
          <span>{asset.platform}</span>
          {isApproved && <span className="bg-green-500 text-white px-1.5 rounded-sm ml-1 flex items-center"><i className="fas fa-check text-[10px]"></i></span>}
        </div>
      </div>

      {/* Data & Compliance */}
      <div className="md:w-1/2 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Copy & Compliance</h4>
          <span className={`px-2 py-1 rounded text-xs font-bold border ${isCompliant ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            Score: {asset.complianceScore}%
          </span>
        </div>

        <div className="space-y-4 flex-1">
          {isEditing ? (
            <div className="space-y-3 animate-fade-in">
               <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">Headline</label>
                  <input 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                    value={editForm.headline} 
                    onChange={e => setEditForm({...editForm, headline: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">Description</label>
                  <textarea 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                    rows={3}
                    value={editForm.description} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                  />
               </div>
            </div>
          ) : (
            <>
              <div className="group">
                <label className="text-xs text-slate-400 uppercase font-bold group-hover:text-brand-600 transition-colors">Headline</label>
                <p className="text-sm text-slate-700 font-medium">{asset.headline}</p>
              </div>
              <div className="group">
                <label className="text-xs text-slate-400 uppercase font-bold group-hover:text-brand-600 transition-colors">Description</label>
                <p className="text-sm text-slate-600 leading-relaxed">{asset.description}</p>
              </div>
            </>
          )}
          
          {asset.complianceIssues.length > 0 && !isEditing && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 animate-fade-in">
              <p className="text-xs font-bold text-orange-800 mb-1 flex items-center gap-1">
                <i className="fas fa-exclamation-triangle"></i> Compliance Flags
              </p>
              <ul className="list-none text-xs text-orange-700 space-y-1">
                {asset.complianceIssues.map((issue, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="mt-1 w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            {isEditing ? (
               <button 
                onClick={handleSave}
                className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/10"
               >
                 Save Changes
               </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  disabled={isApproved}
                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onUpdate({ status: 'Approved' })}
                  disabled={isApproved}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all shadow-md ${isApproved ? 'bg-green-100 text-green-700 cursor-default shadow-none' : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg shadow-brand-500/20'}`}
                >
                  {isApproved ? (
                    <>
                      <i className="fas fa-check mr-1"></i> Approved
                    </>
                  ) : 'Approve'}
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;