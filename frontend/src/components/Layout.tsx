import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, List, PlusCircle, History, Menu, X, Home, Sparkles, Gift, Wand2, BookOpen, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: <Home className="w-5 h-5" /> },
  { path: '/agents', label: '智能体', icon: <Bot className="w-5 h-5" /> },
  { path: '/tasks', label: '任务大厅', icon: <List className="w-5 h-5" /> },
  { path: '/classroom', label: '求职课堂', icon: <GraduationCap className="w-5 h-5" />, highlight: true },
  { path: '/video-search', label: '教材视频', icon: <BookOpen className="w-5 h-5" /> },
  { path: '/create', label: 'AI绘画', icon: <Wand2 className="w-5 h-5" /> },
  { path: '/create-task', label: '发布', icon: <PlusCircle className="w-5 h-5" /> },
];

const bottomNavItems: NavItem[] = [
  { path: '/agents', label: '智能体', icon: <Bot className="w-6 h-6" /> },
  { path: '/tasks', label: '任务大厅', icon: <List className="w-6 h-6" /> },
  { path: '/create-task', label: '发布', icon: <PlusCircle className="w-6 h-6" />, highlight: true },
  { path: '/create', label: 'AI绘画', icon: <Wand2 className="w-6 h-6" /> },
  { path: '/transactions', label: '记录', icon: <History className="w-6 h-6" /> },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [balance] = useState<number>(5000);
  const [currentUser] = useState({ id: 1, username: 'alice' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                智能体生态
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    item.highlight && 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5',
                    !item.highlight && location.pathname === item.path
                      ? 'bg-slate-100 text-slate-900'
                      : !item.highlight && 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-pink-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Gift className="w-4 h-4" />
                注册送Token
              </Link>

              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-700">
                  💎 {balance.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{currentUser.username}</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-xl">
            <div className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Token 余额</p>
                    <p className="text-lg font-bold text-purple-700">💎 {balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{currentUser.username}</span>
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                    item.highlight && 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg',
                    !item.highlight && location.pathname === item.path
                      ? 'bg-slate-100 text-slate-900'
                      : !item.highlight && 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              <Link
                to="/register"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              >
                <Gift className="w-5 h-5" />
                注册送Token
              </Link>
            </div>
          </div>
        )}
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/50 z-50">
        <div className="flex justify-around py-2 px-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]',
                item.highlight
                  ? location.pathname === item.path
                    ? 'text-white'
                    : 'text-slate-500'
                  : location.pathname === item.path
                    ? 'text-blue-600'
                    : 'text-slate-400'
              )}
            >
              {item.highlight ? (
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all',
                  location.pathname === item.path
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                    : 'bg-slate-200'
                )}>
                  {item.icon}
                </div>
              ) : (
                <>
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {children}
      </main>

      <div className="h-4 lg:hidden" />
    </div>
  );
};

export default Layout;
