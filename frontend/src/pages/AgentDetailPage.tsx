import React, { useState, useEffect } from 'react';
import { getAgentTitle } from '../utils/agentTitles';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Bot, TrendingUp, Zap, Star, CheckCircle, Clock, AlertCircle, 
  Target, Key, Copy, ExternalLink, Code, RefreshCw, Sparkles, Lock, Unlock, Award
} from 'lucide-react';
import { Card, RatingStars, StatusBadge, LoadingSpinner, EmptyState, TokenAmount } from '../components/ui';
import { agentsAPI, tasksAPI, calculateAgentAvgRating } from '../utils/supabase';
import { SKILL_CATALOG, TIER_CONFIG, type Skill } from '../utils/skillCatalog';
import type { Agent, Task, TaskStatus } from '../types';

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '编程': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '写作': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '设计': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  '分析': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'developer' | 'skills'>('overview');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // 技能树相关状态
  const [activeTier, setActiveTier] = useState<string>('all');
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<{ task: Task; show: boolean }>({ task: null as any, show: false });

  // 获取当前登录用户ID
  const currentUserId = parseInt(localStorage.getItem('userId') || '1');

  useEffect(() => {
    if (id) {
      fetchAgentDetails(parseInt(id));
      fetchAgentTasks(parseInt(id));
    }
  }, [id]);

  const fetchAgentDetails = async (agentId: number) => {
    try {
      const data = await agentsAPI.getAgent(agentId);
      // 实时计算平均分
      if (data) {
        const ratingInfo = await calculateAgentAvgRating(agentId);
        data.avg_rating = ratingInfo.avg_rating;
        data.rating_count = ratingInfo.count;
      }
      setAgent(data);
      if (data.owner_id === currentUserId && data.api_key) {
        setApiKey(data.api_key);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取智能体详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentTasks = async (agentId: number) => {
    try {
      const data = await tasksAPI.listTasks({ matched_agent_id: agentId });
      const completedTasks = data.filter(
        (task) => task.status === 'completed' || task.status === 'approved'
      );
      setTasks(completedTasks);
    } catch (err) {
      console.error('获取任务列表失败', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 解锁技能
  const unlockSkill = async (skill: Skill) => {
    if (!agent) return;
    
    if (agent.token_balance < skill.price) {
      showToast('Token不足，继续完成任务赚取更多奖励', 'error');
      return;
    }
    
    setUnlocking(skill.id);
    try {
      const newBalance = agent.token_balance - skill.price;
      const newCapabilities = [...(agent.capabilities || []), skill.name];
      
      const res = await fetch(`${SUPABASE_URL}agents?id=eq.${agent.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token_balance: newBalance, capabilities: newCapabilities })
      });
      
      if (res.ok) {
        showToast(`🎉 成功解锁「${skill.name}」！`, 'success');
        fetchAgentDetails(agent.id);
      } else {
        showToast('解锁失败，请重试', 'error');
      }
    } catch (err) {
      showToast('网络错误，请重试', 'error');
    } finally {
      setUnlocking(null);
    }
  };

  // 验收通过
  const approveTask = async (task: Task) => {
    try {
      await fetch(`${SUPABASE_URL}tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved', delivery_status: 'approved' })
      });
      showToast('✅ 验收通过！', 'success');
      fetchAgentTasks(agent!.id);
    } catch (err) {
      showToast('操作失败', 'error');
    }
  };

  // 验收不通过 - 撤回任务
  const rejectDelivery = async (task: Task) => {
    if (!agent) return;
    
    try {
      // 1. 任务状态改回open
      await fetch(`${SUPABASE_URL}tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'open', 
          matched_agent_id: null,
          delivery_status: 'rejected'
        })
      });
      
      // 2. 扣回智能体奖励
      if (task.matched_agent_id && task.budget > 0) {
        const agentRes = await fetch(`${SUPABASE_URL}agents?id=eq.${task.matched_agent_id}&select=token_balance,completed_tasks`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const agentData = await agentRes.json();
        if (agentData && agentData[0]) {
          const newBalance = Math.max(0, agentData[0].token_balance - task.budget);
          const newCompleted = Math.max(0, agentData[0].completed_tasks - 1);
          await fetch(`${SUPABASE_URL}agents?id=eq.${task.matched_agent_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token_balance: newBalance, completed_tasks: newCompleted })
          });
        }
      }
      
      showToast('✅ 已撤回，任务重新进入抢单池', 'success');
      fetchAgentTasks(agent.id);
      setShowRejectModal({ task: null as any, show: false });
    } catch (err) {
      showToast('操作失败', 'error');
    }
  };

  const handleGenerateApiKey = async () => {
    if (!agent) return;
    
    setApiKeyLoading(true);
    setApiKeyError(null);
    
    try {
      const apiKey = `ag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // 保存到agent记录
      try {
        await agentsAPI.updateAgent(agent.id, { api_key: apiKey });
      } catch(e) {}
      setApiKey(apiKey);
    } catch (err) {
      setApiKeyError(err instanceof Error ? err.message : '生成 API Key 失败');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!apiKey) return;
    
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '无';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 计算统计数据
  const completedCount = tasks.length;
  const totalTokens = tasks.reduce((sum, task) => sum + task.budget, 0);
  const avgRating = tasks.length > 0
    ? tasks.reduce((sum, task) => sum + (task.rating || 0), 0) / tasks.length
    : 0;

  // 技能树相关逻辑
  const unlockedSet = new Set(agent?.capabilities || []);
  const filteredSkills = activeTier === 'all' 
    ? SKILL_CATALOG 
    : SKILL_CATALOG.filter(s => s.tier === activeTier);

  const tierCounts = {
    all: SKILL_CATALOG.length,
    basic: SKILL_CATALOG.filter(s => s.tier === 'basic').length,
    advanced: SKILL_CATALOG.filter(s => s.tier === 'advanced').length,
    expert: SKILL_CATALOG.filter(s => s.tier === 'expert').length,
    legendary: SKILL_CATALOG.filter(s => s.tier === 'legendary').length,
  };

  const unlockedCounts = {
    all: unlockedSet.size,
    basic: SKILL_CATALOG.filter(s => s.tier === 'basic' && unlockedSet.has(s.name)).length,
    advanced: SKILL_CATALOG.filter(s => s.tier === 'advanced' && unlockedSet.has(s.name)).length,
    expert: SKILL_CATALOG.filter(s => s.tier === 'expert' && unlockedSet.has(s.name)).length,
    legendary: SKILL_CATALOG.filter(s => s.tier === 'legendary' && unlockedSet.has(s.name)).length,
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-600">{error || '智能体不存在'}</p>
        <Link to="/agents" className="text-blue-600 hover:underline mt-4 inline-block">
          返回智能体列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast提示 */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/agents')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回智能体列表
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tab 导航 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            智能体详情
          </span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'skills'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            技能树
          </span>
        </button>
        <button
          onClick={() => setActiveTab('developer')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'developer'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            开发者入口
          </span>
        </button>
      </div>

      {/* Tab 内容 */}
      {activeTab === 'overview' && (
        <>
          {/* 智能体基本信息 */}
          <Card className="space-y-6">
            <div className="flex items-start gap-6">
              {/* 头像 */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Bot className="w-10 h-10 text-white" />
              </div>

              {/* 基本信息 */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900">{agent.name}</h1>
                {(() => {
                  const titleInfo = getAgentTitle(agent.completed_tasks || 0, agent.avg_rating || 0);
                  return (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${titleInfo.color}`}>
                        {titleInfo.badge} {titleInfo.title} Lv.{titleInfo.level}
                      </span>
                    </div>
                  );
                })()}
                <p className="text-sm text-slate-400 mt-1">ID: {agent.id}</p>
                <p className="text-slate-600 mt-3 line-clamp-2">
                  {agent.description || '暂无描述'}
                </p>

                {/* 能力标签 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {agent.capabilities?.map((cap, idx) => {
                    const colors = categoryColors[cap.category] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        {cap.category}
                        <span className="text-xs opacity-75">Lv.{cap.level}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 基础统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{agent.completed_tasks || 0}</p>
                <p className="text-xs text-slate-500">完成任务</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <div className="flex items-center justify-center">
                  <RatingStars rating={agent.avg_rating} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-1">平均评分</p>
              </div>
            </div>

            {/* Token余额 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Token余额</span>
              <TokenAmount amount={agent.token_balance} className="text-xl" />
            </div>

            {/* 等级进度条 */}
            {(() => {
              const titleInfo = getAgentTitle(agent.completed_tasks || 0, agent.avg_rating || 0);
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>升级进度</span>
                    <span>{titleInfo.progress}% (还需 {Math.max(0, (titleInfo.level < 6 ? [1, 6, 16, 31, 50][titleInfo.level] - (agent.completed_tasks || 0) : 0))} 任务)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${titleInfo.color} transition-all`} style={{ width: `${titleInfo.progress}%` }} />
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* 统计汇总 */}
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              完成任务统计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
                <p className="text-sm text-slate-500 mt-1">完成任务总数</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-600">💎 {totalTokens.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">获得的总Token</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-600">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</p>
                <p className="text-sm text-slate-500 mt-1">平均评分</p>
              </div>
            </div>
          </Card>

          {/* 完成的任务列表 */}
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              完成的任务
            </h3>

            {tasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="w-12 h-12" />}
                title="暂无已完成的任务"
                description="该智能体还没有完成任何任务"
              />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Link to={`/tasks/${task.id}`} className="block">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-900 truncate">{task.title}</h4>
                            <StatusBadge status={task.status as TaskStatus} />
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {task.description || '暂无描述'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            {task.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-amber-600 font-medium">{task.rating}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="text-purple-600 font-medium">+{task.budget} Token</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatDate(task.completed_at || task.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* 验收操作按钮 - 仅completed状态显示 */}
                    {task.status === 'completed' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => approveTask(task)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          验收通过
                        </button>
                        <button
                          onClick={() => setShowRejectModal({ task, show: true })}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                        >
                          <AlertCircle className="w-4 h-4" />
                          验收不通过
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* 技能树 Tab */}
      {activeTab === 'skills' && (
        <>
          {/* Token余额展示 */}
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">我的Token余额</p>
                <p className="text-4xl font-bold mt-1">💎 {agent.token_balance.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">已解锁技能</p>
                <p className="text-2xl font-bold mt-1">{unlockedCounts.all} / {tierCounts.all}</p>
              </div>
            </div>
          </Card>

          {/* Tier切换 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: '全部', count: tierCounts.all, unlocked: unlockedCounts.all },
              { key: 'basic', label: '基础', count: tierCounts.basic, unlocked: unlockedCounts.basic },
              { key: 'advanced', label: '进阶', count: tierCounts.advanced, unlocked: unlockedCounts.advanced },
              { key: 'expert', label: '专家', count: tierCounts.expert, unlocked: unlockedCounts.expert },
              { key: 'legendary', label: '传说', count: tierCounts.legendary, unlocked: unlockedCounts.legendary },
            ].map((tier) => (
              <button
                key={tier.key}
                onClick={() => setActiveTier(tier.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTier === tier.key
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTier === tier.key ? 'bg-white/20' : 'bg-slate-200'
                }`}>
                  {tier.unlocked}/{tier.count}
                </span>
              </button>
            ))}
          </div>

          {/* 技能网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => {
              const isUnlocked = unlockedSet.has(skill.name);
              const canAfford = agent.token_balance >= skill.price;
              const tierConfig = TIER_CONFIG[skill.tier];
              
              return (
                <Card 
                  key={skill.id}
                  hover
                  className={`relative overflow-hidden ${
                    isUnlocked ? 'border-2 ' + tierConfig.borderColor : ''
                  }`}
                >
                  {isUnlocked && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierConfig.color}`} />
                  )}
                  
                  <div className="flex items-start gap-4 pt-2">
                    {/* 图标 */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      isUnlocked ? tierConfig.bgColor : 'bg-slate-100'
                    }`}>
                      {isUnlocked ? skill.icon : <Lock className="w-6 h-6 text-slate-400" />}
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                          {skill.name}
                        </h4>
                        {isUnlocked && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-xs font-medium">
                            ✓ 已解锁
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        {/* 价格 */}
                        <div className={`flex items-center gap-1 ${
                          isUnlocked ? 'text-slate-400' : canAfford ? 'text-purple-600' : 'text-red-500'
                        }`}>
                          {skill.price === 0 ? (
                            <span className="text-xs font-medium">免费</span>
                          ) : (
                            <>
                              <span className="text-sm font-bold">💎 {skill.price}</span>
                            </>
                          )}
                        </div>
                        
                        {/* 解锁按钮 */}
                        {!isUnlocked && canAfford && skill.price > 0 && (
                          <button
                            onClick={() => unlockSkill(skill)}
                            disabled={unlocking === skill.id}
                            className={`px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center gap-1`}
                          >
                            {unlocking === skill.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                            解锁
                          </button>
                        )}
                        {!isUnlocked && !canAfford && skill.price > 0 && (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            余额不足
                          </span>
                        )}
                        {skill.price === 0 && !isUnlocked && (
                          <button
                            onClick={() => unlockSkill(skill)}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all"
                          >
                            立即获得
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* 开发者入口 Tab */}
      {activeTab === 'developer' && (
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">API Key 管理</h2>
              <p className="text-sm text-slate-500">管理此智能体的 API 接入凭证</p>
            </div>
          </div>

          {/* API Key 显示区域 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">API Key</label>
            
            {apiKey ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-slate-100 rounded-lg font-mono text-sm text-slate-700 break-all">
                    {apiKey}
                  </div>
                  <button
                    onClick={handleCopyApiKey}
                    className="flex-shrink-0 p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="复制"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  请妥善保管您的 API Key，不要泄露给他人
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">尚未生成 API Key</p>
                    <p className="text-xs text-amber-600 mt-1">
                      生成 API Key 后，您的智能体即可通过 API 接入平台接收任务
                    </p>
                  </div>
                </div>
                {apiKeyError && (
                  <p className="text-sm text-red-600">{apiKeyError}</p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {apiKey ? (
                <button
                  onClick={handleGenerateApiKey}
                  disabled={apiKeyLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {apiKeyLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  重新生成
                </button>
              ) : (
                <button
                  onClick={handleGenerateApiKey}
                  disabled={apiKeyLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {apiKeyLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  生成 API Key
                </button>
              )}
            </div>
          </div>

          {/* 接入文档链接 */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-700">接入文档</h3>
                <p className="text-xs text-slate-500 mt-1">查看完整的 API 接入指南和示例代码</p>
              </div>
              <a
                href="/docs/agent-integration-guide.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                查看文档
              </a>
            </div>
          </div>

          {/* 快速参考 */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-slate-700">API 端点快速参考</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">GET</span>
                <code className="text-slate-600">/api/v1/agent-api/tasks</code>
                <span className="text-slate-400">获取可用任务</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                <code className="text-slate-600">/api/v1/agent-api/tasks/{'{id}'}/claim</code>
                <span className="text-slate-400">领取任务</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                <code className="text-slate-600">/api/v1/agent-api/tasks/{'{id}'}/submit</code>
                <span className="text-slate-400">提交结果</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">GET</span>
                <code className="text-slate-600">/api/v1/agent-api/my-tasks</code>
                <span className="text-slate-400">我的任务</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">GET</span>
                <code className="text-slate-600">/api/v1/agent-api/my-balance</code>
                <span className="text-slate-400">查看余额</span>
              </div>
            </div>
          </div>

          {/* 扣子接入提示 */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              扣子/Coze 接入
            </h3>
            <p className="text-xs text-purple-600 mt-2">
              本智能体已配置 HTTP 请求插件，可直接在扣子平台使用。
              请在 Bot 设置中添加本 API 地址和您的 API Key 进行授权。
            </p>
          </div>
        </Card>
      )}

      {/* 验收不通过确认弹窗 */}
      {showRejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">确认撤回任务</h3>
                <p className="text-sm text-slate-500">验收不达标，任务将重新进入抢单池</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">任务名称</span>
                <span className="text-slate-900 font-medium">{showRejectModal.task.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">已支付奖励</span>
                <span className="text-red-600 font-medium">-💎 {showRejectModal.task.budget}</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-600">
              确认后，该智能体的Token奖励将被扣回，任务状态改回<span className="font-medium text-slate-900">开放</span>，其他智能体可以重新抢单。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal({ task: null as any, show: false })}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => rejectDelivery(showRejectModal.task)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;
