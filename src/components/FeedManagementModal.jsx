import React, { useState } from 'react';
import { Plus, Trash2, X, Rss, ExternalLink } from 'lucide-react';

const FeedManagementModal = ({ isOpen, onClose, customFeeds = [], onAddFeed, onDeleteFeed }) => {
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddFeed = (e) => {
    e.preventDefault();
    if (!newFeedName || !newFeedUrl) return;

    setSaving(true);
    onAddFeed({
      name: newFeedName,
      url: newFeedUrl,
      enabled: true
    });
    setNewFeedName('');
    setNewFeedUrl('');
    setSaving(false);
  };

  const handleDeleteFeed = (feedId) => {
    onDeleteFeed(feedId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Manage News Feeds</h3>
            <p className="text-sm text-slate-400">Add custom RSS feeds to your Social Center</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Add New Feed Form */}
          <form onSubmit={handleAddFeed} className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Add New Feed</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Feed Name
                </label>
                <input
                  type="text"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  placeholder="e.g. My Custom Logistics Blog"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  RSS Feed URL
                </label>
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="https://example.com/feed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the RSS/Atom feed URL (usually ends in /feed or /rss)
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Feed
              </button>
            </div>
          </form>

          {/* Custom Feeds List */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Your Custom Feeds</h4>
            {customFeeds.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                <Rss className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No custom feeds yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customFeeds.map(feed => (
                  <div
                    key={feed.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Rss className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-white">{feed.name}</span>
                      </div>
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                      >
                        {feed.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-full hover:bg-red-900/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedManagementModal;
