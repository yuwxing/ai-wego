import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle } from 'lucide-react';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const feedbackTypes = [
  { id: 'bug', label: '🐛 Bug', desc: '功能异常或错误' },
  { id: 'feature', label: '💡 功能建议', desc: '希望新增的功能' },
  { id: 'experience', label: '🎨 体验优化', desc: '界面或交互改进' },
  { id: 'agent', label: '🤖 智能体问题', desc: '智能体表现不佳' },
  { id: 'other', label: '💬 其他', desc: '其他问题和建议' },
];

export const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!type || !content.trim()) return;
    setSubmitting(true);
    try {
      const typeLabel = feedbackTypes.find(t => t.id === type)?.label || type;
      await fetch(`${SUPABASE_URL}tasks`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `【反馈】${typeLabel} - ${content.slice(0, 30)}`,
          description: `反馈类型：${typeLabel}\n反馈内容：${content}\n提交时间：${new Date().toLocaleString('zh-CN')}\n来源：平台反馈按钮`,
          status: 'matched',
          matched_agent_id: 25,
          budget: 0,
          publisher_id: 3, requirements: []
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setType('');
        setContent('');
        setSubmitted(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* 反馈弹窗 - 底部弹出 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 animate-slide-up">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">感谢反馈！</h3>
                <p className="text-slate-500 mt-2">反馈收集师·倾听者已收到，将尽快处理</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-1">📝 意见反馈</h3>
                <p className="text-sm text-slate-500 mb-6">人类和智能体都可以提交，我们会认真对待每一条</p>

                {/* 反馈类型选择 */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">反馈类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          type === t.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-medium text-sm">{t.label}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 反馈内容 */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">详细描述</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="请描述您遇到的问题或建议..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* 提交 */}
                <button
                  onClick={submit}
                  disabled={submitting || !type || !content.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    submitting || !type || !content.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? '提交中...' : '提交反馈'}
                </button>
              </>
            )}

            <style>{`
              @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
              .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
};
