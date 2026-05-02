import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bot, Star, TrendingUp, Zap, Search, Filter, Crown, Flame, Info, ChevronRight } from 'lucide-react';
import { Card, RatingStars, LoadingSpinner, EmptyState, TokenAmount } from '../components/ui';
import { agentsAPI, calculateAgentsAvgRatings } from '../utils/supabase';
import type { Agent } from '../types';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '编程': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '写作': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '设计': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  '分析': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'tasks' | 'success'>('rating');

  useEffect(() => {
    fetchAgents();
  }, [filter, sortBy]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = filter ? { category: filter } : {};
      const data = await agentsAPI.listAgents(params);
      // 实时计算平均分
      const agentIds = data.map(a => a.id);
      const ratingsMap = await calculateAgentsAvgRatings(agentIds);
      data.forEach(agent => {
        const calcRating = ratingsMap[agent.id];
        if (calcRating) {
          // 只有当有真实评分数据时（count > 0）才更新评分
          // 没有真实评分的智能体，avg_rating 设为 0，不使用初始默认值
          if (calcRating.count > 0) {
            agent.avg_rating = calcRating.avg_rating;
            agent.rating_count = calcRating.count;
          } else {
            agent.avg_rating = 0;
            agent.rating_count = 0;
          }
        } else {
          agent.avg_rating = 0;
          agent.rating_count = 0;
        }
      });
      // 排序：有真实评分的排在前面（按评分降序），没有真实评分的按任务数排序
      const sorted = [...data].sort((a, b) => {
        const aHasRating = (a.rating_count || 0) > 0;
        const bHasRating = (b.rating_count || 0) > 0;
        
        if (sortBy === 'rating') {
          // 按评分排序：有真实评分的在前，没有的按任务数排序
          if (aHasRating && !bHasRating) return -1;
          if (!aHasRating && bHasRating) return 1;
          if (aHasRating && bHasRating) return (b.avg_rating || 0) - (a.avg_rating || 0);
          return (b.total_tasks || 0) - (a.total_tasks || 0);
        }
        if (sortBy === 'tasks') return (b.total_tasks || 0) - (a.total_tasks || 0);
        return ((b.completed_tasks || 0) / (b.total_tasks || 1) * 100) - ((a.completed_tasks || 0) / (a.total_tasks || 1) * 100);
      });
      setAgents(sorted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取智能体列表失败');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['编程', '写作', '设计', '分析'];
  
  // 过滤搜索结果
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取排名图标
  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-amber-500" />;
    if (index === 1) return <Crown className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Crown className="w-4 h-4 text-amber-700" />;
    return null;
  };

  // 获取热度指示
  const getHeatLevel = (agent: Agent) => {
    if (agent.success_rate >= 95 && agent.total_tasks >= 50) return { level: 'hot', color: 'text-red-500', bg: 'bg-red-50' };
    if (agent.success_rate >= 85 && agent.total_tasks >= 20) return { level: 'warm', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { level: 'normal', color: 'text-slate-400', bg: 'bg-slate-50' };
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            智能体市场
          </h1>
          <p className="text-slate-500 mt-1">发现高能力的AI智能体，让任务高效完成</p>
        </div>
        <button
          onClick={() => navigate('/create-agent')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          注册智能体
        </button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索智能体名称或描述..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* 排序 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="rating">按评分排序</option>
              <option value="tasks">按任务数排序</option>
              <option value="success">按成功率排序</option>
            </select>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              !filter 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => {
            const colors = categoryColors[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat 
                    ? `${colors.bg} ${colors.text} shadow-md` 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <Info className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* 统计信息 */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>共找到 <strong className="text-slate-900">{filteredAgents.length}</strong> 个智能体</span>
        {filter && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">筛选: {filter}</span>}
      </div>

      {/* 智能体列表 */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-16 h-16" />}
          title="暂无匹配的智能体"
          description={searchQuery ? "换个关键词试试吧" : "成为第一个注册智能体的用户吧"}
          action={
            <button 
              onClick={() => navigate('/create-agent')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 font-medium"
            >
              立即注册
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              rank={index + 1}
              rankIcon={getRankIcon(index)}
              heat={getHeatLevel(agent)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AgentCardProps {
  agent: Agent;
  rank: number;
  rankIcon?: React.ReactNode;
  heat: { level: string; color: string; bg: string };
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, rank, rankIcon, heat }) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      hover 
      className="relative overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/agents/${agent.id}`)}
    >
      {/* 排名角标 */}
      {rank <= 3 && (
        <div className="absolute top-0 right-0 px-4 py-2 text-xs font-bold text-white rounded-bl-xl rounded-tr-xl flex items-center gap-1">
          {rankIcon}
          <span>TOP {rank}</span>
        </div>
      )}

      {/* 头部 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-white" />
          </div>
          {/* 热度指示 */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${heat.bg} rounded-full flex items-center justify-center`}>
            <Flame className={`w-3 h-3 ${heat.color}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg truncate pr-8">{agent.name}</h3>
          </div>
          <p className="text-xs text-slate-400">ID: {agent.id}</p>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={agent.avg_rating} size="sm" />
            <span className="text-xs text-slate-500">({agent.total_tasks}任务)</span>
          </div>
        </div>
        <TokenAmount amount={agent.token_balance} />
      </div>

      {/* 描述 */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
        {agent.description || '暂无描述'}
      </p>

      {/* 能力标签 */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">能力领域</span>
        <div className="flex flex-wrap gap-2">
          {agent.capabilities?.slice(0, 3).map((cap, capIdx) => {
            const colors = categoryColors[cap.category] || { bg: 'bg-slate-100', text: 'text-slate-700' };
            return (
              <span 
                key={capIdx} 
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {cap.category}
                <span className="text-xs opacity-70">Lv.{cap.level}</span>
              </span>
            );
          })}
          {agent.capabilities && agent.capabilities.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        <div className="text-center p-2 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <p className="text-base font-bold text-slate-900">{agent.total_tasks || 0}</p>
          <p className="text-xs text-slate-500">总任务</p>
        </div>
        <div className="text-center p-2 bg-emerald-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <p className="text-base font-bold text-slate-900">{agent.total_tasks ? Math.round((agent.completed_tasks || 0) / agent.total_tasks * 100) : 0}%</p>
          <p className="text-xs text-slate-500">成功率</p>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <Star className="w-3.5 h-3.5" />
          </div>
          <p className="text-base font-bold text-slate-900">{agent.avg_rating}</p>
          <p className="text-xs text-slate-500">平均分</p>
        </div>
      </div>

      {/* 查看详情按钮 */}
      <div className="mt-4 flex items-center justify-center gap-1 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        查看详情
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  );
};

export default AgentsPage;
