import React, { useState, useRef, useEffect } from 'react';
import { parseCampaignRequest } from '../services/geminiService';
import { Campaign, CampaignStatus, ChatMessage } from '../types';

interface CampaignWizardProps {
  onCampaignCreate: (campaign: Campaign) => void;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onCampaignCreate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AdPulse AI assistant. Tell me about the retail media campaign you want to launch. For example: "I want to run a Nike summer sale on Amazon and Walmart with a $50k budget."',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [draftCampaign, setDraftCampaign] = useState<Partial<Campaign>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // Call Gemini
      const result = await parseCampaignRequest(userMsg.content, draftCampaign);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.conversationalResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Update draft campaign state with extracted data
      if (result) {
        setDraftCampaign(prev => ({
          ...prev,
          ...result,
          // Ensure we don't overwrite with undefined if Gemini missed something but we had it
        }));
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = () => {
    if (!draftCampaign.name || !draftCampaign.advertiser) return;
    
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      name: draftCampaign.name || 'New Campaign',
      advertiser: draftCampaign.advertiser as any,
      budget: draftCampaign.budget || 0,
      startDate: draftCampaign.startDate || new Date().toISOString().split('T')[0],
      endDate: draftCampaign.endDate || '',
      objective: draftCampaign.objective || 'Awareness',
      platforms: draftCampaign.platforms || [],
      targetAudience: draftCampaign.targetAudience || 'General',
      status: CampaignStatus.DRAFT,
      progress: 0
    };
    
    onCampaignCreate(newCampaign);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <span className={`text-xs mt-2 block opacity-70 ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your campaign (e.g., 'Target coffee lovers on Amazon')..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isProcessing}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <i className="fas fa-paper-plane mr-2"></i> Send
            </button>
          </div>
        </div>
      </div>

      {/* Live Campaign Draft Preview */}
      <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <i className="fas fa-file-contract text-brand-500"></i>
            Live Draft
          </h3>
        </div>
        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Completeness</span>
              <span>{Math.round(Object.keys(draftCampaign).length / 7 * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-500"
                style={{ width: `${Object.keys(draftCampaign).length / 7 * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <DraftField label="Advertiser" value={draftCampaign.advertiser} icon="fa-building" />
            <DraftField label="Campaign Name" value={draftCampaign.name} icon="fa-tag" />
            <DraftField label="Budget" value={draftCampaign.budget ? `$${draftCampaign.budget.toLocaleString()}` : ''} icon="fa-dollar-sign" />
            <DraftField label="Dates" value={draftCampaign.startDate ? `${draftCampaign.startDate} -> ${draftCampaign.endDate || '?'}` : ''} icon="fa-calendar" />
            <DraftField label="Platforms" value={draftCampaign.platforms?.join(', ')} icon="fa-layer-group" />
            <DraftField label="Target" value={draftCampaign.targetAudience} icon="fa-users" />
            <DraftField label="Objective" value={draftCampaign.objective} icon="fa-bullseye" />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleFinalize}
            disabled={!draftCampaign.advertiser || !draftCampaign.name}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

const DraftField = ({ label, value, icon }: any) => (
  <div className="group">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
      <i className={`fas ${icon} text-[10px]`}></i> {label}
    </label>
    <div className={`text-sm py-1 border-b border-dashed ${value ? 'text-slate-800 border-slate-300' : 'text-slate-400 italic border-slate-200'}`}>
      {value || 'Not specified'}
    </div>
  </div>
);

export default CampaignWizard;