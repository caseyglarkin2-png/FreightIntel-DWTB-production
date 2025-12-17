import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  fetchFeed,
  getTrendingTopics
} from './services/feedService';

// Components
import FeedManagementModal from './components/FeedManagementModal';
import WebGLBackground from './components/WebGLBackground';

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
 * Top navigation bar for global search + quick nav
 */
const TopBar = ({ onSearch, onAddClick, onOpenSocial, searchInputRef }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/80 border-b border-slate-900 px-8 py-4 flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <Radio className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">FreightIntel Engine</p>
          <p className="text-sm text-slate-400">Navigate leads, signals, and social in one place</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-emerald-500/50">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search targets, companies, signals"
            className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-slate-600"
          />
          <button type="submit" className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white">Search</button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSocial}
          className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm font-medium hover:border-emerald-500/40 hover:text-white"
        >
          Social Center
        </button>
        <button
          onClick={onAddClick}
          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Target
        </button>
      </div>
    </header>
  );
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

const Sidebar = ({ activeTab, setActiveTab, totalTargets = 0, whaleCount = 0, draftCount = 0 }) => (
  <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300 flex-shrink-0 vibe-card">
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
      <div className="text-xs text-slate-500 uppercase tracking-[0.15em] px-2 mb-1">Navigate</div>
      <button 
        onClick={() => setActiveTab('dashboard')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-transparent hover:bg-slate-800'}`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <div className="flex-1 text-left">
          <span className="font-medium">Sniper Dashboard</span>
          <p className="text-[11px] text-slate-500">Targets & outreach</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{totalTargets}</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('social')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${activeTab === 'social' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-transparent hover:bg-slate-800'}`}
      >
        <Radio className="w-4 h-4" />
        <div className="flex-1 text-left">
          <span className="font-medium">Social Center</span>
          <p className="text-[11px] text-slate-500">Live signals & posts</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{draftCount}</span>
      </button>

      <div className="text-xs text-slate-500 uppercase tracking-[0.15em] px-2 pt-3">Rollup</div>
      <div className="grid grid-cols-2 gap-2 px-1">
        <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-3">
          <p className="text-[11px] text-slate-500">Whales</p>
          <p className="text-lg font-semibold text-white">{whaleCount}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-3">
          <p className="text-[11px] text-slate-500">Drafts</p>
          <p className="text-lg font-semibold text-amber-300">{draftCount}</p>
        </div>
      </div>

      <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">System</div>
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
      <div className="bg-slate-800/60 rounded-lg p-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <span className="text-xs text-emerald-400 font-medium block">System Online</span>
          <span className="text-[11px] text-slate-500">Cmd + / opens search</span>
        </div>
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingRef.current) return;
      setDragOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };
    const handleUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleDragStart = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };
  };

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
    <div className="fixed inset-0 modal-overlay-contrast z-50 flex items-center justify-center p-4">
      <div
        className="bg-slate-900 border border-emerald-600/40 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }}
      >
        <div
          className="p-6 border-b border-slate-800 cursor-grab active:cursor-grabbing select-none bg-slate-900/80"
          onMouseDown={handleDragStart}
        >
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

