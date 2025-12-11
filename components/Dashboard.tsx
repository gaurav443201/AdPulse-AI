import React from 'react';
import { Campaign, CampaignStatus, ActivityLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  campaigns: Campaign[];
  activities: ActivityLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ campaigns, activities }) => {
  // Calculate dynamic stats
  const totalSpend = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const activeCount = campaigns.filter(c => c.status === CampaignStatus.LIVE).length;
  const pendingCount = campaigns.filter(c => c.status === CampaignStatus.PENDING_APPROVAL).length;
  
  // Dynamic Chart Data based on actual campaigns
  const platformSpend: Record<string, number> = {};
  
  campaigns.forEach(c => {
    const budgetPerPlatform = c.budget / c.platforms.length;
    c.platforms.forEach(p => {
      const shortName = p.split(' ')[0];
      platformSpend[shortName] = (platformSpend[shortName] || 0) + budgetPerPlatform;
    });
  });

  const chartData = Object.keys(platformSpend).map(key => ({
    name: key,
    spend: Math.round(platformSpend[key]),
    roas: (2.5 + Math.random() * 2).toFixed(1)
  }));

  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Amazon', spend: 0, roas: 0 },
    { name: 'Walmart', spend: 0, roas: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Stats - Staggered Fade In */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Budget" 
          value={`$${(totalSpend / 1000).toFixed(1)}k`} 
          trend="Across all campaigns" 
          icon="fa-dollar-sign" 
          color="text-green-600" 
          bg="bg-green-50"
          delay="0s" 
        />
        <StatCard 
          title="Live Campaigns" 
          value={activeCount.toString()} 
          trend="Currently running" 
          icon="fa-bullhorn" 
          color="text-brand-600" 
          bg="bg-brand-50"
          delay="0.1s" 
        />
        <StatCard 
          title="Avg ROAS" 
          value="3.4x" 
          trend="Simulated Metric" 
          icon="fa-chart-line" 
          color="text-purple-600" 
          bg="bg-purple-50"
          delay="0.2s" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={pendingCount.toString()} 
          trend="Needs attention" 
          icon="fa-clock" 
          color="text-orange-600" 
          bg="bg-orange-50"
          delay="0.3s" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Planned Spend by Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalChartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="spend" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
                  {finalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed - Dynamic */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Live Activity</h3>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {activities.length === 0 && (
                <p className="text-sm text-slate-400 italic">No recent activity.</p>
            )}
            {activities.map((activity) => (
               <ActivityItem 
                  key={activity.id}
                  text={activity.text}
                  time={activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  type={activity.type}
               />
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-800">All Campaigns</h3>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">{campaigns.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Platforms</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <i className="fas fa-folder-open text-3xl text-slate-300"></i>
                       <p>No campaigns found.</p>
                       <button className="text-brand-600 font-medium hover:underline text-sm">Create your first campaign</button>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-brand-600 transition-colors">{campaign.name}</td>
                    <td className="px-6 py-4 text-slate-600">{campaign.advertiser}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {campaign.platforms.map((p, i) => (
                          <div key={i} title={p} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-600 font-bold shadow-sm z-10 hover:z-20 hover:scale-110 transition-transform cursor-help">
                            {p.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">${campaign.budget.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-6 py-4 w-32">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${campaign.progress}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, color, bg, delay }: any) => (
  <div 
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
      <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${trend.includes('+') ? 'text-green-600' : 'text-slate-400'}`}>
        {trend.includes('+') && <i className="fas fa-arrow-up text-[10px]"></i>}
        {trend}
      </span>
    </div>
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} shadow-sm`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
  </div>
);

const ActivityItem = ({ text, time, type }: any) => {
  let icon = 'fa-info-circle';
  let colorClass = 'bg-blue-100 text-blue-600';

  if (type === 'success') { icon = 'fa-check-circle'; colorClass = 'bg-green-100 text-green-600'; }
  if (type === 'warning') { icon = 'fa-exclamation-circle'; colorClass = 'bg-orange-100 text-orange-600'; }
  if (type === 'error') { icon = 'fa-times-circle'; colorClass = 'bg-red-100 text-red-600'; }

  return (
    <div className="flex gap-3 items-start animate-fade-in">
      <div className={`mt-0.5 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
        <i className={`fas ${icon} text-xs`}></i>
      </div>
      <div>
        <p className="text-sm text-slate-800 font-medium leading-snug">{text}</p>
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const styles: Record<string, string> = {
    [CampaignStatus.LIVE]: 'bg-green-50 text-green-700 border-green-200 ring-green-500/20',
    [CampaignStatus.APPROVED]: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    [CampaignStatus.PENDING_APPROVAL]: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20',
    [CampaignStatus.DRAFT]: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
    [CampaignStatus.PAUSED]: 'bg-slate-50 text-slate-500 border-slate-200 ring-slate-400/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ring-1 ${styles[status] || styles[CampaignStatus.DRAFT]}`}>
      {status}
    </span>
  );
};

export default Dashboard;