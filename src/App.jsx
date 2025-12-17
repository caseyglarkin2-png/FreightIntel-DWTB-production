import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  MessageSquare, 
  Radio, 
  Settings, 
  Search, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  FileText, 
  Send,
  Brain,
  Zap,
  Eye,
  BarChart3,
  Terminal,
  ChevronRight,
  User,
  Save,
  Loader2,
  Trash2,
  ExternalLink,
  Filter,
  Rss
} from 'lucide-react';

// Feed Service
import { 
  fetchAllFeeds, 
  fetchRedditPosts, 
  DEFAULT_FEEDS,
  filterNewsByKeywords,
  fetchFeed 
} from './services/feedService';

// Components
import FeedManagementModal from './components/FeedManagementModal';

// --- LOCAL STORAGE HELPERS (No Firebase needed) ---
const STORAGE_KEY = 'freightintel_prospects';
const FEEDS_KEY = 'freightintel_feeds';

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

/**
 * MOCK DATA (News Only - Prospects are now Real)
 */
const MOCK_NEWS = [
  {
    id: 1,
    source: 'FreightWaves',
    title: 'Port Strike Imminent: East Coast Labor Talks Stall',
    category: 'Macro Shock',
    impact: 'High',
    time: '2 hours ago',
    summary: 'ILA union leaders have walked away from the table. Expect massive capacity tightening in Q4.'
  },
  {
    id: 2,
    source: 'JOC',
    title: 'ELD Mandate Enforcement Ramps Up in Southwest',
    category: 'Compliance',
    impact: 'Medium',
    time: '4 hours ago',
    summary: 'DOT announces strict "no exceptions" policy for older AOBRD devices starting next month.'
  },
  {
    id: 3,
    source: 'Transport Topics',
    title: 'C.H. Robinson Reports Q3 Earnings',
    category: 'General',
    impact: 'Low',
    time: '5 hours ago',
    summary: 'Revenue down 5% YoY, but margins holding steady due to cost cutting.'
  }
];

// The "Croc Brain" Voice Generator Logic
const generateMockMessage = (prospect, type = 'outreach') => {
  if (type === 'outreach') {
    const firstName = prospect.name.split(' ')[0];
    return {
      subject: `Re: The ${prospect.company} supply chain strategy`,
      body: `${firstName},\n\nSaw the recent updates at ${prospect.company}. Congratulations on the growth.\n\nHowever, I just pulled the SONAR data for your key lanes—rejection rates (OTRI) hit 15% this morning. Capacity is drying up faster than forecasted.\n\nAre you relying on contract paper that's about to fail when the holiday rush hits, or do you have a spot hedge in place?\n\nElite operators aren't crossing their fingers right now. Let's pressure test your Q4 routing guide.\n\n- [Your Name]`,
      analysis: {
        fear: 'Mentions "contract paper about to fail" and rising rejection rates.',
        status: 'Appeals to "Elite operators" logic.',
        simplicity: 'Direct question: Do you have a hedge or not?',
        score: 'A+'
      }
    };
  }
  return null;
};

const generateMockPost = (newsItem) => {
  return {
    content: `Everyone is panicking about the ${newsItem.title}.\n\n"Oh no, costs are going up." (Table stakes observation).\n\nThe real story isn't the rate hike. It's the dwell time that's going to kill your margins while you argue over pennies.\n\nIf you aren't pre-booking capacity now, you're essentially swimming naked when the tide goes out.\n\nDon't be a tourist in this market.\n\n#FreightMath #Logistics #SupplyChain`,
    type: 'Hot Take'
  };
};

/**
 * COMPONENTS
 */

