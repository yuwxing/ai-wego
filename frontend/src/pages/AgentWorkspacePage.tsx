import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Bot, Clock, ArrowLeft, CheckCircle, AlertCircle, Loader2, 
  Play, Brain, FileText, Sparkles, Zap, ChevronRight, 
  Star, Award, Activity, Terminal, Video, Image as ImageIcon,
  ExternalLink, RefreshCw, Copy, Check, Share2
} from 'lucide-react';
import { Card, StatusBadge, LoadingSpinner, EmptyState } from '../components/ui';
import { tasksAPI, agentsAPI } from '../utils/supabase';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  matched_agent_id: number | null;
  budget: number;
  created_at: string;
  completed_at?: string;
  rating?: number;
}

interface Agent {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string;
  capabilities?: any[];
  completed_tasks: number;
  avg_rating: number;
  token_balance: number;
  total_tasks: number;
}

interface Delivery {
  id: number;
  task_id: number;
  agent_id: number;
  content: string;
  result_url?: string;
  submitted_at: string;
}

interface LogEntry {
  time: string;
  icon: string;
  message: string;
  type: 'info' | 'success' | 'progress' | 'error';
}

// 工作步骤配置
const WORK_STEPS = [
  { id: 'search', label: '搜索中', icon: '🔍', animation: 'pulse' },
  { id: 'analyze', label: '分析中', icon: '🧠', animation: 'spin' },
  { id: 'organize', label: '整理中', icon: '📝', animation: 'bounce' },
  { id: 'complete', label: '已完成', icon: '✅', animation: 'none' },
];

// 根据任务状态获取当前步骤索引
const getCurrentStep = (status: string): number => {
  switch (status) {
    case 'matched': return 0;
    case 'in_progress': return 1;
    case 'completed': return 3;
    case 'approved': return 3;
    default: return 0;
  }
};

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// 生成模拟工作日志
const generateLogs = (task: Task, deliveries: Delivery[]): LogEntry[] => {
  const now = new Date();
  const baseTime = task.created_at ? new Date(task.created_at) : now;
  
  if (task.status === 'matched') {
    return [
      { time: formatTime(new Date(baseTime.getTime())), icon: '🤖', message: '正在匹配最佳智能体...', type: 'info' },
      { time: formatTime(new Date(baseTime.getTime() + 2000)), icon: '🎯', message: `已匹配智能体 #${task.matched_agent_id}`, type: 'success' },
      { time: formatTime(new Date(baseTime.getTime() + 3000)), icon: '🔍', message: '开始搜索任务相关内容...', type: 'progress' },
    ];
  }
  
  if (task.status === 'in_progress') {
    return [
      { time: formatTime(new Date(baseTime.getTime())), icon: '🤖', message: '智能体已接收任务，开始工作', type: 'info' },
      { time: formatTime(new Date(baseTime.getTime() + 2000)), icon: '🔍', message: `正在搜索"${task.title}"相关内容...`, type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 5000)), icon: '📊', message: '找到 15+ 个候选结果', type: 'info' },
      { time: formatTime(new Date(baseTime.getTime() + 7000)), icon: '🧠', message: '正在分析内容质量和相关性...', type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 10000)), icon: '🧠', message: '筛选出高质量结果，进行深度分析', type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 12000)), icon: '📝', message: '正在整理和格式化交付内容...', type: 'progress' },
    ];
  }
  
  if (task.status === 'completed' || task.status === 'approved') {
    const logs: LogEntry[] = [
      { time: formatTime(new Date(baseTime.getTime())), icon: '🤖', message: '智能体已接收任务，开始工作', type: 'info' },
      { time: formatTime(new Date(baseTime.getTime() + 2000)), icon: '🔍', message: `正在搜索"${task.title}"相关内容...`, type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 4000)), icon: '📊', message: '找到 18 个候选结果', type: 'info' },
      { time: formatTime(new Date(baseTime.getTime() + 6000)), icon: '🧠', message: '正在分析内容质量和相关性...', type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 8000)), icon: '🧠', message: '筛选出 8 个高质量结果', type: 'success' },
      { time: formatTime(new Date(baseTime.getTime() + 10000)), icon: '🧠', message: '进行深度内容分析和结构化处理', type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 13000)), icon: '📝', message: '正在整理和格式化交付内容...', type: 'progress' },
      { time: formatTime(new Date(baseTime.getTime() + 15000)), icon: '✅', message: '交付物生成完成！', type: 'success' },
    ];
    
    if (deliveries && deliveries.length > 0) {
      logs.push({ time: formatTime(new Date(baseTime.getTime() + 16000)), icon: '📦', message: '已生成交付内容', type: 'info' });
      
      const hasVideo = deliveries.some(d => d.result_url?.includes('bilibili') || d.result_url?.includes('b23.tv'));
      const hasImages = deliveries.some(d => d.result_url?.match(/\.(jpg|jpeg|png|gif|webp)/i));
      
      if (hasVideo) {
        logs.push({ time: formatTime(new Date(baseTime.getTime() + 17000)), icon: '🎬', message: '包含视频内容', type: 'info' });
      }
      if (hasImages) {
        logs.push({ time: formatTime(new Date(baseTime.getTime() + 18000)), icon: '🖼️', message: '包含图片内容', type: 'info' });
      }
    }
    
    if (task.status === 'approved') {
      logs.push({ time: formatTime(new Date(baseTime.getTime() + 20000)), icon: '🏆', message: '任务已验收通过！', type: 'success' });
    }
    
    return logs;
  }
  
  return [];
};

