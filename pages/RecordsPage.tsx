import React, { useContext, useState, useMemo, useRef } from 'react';
import { DataContext } from '../App';
import { Search, MapPin, Calendar, Eye, X, FileText, Camera, Ruler, Box, BookOpen, Flag, DownloadCloud, File, Edit3, Save, Trash2, PlusCircle, ExternalLink, Maximize2 } from 'lucide-react';
import { HeritageRecord, ResourceItem } from '../types';
import { getFileType, formatFileSize } from '../services/dataService';

// --- Components ---

const AssetCard: React.FC<{ 
    item: ResourceItem; 
    editable: boolean; 
    onDelete: () => void;
    onPreview: () => void; 
}> = ({ item, editable, onDelete, onPreview }) => {
    const getIcon = () => {
        switch (item.type) {
            case 'cad': return <Ruler className="text-blue-600" size={20} />;
            case 'model': return <Box className="text-purple-600" size={20} />;
            case 'pdf': return <FileText className="text-red-600" size={20} />;
            case 'image': return <Camera className="text-emerald-600" size={20} />;
            default: return <File className="text-stone-500" size={20} />;
        }
    };

    const getBgColor = () => {
        switch (item.type) {
            case 'cad': return 'bg-blue-50 border-blue-100 hover:border-blue-300';
            case 'model': return 'bg-purple-50 border-purple-100 hover:border-purple-300';
            case 'pdf': return 'bg-red-50 border-red-100 hover:border-red-300';
            case 'image': return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300';
            default: return 'bg-stone-50 border-stone-100 hover:border-stone-300';
        }
    };

    return (
        <div 
            onClick={onPreview}
            className={`relative flex items-center p-3 rounded-lg border ${getBgColor()} transition-all shadow-sm hover:shadow-md cursor-pointer group select-none`}
        >
            <div className="mr-3 p-2 bg-white rounded-md shadow-sm">
                {getIcon()}
            </div>
            <div className="flex-grow min-w-0 pr-8">
                <p className="text-sm font-semibold text-stone-800 truncate" title={item.name}>{item.name}</p>
                <div className="flex items-center text-xs text-stone-500 space-x-2">
                    <span className="uppercase">{item.type}</span>
                    {item.size && <span>• {item.size}</span>}
                </div>
            </div>
            
            {editable ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="删除此文件"
                >
                    <Trash2 size={14} />
                </button>
            ) : (
                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={18} />
                </div>
            )}
        </div>
    );
};