const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300 flex-shrink-0">
    <div className="p-6 flex items-center gap-3 border-b border-slate-800">
      <div className="bg-emerald-500/20 p-2 rounded-lg">
        <Brain className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <h1 className="font-bold text-white tracking-tight">FreightIntel</h1>
        <p className="text-xs text-slate-500">Engine v1.1.0 (Live)</p>
      </div>
    </div>
    
    <nav className="flex-1 p-4 space-y-2">
      <button 
        onClick={() => setActiveTab('dashboard')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800'}`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="font-medium">Sniper Dashboard</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('social')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'social' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800'}`}
      >
        <Radio className="w-4 h-4" />
        <span className="font-medium">Social Center</span>
      </button>

      <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        System
      </div>

      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-400">
        <Terminal className="w-4 h-4" />
        <span>Agent Logs</span>
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-400">
        <Settings className="w-4 h-4" />
        <span>Voice Config</span>
      </button>
    </nav>

    <div className="p-4 border-t border-slate-800">
      <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-emerald-400 font-medium">System Online</span>
      </div>
    </div>
  </div>
);

const AgentStatus = ({ step, currentStep }) => {
  const isActive = step === currentStep;
  const isComplete = currentStep > step;

  const getIcon = () => {
    if (step === 1) return <Search className="w-4 h-4" />;
    if (step === 2) return <Target className="w-4 h-4" />;
    if (step === 3) return <Zap className="w-4 h-4" />;
    if (step === 4) return <CheckCircle2 className="w-4 h-4" />;
    return <Send className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (step === 1) return "Researching Target";
    if (step === 2) return "Applying 'Croc Brain'";
    if (step === 3) return "Synthesizing Voice";
    if (step === 4) return "Critic Review";
    return "Ready";
  };

  return (
    <div className={`flex items-center gap-2 transition-all duration-300 ${isActive ? 'opacity-100 scale-105' : 'opacity-40'}`}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center border
        ${isActive ? 'bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
          isComplete ? 'bg-slate-800 text-emerald-500 border-emerald-900' : 'bg-slate-800 text-slate-500 border-slate-700'}
      `}>
        {getIcon()}
      </div>
      {isActive && <span className="text-sm font-medium text-emerald-400 animate-pulse">{getLabel()}</span>}
    </div>
  );
};

