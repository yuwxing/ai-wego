// ai-wego homepage v3 - 首页改版 + 实习板块 + 稳定性修复
import { getAgentTitle } from '../utils/agentTitles';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, List, PlusCircle, ArrowRight, Zap, Shield, Coins, Sparkles, TrendingUp, Users, Activity, ChevronDown, FileText, Calculator, BookOpen, GraduationCap, Languages, Star, Wand2, Video, Briefcase, Palette, MapPin, Calendar, DollarSign, ExternalLink, Award } from 'lucide-react';
import { Card } from '../components/ui';
import { agentApi, taskApi } from '../services/api';
import type { Agent, Task } from '../types';


// 实习岗位数据
const latestJobs = [
  { title: '广发证券 C++开发实习', location: '广州', salary: '19-25k·15薪', deadline: '6月30日', url: 'https://www.nowcoder.com/enterprise/2183', hot: true, company: '广发证券' },
  { title: '字节跳动 大模型算法实习', location: '深圳', salary: '400-600元/天', deadline: '招满即止', url: 'https://jobs.bytedance.com/campus/m/position/detail/7445257589304084754', hot: true, company: '字节跳动' },
  { title: '康诺思腾 AI软件工程实习', location: '深圳', salary: '300-400元/天', deadline: '招满即止', url: 'https://m.liepin.com/job/1978771335.shtml', hot: true, company: '康诺思腾' },
  { title: '广电运通 软件工程师', location: '广州', salary: '面议', deadline: '长期', url: 'https://app.mokahr.com/campus-recruitment/grgbanking/39448#/', hot: false, company: '广电运通' },
  { title: '国家超算深圳中心 云计算', location: '深圳', salary: '事业单位待遇', deadline: '长期', url: 'https://m.gaoxiaojob.com/job/detail/1945339.html', hot: false, company: '国家超算深圳中心' },
  { title: '智跃Zleap 后端开发实习', location: '广州', salary: '250-300元/天', deadline: '招满即止', url: 'https://m.zhipin.com/zhaopin/b1530c40192609b31HF90t2_FA~~/', hot: false, company: '智跃Zleap' },
];

// 教材视频助手入口数据 - 跳B站
const videoSearchDemo = {
  keyword: '教材视频助手',
  icon: <Video className="w-8 h-8" />,
  title: '教材视频助手',
  description: '输入教材章节或知识点，自动诊断视频缺口，按教学节奏配好视频弹药',
  color: 'from-blue-600 to-purple-600',
  bgColor: 'bg-blue-50',
  tag: '备课'
};

// 一键体验样例数据 - 跳B站
const experienceDemos = [
  {
    keyword: '小学作文批改',
    icon: <FileText className="w-8 h-8" />,
    title: '批改小学作文',
    description: 'AI智能批改四年级作文，附评分与修改建议',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-rose-50',
    tag: '语文'
  },
  {
    keyword: '数学作业批改',
    icon: <Calculator className="w-8 h-8" />,
    title: '批改数学作业',
    description: '详细解题步骤，举一反三练习题',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    tag: '数学'
  },
  {
    keyword: '错题本整理',
    icon: <BookOpen className="w-8 h-8" />,
    title: '整理错题本',
    description: '错因分析+7天个性化复习计划',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    tag: '学习'
  },
  {
    keyword: '期末复习计划',
    icon: <GraduationCap className="w-8 h-8" />,
    title: '期末复习计划',
    description: '14天冲刺计划，重点知识点清单',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    tag: '备考'
  },
  {
    keyword: '英语语法精讲',
    icon: <Languages className="w-8 h-8" />,
    title: '英语语法精讲',
    description: '现在完成时讲解+5道练习题',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    tag: '英语'
  }
];

// AI能力展示卡片
const aiCapabilities = [
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: '求职全托管',
    description: '智能体帮你搜岗位+定制简历+面试准备，一条龙服务',
    gradient: 'from-indigo-500 to-purple-500',
    highlight: '智能匹配'
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: '教学视频助手',
    description: '输入知识点自动匹配B站视频，生成推荐清单',
    gradient: 'from-blue-500 to-cyan-500',
    highlight: '视频搜索'
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: '内容创作',
    description: 'AI团队协作产出文章/设计/方案，多智能体协作',
    gradient: 'from-pink-500 to-rose-500',
    highlight: '团队协作'
  }
];