const PreviewModal: React.FC<{ item: ResourceItem; onClose: () => void }> = ({ item, onClose }) => {
    const renderContent = () => {
        if (item.type === 'image') {
            return (
                <div className="flex items-center justify-center h-full bg-stone-900/50 p-4">
                    <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain rounded shadow-2xl" />
                </div>
            );
        }
        if (item.type === 'pdf') {
            return (
                <iframe src={item.url} className="w-full h-full bg-stone-100" title={item.name}></iframe>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 p-8 text-center">
                <div className="bg-stone-100 p-6 rounded-full mb-4">
                    {item.type === 'cad' ? <Ruler size={48} /> : item.type === 'model' ? <Box size={48}/> : <File size={48}/>}
                </div>
                <h3 className="text-xl font-bold text-stone-700 mb-2">无法在线预览此类文件</h3>
                <p className="max-w-md mb-6">
                    系统暂不支持在线浏览 <strong>.{item.name.split('.').pop()}</strong> 格式。
                    <br/>请下载后使用专业软件（如 AutoCAD, SketchUp）查看。
                </p>
                {item.url && (
                    <a href={item.url} download={item.name} className="px-6 py-2 bg-red-900 text-white rounded hover:bg-red-800 flex items-center gap-2">
                        <DownloadCloud size={18}/> 下载文件
                    </a>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-stone-900/90 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 text-white shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white/10 rounded">
                        {item.type === 'image' ? <Camera size={20}/> : <FileText size={20}/>}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold truncate text-sm md:text-base">{item.name}</h3>
                        <p className="text-xs text-stone-400">{item.size} • {item.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {item.url && (
                        <a 
                            href={item.url} 
                            download={item.name}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title="下载"
                            onClick={e => e.stopPropagation()}
                        >
                            <DownloadCloud size={20} />
                        </a>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-full transition-colors ml-2">
                        <X size={24} />
                    </button>
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-grow overflow-hidden relative" onClick={e => e.stopPropagation()}>
                {item.url ? renderContent() : (
                    <div className="flex items-center justify-center h-full text-white">文件链接已失效</div>
                )}
            </div>
        </div>
    );
};

// Define Tab Configuration outside component to avoid re-creation
const TABS = [
    { id: 'info', label: '基础档案', icon: FileText },
    { id: 'survey', label: '实地调研', icon: Ruler },
    { id: 'assets', label: '数字模型', icon: Box },
    { id: 'publicity', label: '科普图册', icon: BookOpen },
] as const;

export const RecordsPage: React.FC = () => {
  const { records, updateRecord } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<HeritageRecord | null>(null);
  
  // Detail Modal State
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<HeritageRecord | null>(null);

  // Preview State
  const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);

  // Hidden file input for adding assets
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetAssetArray, setTargetAssetArray] = useState<keyof HeritageRecord | null>(null);

  const categories = useMemo(() => {
      const cats = new Set(records.map(r => r.category).filter(Boolean));
      return ['all', ...Array.from(cats)];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = Object.values(record).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [records, searchTerm, filterCategory]);

  const handleOpenRecord = (rec: HeritageRecord) => {
      setSelectedRecord(rec);
      setEditForm(JSON.parse(JSON.stringify(rec))); // Deep copy for editing
      setIsEditing(false);
      setActiveTab('info');
  };

  const handleSave = () => {
      if (editForm) {
          updateRecord(editForm);
          setSelectedRecord(editForm);
          setIsEditing(false);
      }
  };

  const handleTextChange = (field: keyof HeritageRecord, value: string) => {
      if (editForm) {
          setEditForm({ ...editForm, [field]: value });
      }
  };

  const handleAddAssetClick = (arrayKey: keyof HeritageRecord) => {
      setTargetAssetArray(arrayKey);
      fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && targetAssetArray && editForm) {
          const file = e.target.files[0];
          const type = getFileType(file.name);
          const newAsset: ResourceItem = {
              name: file.name,
              type: type,
              size: formatFileSize(file.size),
              date: new Date().toISOString().split('T')[0],
              url: URL.createObjectURL(file)
          };
          
          const currentList = (editForm[targetAssetArray] as ResourceItem[]) || [];
          setEditForm({
              ...editForm,
              [targetAssetArray]: [...currentList, newAsset]
          });
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAsset = (arrayKey: keyof HeritageRecord, index: number) => {
      if (editForm) {
          const currentList = (editForm[arrayKey] as ResourceItem[]) || [];
          const newList = [...currentList];
          newList.splice(index, 1);
          setEditForm({ ...editForm, [arrayKey]: newList });
      }
  };

  // Helper to render asset section
  const renderAssetSection = (title: string, arrayKey: keyof HeritageRecord, icon: React.ReactNode) => {
      const list = isEditing ? (editForm?.[arrayKey] as ResourceItem[]) : (selectedRecord?.[arrayKey] as ResourceItem[]);
      const safeList = list || [];

      return (
          <div className="mb-8">
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                  <h3 className="flex items-center text-lg font-bold text-stone-800">
                      {icon} <span className="ml-2">{title}</span>
                  </h3>
                  {isEditing && (
                      <button 
                        onClick={() => handleAddAssetClick(arrayKey)}
                        className="flex items-center text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                      >
                          <PlusCircle size={14} className="mr-1"/> 添加文件
                      </button>
                  )}
              </div>
              
              {safeList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {safeList.map((item, idx) => (
                          <AssetCard 
                            key={`${item.name}-${idx}`} 
                            item={item} 
                            editable={isEditing}
                            onDelete={() => handleDeleteAsset(arrayKey, idx)}
                            onPreview={() => setPreviewItem(item)}
                          />
                      ))}
                  </div>
              ) : (
                  <div className="p-8 text-center bg-stone-50 rounded-lg text-stone-400 border border-dashed border-stone-200">
                      暂无数据
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="space-y-6">
      {/* Hidden Global File Input for Edit Mode */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

      {/* Preview Modal Overlay */}
      {previewItem && (
          <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-red-900 serif">建筑遗产综合档案库</h2>
          <p className="text-stone-500 mt-2 text-sm">已归档 {records.length} 处遗产点，涵盖测绘、建模、文献等科研数据</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select 
            className="px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-800"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
              <option value="all">全部分类</option>
              {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
              ))}
          </select>

          <div className="relative flex-grow sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="搜索档案..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-800 shadow-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((rec) => (
              <div 
                key={rec.id} 
                className="group bg-white rounded-xl border border-stone-200 hover:border-red-300 hover:shadow-lg transition-all cursor-pointer flex flex-col overflow-hidden"
                onClick={() => handleOpenRecord(rec)}
              >
                {/* Card Image */}
                <div className="h-40 bg-stone-100 relative overflow-hidden">
                    {rec.imageUrl ? (
                        <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                            <Flag className="text-red-200" size={48} />
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-red-800 text-xs font-bold rounded shadow-sm border border-red-100">
                            {rec.category}
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow">
                    <h3 className="text-lg font-bold text-stone-800 serif mb-2 group-hover:text-red-800 transition-colors">
                        {rec.title}
                    </h3>
                    <div className="space-y-2 text-sm text-stone-600">
                        <div className="flex items-start">
                            <MapPin size={14} className="mr-2 mt-1 text-stone-400 flex-shrink-0" />
                            <span className="truncate-2-lines">{rec.location}</span>
                        </div>
                    </div>
                </div>
              </div>
          ))}
      </div>

      {/* Detail Modal */}
      {selectedRecord && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedRecord(null)}>
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-red-900 text-white p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold serif">{selectedRecord.title}</h2>
                        <div className="flex items-center gap-4 text-red-200 text-sm mt-1">
                            <span className="flex items-center gap-1"><MapPin size={14}/> {selectedRecord.location}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-red-900 rounded hover:bg-yellow-400 font-bold shadow-md transition-colors"
                            >
                                <Save size={18} /> 保存修改
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                            >
                                <Edit3 size={18} /> 编辑档案
                            </button>
                        )}
                        <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-white/10 rounded-full">
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Tab Nav */}
                <div className="flex border-b border-stone-200 bg-stone-50 px-6 shrink-0">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'border-red-800 text-red-900 bg-white' 
                                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8 bg-white">
                    
                    {/* INFO TAB */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-red-900 uppercase border-b border-red-100 pb-2 mb-3">历史沿革</h4>
                                    {isEditing ? (
                                        <textarea 
                                            className="w-full h-40 p-3 border border-stone-300 rounded focus:border-red-500 outline-none resize-none"
                                            value={editForm.description || ''}
                                            onChange={(e) => handleTextChange('description', e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-stone-700 leading-relaxed text-justify">{editForm.description || '暂无描述'}</p>
                                    )}
                                </div>
                                
                                <div>
                                     <h4 className="text-sm font-bold text-red-900 uppercase border-b border-red-100 pb-2 mb-3">调研笔记</h4>
                                     {isEditing ? (
                                        <textarea 
                                            className="w-full h-32 p-3 border border-yellow-300 bg-yellow-50 rounded focus:border-yellow-500 outline-none resize-none"
                                            value={editForm.researchNotes || ''}
                                            onChange={(e) => handleTextChange('researchNotes', e.target.value)}
                                        />
                                     ) : (
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-900/80 text-sm italic">
                                            {editForm.researchNotes || "暂无调研笔记"}
                                        </div>
                                     )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                                    <h5 className="text-xs font-bold text-stone-400 uppercase mb-2">保护状态</h5>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-stone-300 rounded"
                                            value={editForm.status || ''}
                                            onChange={(e) => handleTextChange('status', e.target.value)}
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${editForm.status?.includes('良好') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                            <span className="font-bold text-stone-700">{editForm.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SURVEY TAB */}
                    {activeTab === 'survey' && (
                        <div className="animate-fade-in">
                            {renderAssetSection('实地影像资料 (Photos)', 'fieldImages', <Camera className="text-red-800"/>)}
                            {renderAssetSection('测绘图纸 (CAD/Drawings)', 'mappingData', <Ruler className="text-blue-700"/>)}
                        </div>
                    )}

                    {/* ASSETS TAB */}
                    {activeTab === 'assets' && (
                        <div className="animate-fade-in">
                            {renderAssetSection('三维建模 (Models)', 'models', <Box className="text-purple-700"/>)}
                            {renderAssetSection('文献档案 (Docs)', 'literature', <FileText className="text-stone-700"/>)}
                        </div>
                    )}

                    {/* PUBLICITY TAB */}
                    {activeTab === 'publicity' && (
                        <div className="animate-fade-in">
                            {renderAssetSection('科普宣传图册', 'publicity', <BookOpen className="text-orange-700"/>)}
                        </div>
                    )}

                </div>
            </div>
        </div>
      )}
    </div>
  );
};