// Modal for adding new prospects
const AddProspectModal = ({ isOpen, onClose, onAdd, isSubmitting }) => {
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onAdd({
      name: formData.get('name'),
      company: formData.get('company'),
      title: formData.get('title'),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Add New Target</h3>
          <p className="text-sm text-slate-400">Add a high-value prospect to the Engine.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
            <input 
              name="name" 
              required 
              placeholder="e.g. John Smith"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Company</label>
            <input 
              name="company" 
              required 
              placeholder="e.g. Acme Logistics"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
            <input 
              name="title" 
              required 
              placeholder="e.g. VP of Supply Chain"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProspectDetail = ({ prospect, onBack, onDelete }) => {
  const [generationStep, setGenerationStep] = useState(0); 
  const [draft, setDraft] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (generationStep > 0 && generationStep < 5) {
      const timer = setTimeout(() => {
        setGenerationStep(curr => curr + 1);
      }, 1200); 
      return () => clearTimeout(timer);
    }
    if (generationStep === 5 && !draft) {
      setDraft(generateMockMessage(prospect));
    }
  }, [generationStep, draft, prospect]);

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {prospect.name} <span className="text-sm font-normal text-slate-500">via LinkedIn</span>
            </h2>
            <p className="text-slate-400 text-sm">{prospect.title} at {prospect.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => onDelete(prospect.id)}
             className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-full hover:bg-red-900/10 mr-2"
             title="Delete Prospect"
           >
             <Trash2 className="w-4 h-4" />
           </button>
           <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
             Turtle Score: {prospect.score}
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Column: Dossier */}
        <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto bg-slate-900/30">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Intel Dossier</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Activity className="w-4 h-4" />
                <span className="font-medium text-sm">Market Signals</span>
              </div>
              <ul className="space-y-2">
                {prospect.signals && prospect.signals.map((signal, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    {signal}
                  </li>
                ))}
                {!prospect.signals || prospect.signals.length === 0 ? (
                  <li className="text-sm text-slate-500 italic">No specific signals detected yet.</li>
                ) : null}
                <li className="text-sm text-slate-300 flex items-start gap-2">
                   <span className="text-emerald-500 mt-1">•</span>
                   HQ Zip Code shows +15% Rejection Rate (SONAR)
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Psych Profile (Croc Brain)</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Prospect shows signs of <span className="text-white">risk aversion</span>. 
                <br/><br/>
                <strong>Recommended Angle:</strong> Fear of Loss (Margin Insurance).
              </p>
            </div>
            
            {generationStep === 0 && (
              <button 
                onClick={() => setGenerationStep(1)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
              >
                <Zap className="w-4 h-4" />
                Activate Sniper Engine
              </button>
            )}

            {generationStep > 0 && generationStep < 5 && (
               <div className="space-y-4 py-8">
                 <AgentStatus step={1} currentStep={generationStep} />
                 <AgentStatus step={2} currentStep={generationStep} />
                 <AgentStatus step={3} currentStep={generationStep} />
                 <AgentStatus step={4} currentStep={generationStep} />
               </div>
            )}
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col relative">
          {generationStep < 5 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-slate-800 rounded-full animate-spin border-t-emerald-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <p>Waiting for Agent Output...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4" /> Draft Generated
                 </h3>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setShowAnalysis(!showAnalysis)}
                     className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-700"
                   >
                     {showAnalysis ? 'Hide' : 'Show'} Croc Logic
                   </button>
                 </div>
              </div>

              {/* The Draft */}
              <div className="flex-1 bg-white rounded-lg text-slate-900 p-8 shadow-2xl overflow-y-auto font-mono text-sm leading-relaxed max-w-3xl mx-auto w-full">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <p className="text-gray-500 text-xs mb-1">Subject Line:</p>
                  <input 
                    type="text" 
                    defaultValue={draft?.subject}
                    className="w-full font-bold text-gray-900 text-lg border-none focus:ring-0 p-0"
                  />
                </div>
                <textarea 
                  className="w-full h-full resize-none border-none focus:ring-0 p-0 text-gray-800 font-sans text-base"
                  defaultValue={draft?.body}
                />
              </div>

              {/* Analysis Overlay */}
              {showAnalysis && (
                <div className="absolute top-6 right-6 w-72 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-4 animate-in fade-in slide-in-from-right-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Psychological Triggers</h4>
                  <div className="space-y-3">
                    <div className="p-2 bg-red-900/20 border border-red-900/30 rounded">
                      <p className="text-xs text-red-400 font-bold mb-1">FEAR (Survival)</p>
                      <p className="text-xs text-slate-400">{draft?.analysis.fear}</p>
                    </div>
                    <div className="p-2 bg-amber-900/20 border border-amber-900/30 rounded">
                      <p className="text-xs text-amber-400 font-bold mb-1">STATUS (Tribalism)</p>
                      <p className="text-xs text-slate-400">{draft?.analysis.status}</p>
                    </div>
                    <div className="p-2 bg-emerald-900/20 border border-emerald-900/30 rounded">
                      <p className="text-xs text-emerald-400 font-bold mb-1">SIMPLICITY (Contrast)</p>
                      <p className="text-xs text-slate-400">{draft?.analysis.simplicity}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                  Discard
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-700">
                  Regenerate (Edit Voice)
                </button>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Approve & Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ prospects, onSelectProspect, onAddClick }) => (
  <div className="p-8 h-full overflow-y-auto">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Sniper Dashboard</h2>
        <p className="text-slate-400">Turtle Trader Protocol: <span className="text-emerald-400">Active</span></p>
      </div>
      <button 
        onClick={onAddClick}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Target
      </button>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-500 text-xs uppercase font-medium">Pipeline Value</p>
        <p className="text-2xl font-bold text-white mt-1">
           ${((prospects.length * 150000)/1000000).toFixed(1)}M
        </p>
        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
          <TrendingUp className="w-3 h-3" /> Live Estimate
        </div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-500 text-xs uppercase font-medium">Whale Targets</p>
        <p className="text-2xl font-bold text-white mt-1">
          {prospects.filter(p => p.score > 85).length}
        </p>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-500 text-xs uppercase font-medium">Response Rate</p>
        <p className="text-2xl font-bold text-white mt-1">--%</p>
        <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
          <Activity className="w-3 h-3" /> Not enough data
        </div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-500 text-xs uppercase font-medium">Drafts Pending</p>
        <p className="text-2xl font-bold text-amber-400 mt-1">
          {prospects.filter(p => p.status === 'Draft Ready').length}
        </p>
      </div>
    </div>

    {/* List */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-white">Target List ({prospects.length})</h3>
        <div className="flex gap-2 text-sm">
           <span className="text-slate-500">Sort by:</span>
           <span className="text-emerald-400 cursor-pointer">Score (High-Low)</span>
        </div>
      </div>
      
      {prospects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Target className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-slate-400">No Targets Yet</p>
          <p className="text-sm mb-6">Your sniper list is empty.</p>
          <button 
            onClick={onAddClick}
            className="px-4 py-2 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 rounded-lg text-sm transition-all"
          >
            Add your first target
          </button>
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-sm">
              <th className="px-6 py-3 font-medium">Prospect</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Turtle Score</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {prospects.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => onSelectProspect(p)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{p.company}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.score}%` }} />
                    </div>
                    <span className="text-sm font-mono text-emerald-400">{p.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${p.status === 'Draft Ready' ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 
                      p.status === 'Researching' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 justify-end w-full">
                    Engage <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

const SocialCenter = ({ customFeeds = [], onAddFeed, onDeleteFeed }) => {
  const [selectedNews, setSelectedNews] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeReddit, setIncludeReddit] = useState(true);
  const [filterImpact, setFilterImpact] = useState('all'); // 'all', 'High', 'Medium'
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showFeedModal, setShowFeedModal] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      // Fetch from default feeds + custom feeds
      const allFeeds = [...DEFAULT_FEEDS, ...customFeeds.map(f => ({ name: f.name, url: f.url }))];
      
      const [feedNews, redditPosts] = await Promise.all([
        fetchAllFeeds(allFeeds),
        includeReddit ? fetchRedditPosts() : Promise.resolve([])
      ]);
      
      let allNews = [...feedNews, ...redditPosts];
      
      // Apply impact filter
      if (filterImpact !== 'all') {
        allNews = allNews.filter(item => item.impact === filterImpact);
      }
      
      setNewsItems(allNews);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [includeReddit, filterImpact, customFeeds]);

  const handleGenerate = (item) => {
    setSelectedNews(item);
    setGeneratedPost(null);
    setTimeout(() => {
      setGeneratedPost(generateMockPost(item));
    }, 1500);
  };

  const handleRefresh = () => {
    loadNews();
  };

  return (
    <div className="h-full flex flex-col p-8">
       <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Social Media Center</h2>
            <p className="text-slate-400">Real-time Industry News & Thought Leadership</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFeedModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage Feeds
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">Impact:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'High', 'Medium'].map(level => (
              <button
                key={level}
                onClick={() => setFilterImpact(level)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterImpact === level
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {level === 'all' ? 'All' : level}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              id="includeReddit"
              checked={includeReddit}
              onChange={(e) => setIncludeReddit(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="includeReddit" className="text-sm text-slate-400">Include Reddit</label>
          </div>
          
          <div className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Feed */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
          {loading && newsItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <RefreshCw className="w-8 h-8 mb-4 animate-spin text-emerald-400" />
              <p className="text-lg font-medium text-slate-400">Loading live feeds...</p>
              <p className="text-sm">Fetching from FreightWaves, JOC, Transport Topics & more</p>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Rss className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-400">No news items</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            newsItems.map(news => (
            <div 
              key={news.id} 
              onClick={() => handleGenerate(news)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedNews?.id === news.id 
                ? 'bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-900/10' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{news.source}</span>
                <span className="text-xs text-slate-500">{news.time}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{news.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{news.summary}</p>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                  news.category === 'Macro Shock' 
                    ? 'bg-red-900/20 text-red-400 border-red-900/30 font-bold'
                    : news.category === 'Compliance'
                    ? 'bg-amber-900/20 text-amber-400 border-amber-900/30'
                    : news.category === 'Community Discussion'
                    ? 'bg-purple-900/20 text-purple-400 border-purple-900/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {news.category}
                </span>
                
                {news.impact === 'High' && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    HIGH IMPACT
                  </span>
                )}
                
                {news.link && (
                  <a 
                    href={news.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                <button
                  onClick={() => handleGenerate(news)}
                  className="text-xs text-emerald-400 font-medium ml-auto flex items-center gap-1 hover:underline"
                >
                  <Zap className="w-3 h-3" /> Generate Take
                </button>
              </div>
            </div>
          )))}
        </div>

        {/* Post Preview */}
        <div className="w-1/2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Generated Content</h3>
          
          {selectedNews && !generatedPost ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
               <div className="w-8 h-8 border-2 border-slate-700 rounded-full animate-spin border-t-emerald-500 mb-4"></div>
               <p>Applying "Contrarian" Filter...</p>
            </div>
          ) : generatedPost ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white rounded-lg p-6 shadow-xl mb-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">FM</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">The Freight Marketer</div>
                    <div className="text-xs text-slate-500">Just now • <GlobeIcon className="w-3 h-3 inline" /></div>
                  </div>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generatedPost.content}
                </div>
              </div>
              
              <div className="mt-auto flex gap-3">
                 <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium border border-slate-700 transition-colors">
                   Edit Draft
                 </button>
                 <button className="flex-1 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-colors">
                   <Send className="w-4 h-4" /> Post to LinkedIn
                 </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-lg">
              Select a news item to generate a "Hot Take"
            </div>
          )}
        </div>
      </div>
      
      {/* Feed Management Modal */}
      <FeedManagementModal 
        isOpen={showFeedModal} 
        onClose={() => setShowFeedModal(false)}
        customFeeds={customFeeds}
        onAddFeed={onAddFeed}
        onDeleteFeed={onDeleteFeed}
      />
    </div>
  );
};

// Helper Icon
const GlobeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zM2.05 8a5.94 5.94 0 0 1 1.7-4.14l.02-.02c.03-.03.06-.06.09-.09A5.92 5.92 0 0 1 8 2.05v11.9a5.92 5.92 0 0 1-5.95-5.95zm6.9 5.95V2.05a5.92 5.92 0 0 1 5.95 5.95 5.92 5.92 0 0 1-5.95 5.95z"/>
  </svg>
);

/**
 * MAIN LAYOUT
 */
export default function FreightEngineApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // App State - Using Local Storage (No Firebase needed)
  const [prospects, setProspects] = useState([]);
  const [customFeeds, setCustomFeeds] = useState([]);

  // Load data from local storage on mount
  useEffect(() => {
    setProspects(loadFromStorage(STORAGE_KEY, []));
    setCustomFeeds(loadFromStorage(FEEDS_KEY, []));
  }, []);

  // Save prospects whenever they change
  useEffect(() => {
    if (prospects.length > 0) {
      saveToStorage(STORAGE_KEY, prospects);
    }
  }, [prospects]);

  // Save feeds whenever they change
  useEffect(() => {
    if (customFeeds.length > 0) {
      saveToStorage(FEEDS_KEY, customFeeds);
    }
  }, [customFeeds]);

  // Handlers
  const handleSelectProspect = (prospect) => {
    setSelectedProspect(prospect);
  };

  const handleBackToDashboard = () => {
    setSelectedProspect(null);
  };

  const handleAddProspect = (data) => {
    setIsSubmitting(true);
    
    // Generate score and create prospect
    const randomScore = Math.floor(Math.random() * (98 - 60 + 1) + 60);
    const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const newProspect = {
      id: Date.now().toString(),
      ...data,
      score: randomScore,
      status: 'New',
      lastActivity: 'Just added',
      signals: [],
      avatar: initials,
      createdAt: new Date().toISOString()
    };
    
    setProspects(prev => [...prev, newProspect].sort((a, b) => b.score - a.score));
    setIsAddModalOpen(false);
    setIsSubmitting(false);
  };

  const handleDeleteProspect = (id) => {
    if (confirm('Are you sure you want to remove this target?')) {
      setProspects(prev => prev.filter(p => p.id !== id));
      setSelectedProspect(null);
    }
  };

  const handleAddFeed = (feed) => {
    const newFeed = {
      id: Date.now().toString(),
      ...feed,
      createdAt: new Date().toISOString()
    };
    setCustomFeeds(prev => [...prev, newFeed]);
  };

  const handleDeleteFeed = (id) => {
    setCustomFeeds(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProspect(null); }} />
      
      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
        {activeTab === 'dashboard' && !selectedProspect && (
          <Dashboard 
            prospects={prospects} 
            onSelectProspect={handleSelectProspect} 
            onAddClick={() => setIsAddModalOpen(true)}
          />
        )}
        
        {activeTab === 'dashboard' && selectedProspect && (
          <ProspectDetail 
            prospect={selectedProspect} 
            onBack={handleBackToDashboard}
            onDelete={handleDeleteProspect}
          />
        )}

        {activeTab === 'social' && (
          <SocialCenter 
            customFeeds={customFeeds} 
            onAddFeed={handleAddFeed} 
            onDeleteFeed={handleDeleteFeed} 
          />
        )}
      </main>

      {/* Modals */}
      <AddProspectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProspect}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
