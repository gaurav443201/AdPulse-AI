import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '../types';

interface ApprovalWorkflowProps {
  campaigns: Campaign[];
  onCampaignUpdate: (id: string, updates: Partial<Campaign>) => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ campaigns, onCampaignUpdate }) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns.length > 0 ? campaigns[0].id : '');

  React.useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Determine current step index based on status
  const getStatusIndex = (status: CampaignStatus) => {
    switch(status) {
      case CampaignStatus.DRAFT: return 0;
      case CampaignStatus.PENDING_APPROVAL: return 2;
      case CampaignStatus.APPROVED: return 3;
      case CampaignStatus.LIVE: return 4;
      case CampaignStatus.PAUSED: return 4;
      default: return 0;
    }
  };

  const currentIndex = activeCampaign ? getStatusIndex(activeCampaign.status) : 0;

  const steps = [
    { id: 1, name: 'Draft Creation', role: 'Campaign Manager' },
    { id: 2, name: 'AI Generation', role: 'System' },
    { id: 3, name: 'Approval Review', role: 'Brand Manager' },
    { id: 4, name: 'Ready to Launch', role: 'System' },
    { id: 5, name: 'Campaign Live', role: 'Ad Platform' },
  ];

  const handleStatusChange = (newStatus: CampaignStatus) => {
    if (activeCampaign) {
      onCampaignUpdate(activeCampaign.id, { status: newStatus });
    }
  };

  if (!activeCampaign) {
     return (
        <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
           <p className="text-slate-500">No campaigns available for approval workflow.</p>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Selector Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
         <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Campaign Workflow</label>
            <select 
               value={selectedCampaignId} 
               onChange={(e) => setSelectedCampaignId(e.target.value)}
               className="text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 pb-1 focus:outline-none focus:border-brand-500"
            >
               {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
               ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">{activeCampaign.advertiser} • {activeCampaign.platforms.join(', ')}</p>
         </div>
         <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1
               ${activeCampaign.status === CampaignStatus.LIVE ? 'bg-green-100 text-green-700 border-green-200' : 
                 activeCampaign.status === CampaignStatus.PENDING_APPROVAL ? 'bg-orange-100 text-orange-700 border-orange-200' :
                 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {activeCampaign.status}
            </span>
            <p className="text-xs text-slate-400">Last updated: Today</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Workflow Timeline</h2>
          
          {/* Dynamic Actions */}
          <div className="flex gap-3">
             {activeCampaign.status === CampaignStatus.DRAFT && (
                <button 
                  onClick={() => handleStatusChange(CampaignStatus.PENDING_APPROVAL)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
                >
                   Submit for Approval
                </button>
             )}

             {activeCampaign.status === CampaignStatus.PENDING_APPROVAL && (
                <>
                   <button 
                     onClick={() => handleStatusChange(CampaignStatus.DRAFT)}
                     className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                   >
                      Reject / Request Changes
                   </button>
                   <button 
                     onClick={() => handleStatusChange(CampaignStatus.APPROVED)}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                   >
                      Approve Campaign
                   </button>
                </>
             )}

             {activeCampaign.status === CampaignStatus.APPROVED && (
                <button 
                  onClick={() => handleStatusChange(CampaignStatus.LIVE)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
                >
                   Publish / Go Live
                </button>
             )}

             {activeCampaign.status === CampaignStatus.LIVE && (
                <button 
                  onClick={() => handleStatusChange(CampaignStatus.PAUSED)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                   Pause Campaign
                </button>
             )}
              {activeCampaign.status === CampaignStatus.PAUSED && (
                <button 
                  onClick={() => handleStatusChange(CampaignStatus.LIVE)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
                >
                   Resume Campaign
                </button>
             )}
          </div>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-10 w-0.5 bg-slate-100"></div>

          <div className="space-y-8 relative">
            {steps.map((step, idx) => {
               const isCompleted = idx < currentIndex;
               const isCurrent = idx === currentIndex;
               const isUpcoming = idx > currentIndex;

               return (
                  <div key={step.id} className="flex gap-6 relative group">
                     {/* Icon */}
                     <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shrink-0 z-10 transition-colors duration-300
                        ${isCompleted ? 'border-green-100 bg-green-50 text-green-600' : 
                        isCurrent ? 'border-brand-100 bg-brand-50 text-brand-600 shadow-lg shadow-brand-100' : 
                        'border-slate-100 bg-white text-slate-300'}`}>
                        <i className={`fas ${
                        isCompleted ? 'fa-check' : 
                        isCurrent ? 'fa-hourglass-half fa-spin-pulse' : 'fa-circle'
                        } text-xl`}></i>
                     </div>

                     {/* Content */}
                     <div className={`flex-1 p-5 rounded-xl border transition-all duration-300 ${
                        isCurrent ? 'bg-white border-brand-200 shadow-md ring-1 ring-brand-100' : 
                        isCompleted ? 'bg-slate-50/50 border-slate-200 opacity-80' :
                        'bg-white border-slate-100 opacity-50'
                     }`}>
                        <div className="flex justify-between items-start">
                        <div>
                           <h4 className={`font-bold ${isCurrent ? 'text-brand-900' : 'text-slate-800'}`}>
                              {step.name}
                           </h4>
                           <p className="text-sm text-slate-500 mt-1">Responsible: {step.role}</p>
                        </div>
                        {isCompleted && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Completed</span>}
                        {isCurrent && <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">In Progress</span>}
                        </div>
                        
                        {isCurrent && (
                           <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                              <p className="text-xs text-slate-500">
                                 {step.name === 'Approval Review' 
                                    ? "Waiting for stakeholder approval to proceed."
                                    : "Task is currently active."}
                              </p>
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;