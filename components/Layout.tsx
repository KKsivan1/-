import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Database, Share2, Landmark, ShieldAlert, UserCircle } from 'lucide-react';
import { AuthContext } from '../App';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { role, setRole } = useContext(AuthContext);

  const isActive = (path: string) => 
    location.pathname === path ? "bg-red-800 text-yellow-500 shadow-inner" : "text-red-100 hover:bg-red-800 hover:text-white";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="bg-red-900 text-white shadow-xl sticky top-0 z-50 border-b-4 border-yellow-600">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-2 rounded-lg text-red-900 shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
              <Landmark size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider serif text-yellow-50">沈阳市红色文化遗产</h1>
              <div className="flex items-center space-x-2">
                 <p className="text-xs text-red-200 tracking-widest uppercase">数字化基因档案库</p>
                 <span className="text-[10px] bg-red-800 px-1 rounded border border-red-700">V1.0 Demo</span>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex bg-red-950/30 rounded-lg p-1">
            <Link to="/" className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${isActive('/')}`}>
              <Upload size={16} />
              <span>数据采集</span>
            </Link>
            <Link to="/records" className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${isActive('/records')}`}>
              <Database size={16} />
              <span>档案管理</span>
            </Link>
            <Link to="/graph" className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${isActive('/graph')}`}>
              <Share2 size={16} />
              <span>图谱/谱系</span>
            </Link>
          </nav>

          {/* Permission Simulator */}
          <div className="flex items-center space-x-2 text-xs bg-red-950/50 p-1.5 rounded-lg border border-red-800">
             <UserCircle size={14} className="text-yellow-500"/>
             <span className="text-red-200 mr-1">当前角色:</span>
             <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-red-900 text-white border-none outline-none cursor-pointer hover:text-yellow-400 font-bold"
             >
                 <option value="researcher">研究员 (全权限)</option>
                 <option value="guest">访客 (只读)</option>
             </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-500 py-8 border-t border-stone-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-stone-400">沈阳市红色文化遗产数字化项目组</p>
            <p className="text-xs mt-1">Shenyang Red Cultural Heritage Digitization Project</p>
          </div>
          <div className="text-xs flex space-x-4">
             <span>数据安全保障中</span>
             <span>内部科研版</span>
          </div>
        </div>
      </footer>
    </div>
  );
};