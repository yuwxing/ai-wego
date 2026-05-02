// 求职课堂页面 - AI多智能体模拟面试
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Map, ArrowLeft, X, Maximize2, Sparkles, Lightbulb, ChevronRight, Loader2 } from 'lucide-react';

// OpenMAIC域名 - 部署后需要更新
const OPENMAIC_DOMAIN = localStorage.getItem('OPENMAIC_DOMAIN') || 'openmaic-xxx.vercel.app';

// 求职场景数据
const interviewScenarios = [
  {
    id: 'resume',
    icon: <FileText className="w-10 h-10" />,
    title: '📄 简历优化',
    subtitle: 'AI团队帮你分析优化',
    description: '上传简历，AI面试官+AI简历师+AI导师三方协作，分析竞争力、挖掘亮点、定制优化建议',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    features: ['简历诊断', '竞争力分析', '定制优化'],
    topic: '简历优化与面试准备'
  },
  {
    id: 'interview',
    icon: <Mic className="w-10 h-10" />,
    title: '🎤 模拟面试',
    subtitle: 'AI面试官模拟真实面试',
    description: '选择目标岗位，AI面试官进行一对一模拟面试，实时反馈、薄弱点分析、offer预测',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    features: ['岗位选择', '实时面试', '反馈复盘'],
    topic: '技术面试模拟与指导'
  },
  {
    id: 'career',
    icon: <Map className="w-10 h-10" />,
    title: '🗺️ 职业规划',
    subtitle: 'AI导师帮你规划求职路径',
    description: 'AI导师深度分析你的背景、兴趣、市场需求，定制专属求职路线图',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    features: ['背景分析', '路径规划', '目标拆解'],
    topic: '职业发展与求职策略'
  }
];

export const JobClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openOpenMAIC = (scenario: typeof interviewScenarios[0]) => {
    setIsLoading(true);
    setActiveScenario(scenario.id);
    setTimeout(() => setIsLoading(false), 500);
  };

  const closeOpenMAIC = () => {
    setActiveScenario(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentScenario = interviewScenarios.find(s => s.id === activeScenario);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {!isFullscreen && (
        <header className="relative z-10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </button>
              <h1 className="text-xl font-bold text-white">🎓 求职课堂</h1>
              <div className="w-20" />
            </div>
          </div>
        </header>
      )}

      {isFullscreen && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button onClick={toggleFullscreen} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <main className={`relative z-10 ${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
        {isFullscreen && activeScenario ? (
          <div className="h-full w-full rounded-2xl overflow-hidden bg-white">
            <iframe
              src={`https://${OPENMAIC_DOMAIN}/?topic=${encodeURIComponent(currentScenario?.topic || '求职指导')}&mode=discussion`}
              className="w-full h-full border-0"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
        ) : activeScenario ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{currentScenario?.title}</h2>
              <p className="text-white/60">{currentScenario?.subtitle}</p>
            </div>
            <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    <p className="text-white/80">正在加载AI助手...</p>
                  </div>
                </div>
              )}
              <iframe
                src={`https://${OPENMAIC_DOMAIN}/?topic=${encodeURIComponent(currentScenario?.topic || '求职指导')}&mode=discussion`}
                className="w-full h-full border-0"
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                onLoad={() => setIsLoading(false)}
              />
              <button onClick={toggleFullscreen} className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all hover:scale-105">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mt-6">
              <button onClick={closeOpenMAIC} className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                选择其他场景
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-white/10 mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/80">AI多智能体协作平台</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎓 求职课堂</h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">AI面试官 + AI简历师 + AI导师，三方协作帮你拿下offer</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {interviewScenarios.map((scenario) => (
                <div key={scenario.id} className="group relative" onClick={() => openOpenMAIC(scenario)}>
                  <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2" style={{ boxShadow: `0 0 40px ${scenario.glowColor}` }}>
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${scenario.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500`} style={{ boxShadow: `0 0 30px ${scenario.glowColor}` }}>
                      {scenario.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{scenario.title}</h3>
                    <p className="text-white/60 mb-4">{scenario.subtitle}</p>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">{scenario.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {scenario.features.map((feature) => (
                        <span key={feature} className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70 border border-white/10">{feature}</span>
                      ))}
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${scenario.gradient} text-white group-hover:shadow-lg transition-all duration-300`} style={{ boxShadow: `0 0 20px ${scenario.glowColor}` }}>
                      <span className="font-medium">开始体验</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${scenario.gradient} rounded-full group-hover:w-full transition-all duration-500`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <h3 className="text-2xl font-bold text-white mb-8">🤖 AI团队阵容</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Mic className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">AI面试官</h4>
                  <p className="text-sm text-white/50">模拟真实面试场景，智能提问与追问</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">AI简历师</h4>
                  <p className="text-sm text-white/50">专业简历诊断与优化建议</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">AI导师</h4>
                  <p className="text-sm text-white/50">职业规划与求职策略指导</p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-white/40 text-sm">💡 使用DeepSeek API驱动，支持多轮对话与深度分析</p>
            </div>
          </>
        )}
      </main>

      {!isFullscreen && activeScenario && (
        <button onClick={toggleFullscreen} className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40">
          <Maximize2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default JobClassroomPage;