const ProspectDetail = ({ prospect, onBack, onDelete, onUpdate }) => {
  const [generationStep, setGenerationStep] = useState(0); 
  const [draft, setDraft] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editableProspect, setEditableProspect] = useState(prospect);

  useEffect(() => {
    setEditableProspect(prospect);
  }, [prospect]);

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

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 mb-1 text-blue-300">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Contact Data</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Name</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    value={editableProspect?.name || ''}
                    onChange={(e) => setEditableProspect((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Email</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.email || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Phone</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.phone || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Title</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.title || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Company</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.company || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">LinkedIn (Personal)</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.linkedinPersonal || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, linkedinPersonal: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">LinkedIn (Company)</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editableProspect?.linkedinCompany || ''}
                      onChange={(e) => setEditableProspect((prev) => ({ ...prev, linkedinCompany: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Description / Notes</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white h-20"
                    value={editableProspect?.description || ''}
                    onChange={(e) => setEditableProspect((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <button
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold border border-emerald-500/50"
                  onClick={() => onUpdate?.({ ...editableProspect })}
                >
                  Save edits
                </button>
              </div>
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

const sanitizeProspects = (items = []) => items.filter((p) => (p?.name || '').trim());

const Dashboard = ({ prospects, onSelectProspect, onAddClick, searchQuery = '', onOpenSocial, onExportJson, onImportJson, onImportCsv, onUpdateProspect, onBulkUpdateProspects, onClearProspects }) => {
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProspects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProspects.map((p) => p.id));
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditingDraft({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const saveEdit = () => {
    if (editingDraft) {
      onUpdateProspect?.(editingDraft);
      setEditingId(null);
      setEditingDraft(null);
    }
  };

  const applyBulk = (patch) => {
    onBulkUpdateProspects?.(selectedIds, patch);
    setSelectedIds([]);
  };
  const filteredProspects = prospects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 h-full overflow-y-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sniper Dashboard</h2>
          <p className="text-slate-400 flex items-center gap-2">
            Turtle Trader Protocol <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs border border-emerald-500/30">Active</span>
            {searchQuery && (
              <span className="text-xs text-slate-500">Filtered by "{searchQuery}"</span>
            )}
          </p>
        </div>
          <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSocial}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-sm flex items-center gap-2"
          >
            <Radio className="w-4 h-4" /> Social Center
          </button>
          <button 
            onClick={onAddClick}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Target
          </button>
            <button
              onClick={onClearProspects}
              className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-500/70 text-sm font-semibold"
            >
              Clear All Targets
            </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 vibe-card">
        <span className="text-xs text-slate-500 uppercase tracking-[0.15em]">Data Ops</span>
        <div className="flex flex-wrap gap-2">
          <button onClick={onImportCsv} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-100 border border-slate-700 hover:border-emerald-500/40">Import CSV</button>
          <button onClick={onImportJson} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-100 border border-slate-700 hover:border-emerald-500/40">Import JSON</button>
          <button onClick={onExportJson} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white border border-emerald-500/60 hover:bg-emerald-500">Export JSON</button>
          <button onClick={() => onClearProspects?.()} className="px-3 py-1.5 text-xs rounded-lg bg-red-600/80 text-white border border-red-500/60 hover:bg-red-600">Clear All</button>
        </div>
        <span className="text-[11px] text-slate-500">CSV fields: name, company, title, score, status</span>
      </div>

      <div className="vibe-card border border-emerald-500/20 bg-slate-900 rounded-xl p-5 shadow-lg shadow-emerald-900/10">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] mono-pill text-emerald-300 tracking-[0.2em]">WHY DWTB?!</p>
            <h3 className="text-xl font-bold text-white">Force multiplier, not an agency</h3>
            <p className="text-sm text-slate-400 max-w-2xl">You are not hiring an agency - you are hiring a force multiplier. Pair freight intel with brand, motion, and network depth inside one ops stack.</p>
          </div>
          <div className="hidden md:flex flex-wrap gap-2 items-start justify-end min-w-[280px]">
            {['WebGL Dev', 'Motion Design', 'Messaging Architecture', 'Earned Placements'].map((tag) => (
              <span key={tag} className="mono-pill text-[11px] px-3 py-1 rounded-full bg-slate-800 text-emerald-200 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm text-slate-200">
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
            <p className="mono-pill text-[11px] text-emerald-300 mb-2">Creative</p>
            <ul className="space-y-1 text-slate-300">
              <li>WebGL development</li>
              <li>Brand systems</li>
              <li>Motion design</li>
              <li>Interactive demos</li>
            </ul>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
            <p className="mono-pill text-[11px] text-emerald-300 mb-2">Strategy</p>
            <ul className="space-y-1 text-slate-300">
              <li>GTM planning</li>
              <li>Messaging architecture</li>
              <li>Competitive positioning</li>
              <li>Event activation</li>
            </ul>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
            <p className="mono-pill text-[11px] text-emerald-300 mb-2">Media</p>
            <ul className="space-y-1 text-slate-300">
              <li>PR outreach</li>
              <li>Earned placements</li>
              <li>Podcast network</li>
              <li>Content engine</li>
            </ul>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
            <p className="mono-pill text-[11px] text-emerald-300 mb-2">Network</p>
            <ul className="space-y-1 text-slate-300">
              <li>C-suite intros</li>
              <li>Investor connections</li>
              <li>Media relationships</li>
              <li>Industry events</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 vibe-card">
          <p className="text-slate-500 text-xs uppercase font-medium">Pipeline Value</p>
          <p className="text-2xl font-bold text-white mt-1">
             ${((prospects.length * 150000)/1000000).toFixed(1)}M
          </p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" /> Live Estimate
          </div>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 vibe-card">
          <p className="text-slate-500 text-xs uppercase font-medium">Whale Targets</p>
          <p className="text-2xl font-bold text-white mt-1">
            {prospects.filter(p => p.score > 85).length}
          </p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 vibe-card">
          <p className="text-slate-500 text-xs uppercase font-medium">Response Rate</p>
          <p className="text-2xl font-bold text-white mt-1">--%</p>
          <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
            <Activity className="w-3 h-3" /> Not enough data
          </div>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 vibe-card">
          <p className="text-slate-500 text-xs uppercase font-medium">Drafts Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {prospects.filter(p => p.status === 'Draft Ready').length}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-emerald-200 font-semibold">Activate Sniper</p>
            <p className="text-xs text-emerald-100/80">Prioritize whales and trigger outreach drafts</p>
          </div>
          <button onClick={onAddClick} className="text-xs font-semibold text-slate-900 bg-white px-3 py-1 rounded-lg">Add</button>
        </div>
        <div className="border border-slate-800 bg-slate-900 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Rss className="w-5 h-5 text-blue-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-semibold">Monitor Signals</p>
            <p className="text-xs text-slate-400">Jump to Social Center to spot breaking news</p>
          </div>
          <button onClick={onOpenSocial} className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30">Open</button>
        </div>
        <div className="border border-slate-800 bg-slate-900 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Filter className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-semibold">Focus View</p>
            <p className="text-xs text-slate-400">Filter by company, title, or impact keywords</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">{filteredProspects.length} showing</span>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Conversion Readiness</span>
            <span className="text-[11px] text-emerald-400">est.</span>
          </div>
          <p className="text-3xl font-bold text-white">42%</p>
          <p className="text-xs text-slate-500">Based on draft-ready + whale density</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Avg Turtle Score</span>
            <span className="text-[11px] text-slate-500">live</span>
          </div>
          <p className="text-3xl font-bold text-white">{prospects.length ? Math.round(prospects.reduce((acc,p)=>acc+p.score,0)/prospects.length) : '--'}</p>
          <p className="text-xs text-slate-500">Higher is better for outbound ROI</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Whales Tracked</span>
            <span className="text-[11px] text-emerald-400">scored</span>
          </div>
          <p className="text-3xl font-bold text-white">{prospects.filter(p=>p.score>85).length}</p>
          <p className="text-xs text-slate-500">Targets with score &gt; 85</p>
        </div>
      </div>

    {/* List */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[300px] vibe-card">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-white">Target List ({filteredProspects.length}/{prospects.length})</h3>
        <div className="flex gap-2 text-sm items-center">
           <span className="text-slate-500">Sort by:</span>
           <span className="text-emerald-400 cursor-pointer">Score (High-Low)</span>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-300 font-semibold">Bulk edit ({selectedIds.length})</span>
          <input
            placeholder="Set company"
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyBulk({ company: e.target.value });
            }}
          />
          <input
            placeholder="Set title"
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyBulk({ title: e.target.value });
            }}
          />
          <input
            placeholder="Set status"
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyBulk({ status: e.target.value });
            }}
          />
          <button
            className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold border border-emerald-500/50"
            onClick={() => applyBulk({ status: 'New' })}
          >
            Reset status
          </button>
          <button
            className="px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs border border-slate-700"
            onClick={() => setSelectedIds([])}
          >
            Clear
          </button>
        </div>
      )}
      
      {filteredProspects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-6 text-center space-y-3">
          <Target className="w-12 h-12 mb-2 opacity-20" />
          <p className="text-lg font-medium text-slate-300">No matches found</p>
          <p className="text-sm text-slate-500">Try clearing the search or add a new target.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => onAddClick()}
              className="px-4 py-2 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 rounded-lg text-sm transition-all"
            >
              Add target
            </button>
            <button
              onClick={() => onOpenSocial?.()}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 hover:bg-slate-700"
            >
              Watch signals
            </button>
          </div>
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-sm">
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProspects.length && filteredProspects.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 font-medium">Prospect</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Turtle Score</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredProspects.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => onSelectProspect(p)}>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600 shadow-inner">
                      {p.avatar}
                    </div>
                    <div>
                      {editingId === p.id ? (
                        <div className="space-y-1">
                          <input
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                            value={editingDraft?.name || ''}
                            onChange={(e) => setEditingDraft((prev) => ({ ...prev, name: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            value={editingDraft?.title || ''}
                            onChange={(e) => setEditingDraft((prev) => ({ ...prev, title: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                            value={editingDraft?.email || ''}
                            onChange={(e) => setEditingDraft((prev) => ({ ...prev, email: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-white">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.title}</div>
                          {p.email && <div className="text-[11px] text-slate-500">{p.email}</div>}
                          {(p.linkedinPersonal || p.linkedinCompany) && (
                            <div className="flex items-center gap-2 mt-1">
                              {p.linkedinPersonal && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/30">LinkedIn</span>}
                              {p.linkedinCompany && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-sky-500/30">Company</span>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingId === p.id ? (
                      <input
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                        value={editingDraft?.company || ''}
                        onChange={(e) => setEditingDraft((prev) => ({ ...prev, company: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{p.company}</span>
                    )}
                    {p.companyDomain && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        (p.dataWarnings || []).includes('Email/company mismatch')
                          ? 'border-red-500/40 text-red-300 bg-red-500/10'
                          : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                      }`}>
                        {p.companyDomain}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-slate-700 rounded-full overflow-hidden">
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
                  {editingId === p.id ? (
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="text-xs px-3 py-1 rounded bg-emerald-600 text-white" onClick={saveEdit}>Save</button>
                      <button className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1" onClick={() => onSelectProspect(p)}>
                        Engage <ChevronRight className="w-4 h-4" />
                      </button>
                      <button className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
};

const SocialCenter = ({ customFeeds = [], onAddFeed, onDeleteFeed }) => {
  const TRACK_KEY = 'freightintel_social_tracking';
  const [selectedNews, setSelectedNews] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeReddit, setIncludeReddit] = useState(true);
  const [filterImpact, setFilterImpact] = useState('all'); // 'all', 'High', 'Medium'
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showFeedModal, setShowFeedModal] = useState(false);
  const trending = useMemo(() => getTrendingTopics(newsItems, 5), [newsItems]);
  const [savedItems, setSavedItems] = useState([]);
  const [watchKeywords, setWatchKeywords] = useState(['port', 'strike']);
  const [newKeyword, setNewKeyword] = useState('');
  const watchHits = useMemo(() => {
    return watchKeywords.map((kw) => {
      const count = newsItems.filter((n) => `${n.title} ${n.summary}`.toLowerCase().includes(kw.toLowerCase())).length;
      return { kw, count };
    });
  }, [watchKeywords, newsItems]);

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

  useEffect(() => {
    try {
      const cached = localStorage.getItem(TRACK_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSavedItems(parsed.savedItems || []);
        setWatchKeywords(parsed.watchKeywords || ['port', 'strike']);
      }
    } catch (e) {
      console.warn('Tracking load failed', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify({ savedItems, watchKeywords }));
    } catch (e) {
      console.warn('Tracking persist failed', e);
    }
  }, [savedItems, watchKeywords]);

  const handleGenerate = (item) => {
    setSelectedNews(item);
    setGeneratedPost(null);
    setTimeout(() => {
      setGeneratedPost(generateMockPost(item));
    }, 1500);
  };

  const toggleSaveItem = (item) => {
    setSavedItems((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev.filter((p) => p.id !== item.id);
      return [...prev, item];
    });
  };

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (!watchKeywords.includes(trimmed)) {
      setWatchKeywords((prev) => [...prev, trimmed]);
    }
    setNewKeyword('');
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

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Items Loaded</p>
              <p className="text-xl font-semibold text-white">{newsItems.length}</p>
            </div>
            <span className="text-[11px] text-slate-500">{includeReddit ? 'Feeds + Reddit' : 'Feeds'}</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">High Impact</p>
              <p className="text-xl font-semibold text-red-300">{newsItems.filter(n=>n.impact==='High').length}</p>
            </div>
            <span className="text-[11px] text-slate-500">filtered</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Last Refresh</p>
              <p className="text-sm font-semibold text-white">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <button onClick={handleRefresh} className="text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:border-emerald-500/40 flex items-center gap-1 text-slate-300">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Now
            </button>
          </div>
        </div>

        {/* Tracking Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Saved Signals</p>
              <p className="text-xl font-semibold text-white">{savedItems.length}</p>
            </div>
            <span className="text-[11px] text-slate-500">Quick stash</span>
          </div>
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900">
            <p className="text-xs text-slate-500 mb-2">Watch Keywords</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchKeywords.map((kw) => (
                <span key={kw} className="px-2 py-1 rounded-full bg-slate-800 text-[11px] text-slate-200 border border-slate-700">
                  {kw}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white placeholder:text-slate-600"
              />
              <button onClick={handleAddKeyword} className="text-xs px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500">Add</button>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900">
            <p className="text-xs text-slate-500 mb-2">Keyword Hits</p>
            <div className="flex flex-wrap gap-2">
              {watchHits.map(({ kw, count }) => (
                <span key={kw} className={`px-2 py-1 rounded-lg text-[11px] border ${count > 0 ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
                  {kw}: {count}
                </span>
              ))}
            </div>
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
            newsItems.map((news) => {
              const isSaved = savedItems.some((s) => s.id === news.id);
              const hasWatch = watchKeywords.some((kw) => `${news.title} ${news.summary}`.toLowerCase().includes(kw.toLowerCase()));
              return (
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
                    <div className="flex items-center gap-2">
                      {hasWatch && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Tracked</span>
                      )}
                      <span className="text-xs text-slate-500">{news.time}</span>
                    </div>
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
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaveItem(news); }}
                      className={`text-xs font-medium px-2 py-1 rounded border ${isSaved ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-700 text-slate-300 hover:border-emerald-500/30'}`}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Post Preview */}
        <div className="w-1/2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Generated Content</h3>
            {trending.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end max-w-[260px]">
                {trending.map(t => (
                  <span key={t.topic} className="px-2 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">{t.topic}</span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4 bg-slate-800/70 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Saved signals ({savedItems.length})</span>
              <span className="text-[11px] text-slate-500">Tap “Save” on any card</span>
            </div>
            {savedItems.length === 0 ? (
              <p className="text-xs text-slate-500">Nothing saved yet.</p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-200 max-h-24 overflow-y-auto">
                {savedItems.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="line-clamp-1">{item.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
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
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  // App State - Using Local Storage (No Firebase needed)
  const [prospects, setProspects] = useState([]);
  const [customFeeds, setCustomFeeds] = useState([]);
  const jsonInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey) return;

      // Global search
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Jump to dashboard
      if (e.key.toLowerCase() === 'd' && e.shiftKey === false) {
        setActiveTab('dashboard');
        setSelectedProspect(null);
      }

      // Jump to social
      if (e.key.toLowerCase() === 's' && e.shiftKey === false) {
        setActiveTab('social');
        setSelectedProspect(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Load data from local storage on mount
  useEffect(() => {
    setProspects(sanitizeProspects(loadFromStorage(STORAGE_KEY, [])));
    setCustomFeeds(loadFromStorage(FEEDS_KEY, []));
  }, []);

  // Save prospects whenever they change
  useEffect(() => {
    if (prospects.length > 0) {
      saveToStorage(STORAGE_KEY, sanitizeProspects(prospects));
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Storage clear failed', e);
      }
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

  const handleClearProspects = () => {
    if (confirm('Clear all targets? This removes imported contacts so you can upload fresh.')) {
      setProspects([]);
      setSelectedProspect(null);
    }
  };

  const handleUpdateProspect = (updated) => {
    setProspects((prev) => sanitizeProspects(prev.map((p) => (p.id === updated.id ? { ...p, ...updated, lastActivity: 'Edited' } : p))));
    setSelectedProspect((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const handleBulkUpdateProspects = (ids = [], patch = {}) => {
    if (!ids.length) return;
    setProspects((prev) => sanitizeProspects(prev.map((p) => (ids.includes(p.id) ? { ...p, ...patch, lastActivity: 'Edited' } : p))));
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

  // Data import/export helpers
  const normalizeProspect = (p) => {
    const initials = (p.name || 'NA')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const emailDomain = (p.email || '').split('@')[1] || '';
    const companyNormalized = (p.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const domainNormalized = emailDomain.toLowerCase().replace(/[^a-z0-9]/g, '');
    const warnings = [];
    if (!p.email) warnings.push('Missing email');
    if (!p.linkedinPersonal && !p.linkedinCompany) warnings.push('Missing LinkedIn');
    if (p.company && domainNormalized && companyNormalized && !domainNormalized.includes(companyNormalized)) {
      warnings.push('Email/company mismatch');
    }

    return {
      id: p.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: p.name || 'Unknown',
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email || '',
      phone: p.phone || '',
      linkedinPersonal: p.linkedinPersonal || '',
      linkedinCompany: p.linkedinCompany || '',
      companyDomain: emailDomain,
      description: p.description || '',
      company: p.company || 'Unknown Co',
      title: p.title || p.jobTitle || 'Unknown Title',
      score: Number.isFinite(Number(p.score)) ? Number(p.score) : Math.floor(Math.random() * (98 - 60 + 1) + 60),
      status: p.status || 'New',
      lastActivity: p.lastActivity || 'Imported',
      signals: p.signals || [],
      avatar: p.avatar || initials,
      createdAt: p.createdAt || new Date().toISOString(),
      dataWarnings: warnings,
    };
  };

  const handleExportJson = () => {
    const data = JSON.stringify(prospects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freightintel-targets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
        const normalized = parsed.map(normalizeProspect);
        setProspects((prev) => sanitizeProspects([...prev, ...normalized]).sort((a, b) => b.score - a.score));
      } catch (err) {
        alert('Import failed: ' + err.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCsv = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    
    const headers = parseCsvLine(lines[0]).map((h) => h.trim());
    const norm = (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedHeaders = headers.map(norm);
    
    console.log('CSV Headers:', headers);
    console.log('Normalized Headers:', normalizedHeaders);
    
    const rows = lines.slice(1);
    const parsed = rows
      .map((line) => parseCsvLine(line))
      .filter((cells) => cells.length >= 1 && cells.some(c => c.trim()))
      .map((cells) => {
        const obj = {};
        headers.forEach((h, idx) => {
          const normalizedKey = norm(h);
          obj[normalizedKey] = cells[idx] || '';
        });
        return obj;
      })
      .map((o) => {
        // Try multiple field name variations
        const name = o.name || o.fullname || o.contactname || 
                     `${o.firstname || o.fname || ''} ${o.lastname || o.lname || ''}`.trim() ||
                     'Unknown';
        const firstName = o.firstname || o.fname || o.givenname || '';
        const lastName = o.lastname || o.lname || o.surname || o.familyname || '';
        const email = o.email || o.emailaddress || o.mail || '';
        const phone = o.phone || o.phonenumber || o.telephone || o.mobile || '';
        const company = o.company || o.companyname || o.organization || o.org || o.account || '';
        const title = o.title || o.jobtitle || o.position || o.role || '';
        const linkedinPersonal = o.linkedinurl || o.linkedin || o.personallinkedin || o.linkedinprofile || '';
        const linkedinCompany = o.companylinkedin || o.companylinkedinurl || '';
        const description = o.description || o.notes || o.bio || '';
        const status = o.status || 'New';
        
        return normalizeProspect({
          name,
          firstName,
          lastName,
          email,
          phone,
          company,
          title,
          description,
          linkedinPersonal,
          linkedinCompany,
          status,
        });
      });
    
    console.log(`Parsed ${parsed.length} prospects from CSV`);
    if (parsed.length > 0) {
      console.log('Sample prospect:', parsed[0]);
    }
    
    return parsed;
  };

  const handleImportCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsv(reader.result || '');
        if (parsed.length === 0) throw new Error('No rows found');
        setProspects((prev) => sanitizeProspects([...prev, ...parsed]).sort((a, b) => b.score - a.score));
      } catch (err) {
        alert('CSV import failed: ' + err.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerJsonImport = () => jsonInputRef.current?.click();
  const triggerCsvImport = () => csvInputRef.current?.click();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 relative overflow-hidden vibe-shell">
      <WebGLBackground />
      <input type="file" accept="application/json" ref={jsonInputRef} className="hidden" onChange={handleImportJson} />
      <input type="file" accept="text/csv,.csv" ref={csvInputRef} className="hidden" onChange={handleImportCsv} />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedProspect(null); }}
        totalTargets={prospects.length}
        whaleCount={prospects.filter(p => p.score > 85).length}
        draftCount={prospects.filter(p => p.status === 'Draft Ready').length}
      />
      
      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-950/90 to-slate-900/80 backdrop-blur">
        <TopBar 
          onSearch={setSearchQuery}
          onAddClick={() => setIsAddModalOpen(true)}
          onOpenSocial={() => { setActiveTab('social'); setSelectedProspect(null); }}
          searchInputRef={searchInputRef}
        />

        {activeTab === 'dashboard' && !selectedProspect && (
          <Dashboard 
            prospects={prospects} 
            onSelectProspect={handleSelectProspect} 
            onAddClick={() => setIsAddModalOpen(true)}
            searchQuery={searchQuery}
            onOpenSocial={() => setActiveTab('social')}
            onExportJson={handleExportJson}
            onImportJson={triggerJsonImport}
            onImportCsv={triggerCsvImport}
            onUpdateProspect={handleUpdateProspect}
            onBulkUpdateProspects={handleBulkUpdateProspects}
            onClearProspects={handleClearProspects}
          />
        )}
        
        {activeTab === 'dashboard' && selectedProspect && (
          <ProspectDetail 
            prospect={selectedProspect} 
            onBack={handleBackToDashboard}
            onDelete={handleDeleteProspect}
            onUpdate={handleUpdateProspect}
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