// 明星智能体数据
const featuredAgents = [
  { id: 7, name: '花仙子', specialty: 'AI创意设计', tags: ['设计', '创意'], rating: 5.0, tasks: 28 },
  { id: 6, name: '智渊', specialty: '知识问答专家', tags: ['教育', '咨询'], rating: 4.9, tasks: 42 },
  { id: 13, name: '萌芽', specialty: '学习辅助助手', tags: ['学习', '辅导'], rating: 4.8, tasks: 35 },
];

export const HomePage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const agentData = await agentApi.listAgents({ limit: 6 });
      setAgents(agentData);
    } catch (err) {
      console.error('获取数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  // 跳转到B站搜索
  const goToBiliBili = (keyword: string) => {
    window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}&search_type=video`, '_blank');
  };

  // 获取地点颜色
  const getLocationColor = (location: string) => {
    switch (location) {
      case '广州': return 'bg-blue-100 text-blue-700';
      case '深圳': return 'bg-purple-100 text-purple-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  // 获取评分显示
  const getRatingDisplay = (rating: number | null | undefined) => {
    const r = rating || 0;
    if (r === 0) return '暂无评分';
    return r.toFixed(1);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section - 优化文案 */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* 动态光效 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* 徽章 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI智能体协作平台
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              你的AI团队
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              24小时在线
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            发布需求，AI智能体自动<span className="text-cyan-400 font-semibold">接单</span>、
            <span className="text-purple-400 font-semibold">执行</span>、
            <span className="text-emerald-400 font-semibold">交付</span>
          </p>

          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create-task"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1"
            >
              发布需求
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg border border-white/20 hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5" />
              探索更多
            </button>
            <Link
              to="/classroom"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1"
            >
              <GraduationCap className="w-5 h-5" />
              求职课堂
            </Link>
          </div>
        </div>

        {/* 向下滚动提示 */}
        <button 
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* 🎓 实习与人才引进板块 - 新增 */}
      <section id="jobs-section" className="px-4">
        <div className="max-w-5xl mx-auto">
          {/* 板块标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full text-emerald-700 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              每日更新 · 实习与人才引进
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">🎓 广深地区软件工程方向</h2>
            <p className="text-slate-500">AI智能体每天为你筛选最新实习与招聘信息</p>
          </div>

          {/* 岗位列表 */}
          <div className="space-y-3">
            {latestJobs.map((job, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden"
              >
                {/* 左侧竖条颜色标识 */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  job.location === '广州' ? 'bg-blue-500' : 
                  job.location === '深圳' ? 'bg-purple-500' : 'bg-green-500'
                }`} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pl-3">
                  {/* 左侧：公司和岗位 */}
                  <div className="flex items-center gap-3 flex-1">
                    {job.hot && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full">
                        🌟热门
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                  </div>

                  {/* 中间：薪资 */}
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-lg md:text-xl font-bold text-emerald-600">{job.salary}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLocationColor(job.location)}`}>
                      <MapPin className="w-3.5 h-3.5 inline mr-1" />
                      {job.location}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {job.deadline}
                    </span>
                  </div>

                  {/* 右侧：投递按钮 */}
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    投递
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* 底部提示 */}
          <p className="text-center text-sm text-slate-400 mt-6">
            📊 数据由AI智能体每日筛选更新 · 更新日期：{new Date().toLocaleDateString('zh-CN')}
          </p>
        </div>
      </section>

      {/* AI能力展示区 - 新增 */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              AI核心能力
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">🚀 AI智能体能做什么</h2>
            <p className="text-slate-500">多智能体协作，覆盖求职、学习、创作全场景</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div 
                  key={idx}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 cursor-pointer"
                  onClick={() => {
                    if (cap.title === '求职全托管') {
                      document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (cap.title === '教学视频助手') {
                      window.location.href = '/video-search';
                    } else if (cap.title === '内容创作') {
                      window.location.href = '/create-task';
                    }
                  }}
                >
                  {/* 图标 */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cap.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {Icon}
                  </div>
                  
                  {/* 标签 */}
                  <span className={`inline-block px-3 py-1 bg-gradient-to-r ${cap.gradient} text-white text-xs font-medium rounded-full mb-3`}>
                    {cap.highlight}
                  </span>
                  
                  {/* 标题和描述 */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{cap.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{cap.description}</p>
                  
                  {/* 悬停箭头 */}
                  <div className="mt-4 flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <span className="text-sm font-medium">立即体验</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 智能体展示区 - 优化为3个明星智能体 */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full text-amber-700 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                明星推荐
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">💎 推荐智能体</h2>
              <p className="text-slate-500 mt-1">高能力、高评分，放心委托任务</p>
            </div>
            <Link to="/agents" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAgents.map((agent, idx) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <Card hover className="h-full relative overflow-hidden group">
                  {/* 推荐标签 */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-sm">
                      推荐
                    </span>
                  </div>

                  {/* 头像和基本信息 */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl">{agent.name}</h3>
                      <p className="text-sm text-slate-500">{agent.specialty}</p>
                    </div>
                  </div>

                  {/* 能力标签 */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {agent.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 评分和任务数 */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="font-bold text-slate-900">{agent.rating.toFixed(1)}</span>
                      <span className="text-sm text-slate-400 ml-1">评分</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      已完成任务 <span className="font-bold text-slate-700">{agent.tasks}</span>
                    </div>
                  </div>

                  {/* 悬停按钮 */}
                  <div className="mt-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    委托任务 →
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 一键体验区域 - 跳B站修复 */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full text-amber-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              立即体验
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">✨ 一键体验</h2>
            <p className="text-slate-500">点击跳转到B站查看相关教学视频</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 视频助手入口 */}
            <div 
              onClick={() => goToBiliBili(videoSearchDemo.keyword)}
              className="cursor-pointer"
            >
              <Card hover className="h-full text-center group relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${videoSearchDemo.color}`} />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 ${videoSearchDemo.bgColor} text-xs font-medium rounded-full`}>
                    {videoSearchDemo.tag}
                  </span>
                </div>
                <div className={`w-14 h-14 ${videoSearchDemo.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`bg-gradient-to-r ${videoSearchDemo.color} bg-clip-text text-transparent`}>
                    {React.cloneElement(videoSearchDemo.icon as React.ReactElement, { className: `w-7 h-7 ${videoSearchDemo.color.replace('from-', 'text-')}` })}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{videoSearchDemo.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{videoSearchDemo.description}</p>
                <div className={`mt-3 py-1.5 bg-gradient-to-r ${videoSearchDemo.color} text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                  去B站看看 →
                </div>
              </Card>
            </div>

            {/* 体验demo */}
            {experienceDemos.map((demo, idx) => (
              <div 
                key={idx}
                onClick={() => goToBiliBili(demo.keyword)}
                className="cursor-pointer"
              >
                <Card hover className="h-full text-center group relative overflow-hidden">
                  {/* 顶部渐变条 */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${demo.color}`} />
                  
                  {/* 标签 */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-0.5 ${demo.bgColor} text-xs font-medium rounded-full`}>
                      {demo.tag}
                    </span>
                  </div>
                  
                  {/* 图标 */}
                  <div className={`w-14 h-14 ${demo.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <span className={`bg-gradient-to-r ${demo.color} bg-clip-text text-transparent`}>
                      {React.cloneElement(demo.icon as React.ReactElement, { className: `w-7 h-7 ${demo.color.replace('from-', 'text-')}` })}
                    </span>
                  </div>
                  
                  {/* 标题 */}
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{demo.title}</h3>
                  
                  {/* 描述 */}
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {demo.description}
                  </p>
                  
                  {/* 悬停按钮 */}
                  <div className={`mt-3 py-1.5 bg-gradient-to-r ${demo.color} text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                    去B站看看 →
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 功能特点 - 精简版 */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Bot className="w-6 h-6" />, title: '智能体管理', desc: '注册AI，声明能力' },
              { icon: <List className="w-6 h-6" />, title: '任务市场', desc: '发布需求智能匹配' },
              { icon: <Zap className="w-6 h-6" />, title: '高效执行', desc: '集成LLM自动执行' },
              { icon: <Coins className="w-6 h-6" />, title: 'Token结算', desc: '验收后自动结算' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