// 渲染Markdown（简化版）
const renderMarkdown = (content: string): JSX.Element => {
  const lines = content.split('\n');
  
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-slate-800 mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold text-slate-800 mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 text-slate-700">{line.slice(2)}</li>;
        }
        if (line.includes('[') && line.includes('](')) {
          const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            return (
              <p key={i} className="text-slate-700 my-1">
                {line.split(/\[([^\]]+)\]\(([^)]+)\]/).map((part, idx) => {
                  if (idx % 3 === 0) return <span key={idx}>{part}</span>;
                  if (idx % 3 === 1) return <span key={idx} className="text-blue-600">{part}</span>;
                  return <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">{part}</a>;
                })}
              </p>
            );
          }
        }
        if (!line.trim()) {
          return <div key={i} className="h-2" />;
        }
        return <p key={i} className="text-slate-700 my-1">{line}</p>;
      })}
    </div>
  );
};

// B站视频ID提取
const extractBiliBiliId = (url: string): string | null => {
  const patterns = [
    /bilibili\.com\/video\/(BV[\w]+)/i,
    /bilibili\.com\/video\/av(\d+)/i,
    /b23\.tv\/([\w]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const AgentWorkspacePage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDelivery, setExpandedDelivery] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 获取数据
  const fetchData = async () => {
    try {
      const numTaskId = parseInt(taskId || '0');
      if (!numTaskId) throw new Error('无效的任务ID');
      
      const [taskData, deliveriesData] = await Promise.all([
        tasksAPI.getTask(numTaskId),
        tasksAPI.getDeliveries(numTaskId),
      ]);
      
      if (!taskData) throw new Error('任务不存在');
      setTask(taskData);
      setDeliveries(deliveriesData || []);
      
      if (taskData.matched_agent_id) {
        const agentData = await agentsAPI.getAgent(taskData.matched_agent_id);
        setAgent(agentData);
      }
      
      setLogs(generateLogs(taskData, deliveriesData || []));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [taskId]);
  
  // 滚动日志到底部
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  // 轮询更新状态
  useEffect(() => {
    if (task && ['matched', 'in_progress'].includes(task.status)) {
      pollIntervalRef.current = setInterval(() => {
        fetchData();
      }, 5000);
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [task?.status]);
  
  // 复制内容
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          icon={<AlertCircle className="w-16 h-16" />}
          title="加载失败"
          description={error || '无法加载任务信息'}
          action={
            <button 
              onClick={() => navigate('/tasks')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-medium"
            >
              返回任务列表
            </button>
          }
        />
      </div>
    );
  }
  
  const currentStep = getCurrentStep(task.status);
  const isCompleted = ['completed', 'approved'].includes(task.status);
  
  // 计算工作时长
  const getWorkingDuration = (): string => {
    if (!task.completed_at && !task.created_at) return '--';
    const start = new Date(task.created_at);
    const end = task.completed_at ? new Date(task.completed_at) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (diff < 60) return `${diff}秒`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分${diff % 60}秒`;
    return `${Math.floor(diff / 3600)}小时${Math.floor((diff % 3600) / 60)}分`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={task.status} />
            {task.status === 'approved' && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                已验收 ⭐
              </span>
            )}
          </div>
        </div>
        
        {/* 页面标题 */}
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <Sparkles className="inline-block w-8 h-8 mr-2 text-yellow-400 animate-pulse" />
            智能体工作台
          </h1>
          <p className="text-white/60">{task.title}</p>
        </div>
        
        {/* 智能体信息卡 */}
        {agent && (
          <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="relative">
                {agent.avatar_url ? (
                  <img 
                    src={agent.avatar_url} 
                    alt={agent.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-400/50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ring-2 ring-indigo-400/50">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                )}
                {/* 在线状态 */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              
              {/* 信息 */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                <p className="text-white/60 text-sm">{agent.description || '智能体助手'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{agent.avg_rating.toFixed(1)}</span>
                    <span className="text-white/40 text-sm">({agent.completed_tasks}评价)</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60">
                    <Activity className="w-4 h-4" />
                    <span>已完成 {agent.completed_tasks} 任务</span>
                  </div>
                </div>
              </div>
              
              {/* 工作时长 */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">工作时长</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {getWorkingDuration()}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* 进度展示 */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border border-white/10">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              工作进度
            </h2>
            
            {/* 步骤进度条 */}
            <div className="relative">
              {/* 连接线 */}
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              
              {/* 步骤点 */}
              <div className="relative flex justify-between">
                {WORK_STEPS.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isCompletedStep = idx < currentStep;
                  const isPending = idx > currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      {/* 圆圈 */}
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                          isCompletedStep 
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' 
                            : isActive 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50 animate-pulse' 
                              : 'bg-slate-700/50'
                        }`}
                      >
                        {isCompletedStep ? (
                          <CheckCircle className="w-8 h-8 text-white" />
                        ) : isActive ? (
                          <span className={step.animation === 'spin' ? 'animate-spin' : step.animation === 'bounce' ? 'animate-bounce' : ''}>
                            {step.icon}
                          </span>
                        ) : (
                          <span className="opacity-40">{step.icon}</span>
                        )}
                      </div>
                      
                      {/* 标签 */}
                      <div className={`mt-3 font-medium text-center ${
                        isCompletedStep 
                          ? 'text-emerald-400' 
                          : isActive 
                            ? 'text-white font-semibold' 
                            : 'text-slate-500'
                      }`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 当前状态提示 */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">
                    {task.status === 'matched' && '正在匹配智能体...'}
                    {task.status === 'in_progress' && '智能体正在工作中，请稍候...'}
                    {task.status === 'completed' && '任务完成，等待验收'}
                    {task.status === 'approved' && '任务已验收通过！'}
                  </p>
                  <p className="text-white/50 text-sm">
                    {isCompleted ? '交付物已准备就绪' : '实时更新中，每5秒刷新'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* 工作日志 */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              工作日志
            </h2>
            {!isCompleted && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                实时更新
              </div>
            )}
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-2 bg-black/30 font-mono text-sm">
            {logs.map((log, idx) => (
              <div 
                key={idx}
                className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-300 ${
                  log.type === 'success' ? 'bg-emerald-500/10' :
                  log.type === 'progress' ? 'bg-indigo-500/10' :
                  log.type === 'error' ? 'bg-red-500/10' :
                  'hover:bg-white/5'
                }`}
              >
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span className="text-lg shrink-0">{log.icon}</span>
                <span className={`${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'progress' ? 'text-indigo-400' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
            {!isCompleted && (
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="animate-pulse">▋</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </Card>
        
        {/* 交付物展示 */}
        {deliveries && deliveries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              交付物
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-normal">
                {deliveries.length} 项
              </span>
            </h2>
            
            {deliveries.map((delivery, idx) => {
              const isExpanded = expandedDelivery === delivery.id;
              const isBiliBili = delivery.result_url && extractBiliBiliId(delivery.result_url);
              const isImage = delivery.result_url?.match(/\.(jpg|jpeg|png|gif|webp)/i);
              
              return (
                <Card 
                  key={delivery.id}
                  className="bg-white/95 backdrop-blur-sm border border-slate-200 overflow-hidden"
                >
                  {/* 交付物头部 */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                          {isBiliBili ? (
                            <Video className="w-5 h-5 text-indigo-600" />
                          ) : isImage ? (
                            <ImageIcon className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            交付物 #{idx + 1}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {new Date(delivery.submitted_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  {/* 展开内容 */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {/* 视频展示 */}
                      {isBiliBili && (
                        <div className="p-4 bg-slate-900">
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={`//player.bilibili.com/player.html?bvid=${isBiliBili}&autoplay=0`}
                              className="absolute inset-0 w-full h-full"
                              allowFullScreen
                              scrolling="no"
                              frameBorder="0"
                            />
                          </div>
                          {delivery.result_url && (
                            <a 
                              href={delivery.result_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              在B站打开
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* 图片展示 */}
                      {isImage && delivery.result_url && (
                        <div className="p-4">
                          <img 
                            src={delivery.result_url}
                            alt="交付图片"
                            className="max-w-full rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* 文本内容 */}
                      {delivery.content && (
                        <div className="p-4 border-t border-slate-100">
                          {renderMarkdown(delivery.content)}
                        </div>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="px-4 pb-4 flex gap-2">
                        {delivery.content && (
                          <button
                            onClick={() => copyToClipboard(delivery.content, `content-${delivery.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                          >
                            {copiedId === `content-${delivery.id}` ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-500" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                复制内容
                              </>
                            )}
                          </button>
                        )}
                        {delivery.result_url && !isBiliBili && !isImage && (
                          <a
                            href={delivery.result_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            打开链接
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        
        {/* 无交付物提示 */}
        {isCompleted && (!deliveries || deliveries.length === 0) && (
          <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无交付物内容</p>
          </Card>
        )}
        
        {/* 操作按钮 */}
        {task.status === 'completed' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to={`/tasks/${task.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-medium transition-all shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle className="w-5 h-5" />
              前往验收
            </Link>
            <button
              onClick={fetchData}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 font-medium transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              刷新状态
            </button>
          </div>
        )}
        
        {task.status === 'approved' && (
          <div className="flex justify-center pt-4">
            <Link
              to={`/tasks/${task.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-medium transition-all shadow-lg shadow-indigo-500/25"
            >
              <Award className="w-5 h-5" />
              查看任务详情
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentWorkspacePage;
