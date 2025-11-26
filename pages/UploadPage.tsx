import React, { useState, useRef, useContext } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Lock, FilePlus, Image as ImageIcon, Box, Ruler, BookOpen, ChevronRight } from 'lucide-react';
import { parseCSV, getFileType, formatFileSize } from '../services/dataService';
import { DataContext, AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { HeritageRecord, ResourceItem } from '../types';

export const UploadPage: React.FC = () => {
  const { records, addRecords, updateRecord } = useContext(DataContext);
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Tabs
  const [mode, setMode] = useState<'batch' | 'asset'>('batch');

  // CSV Import State
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [report, setReport] = useState<{success: number, errors: string[]}>({ success: 0, errors: [] });
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Asset Upload State
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [assetCategory, setAssetCategory] = useState<keyof HeritageRecord>('fieldImages');
  const [assetStatus, setAssetStatus] = useState<'idle' | 'success'>('idle');
  const [lastUploadedAsset, setLastUploadedAsset] = useState<string>('');
  const assetInputRef = useRef<HTMLInputElement>(null);

  // Permission Block
  if (role === 'guest') {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="bg-stone-200 p-6 rounded-full mb-6">
                  <Lock size={64} className="text-stone-400" />
              </div>
              <h2 className="text-2xl font-bold text-stone-700 mb-2">权限受限</h2>
              <p className="text-stone-500 max-w-md">
                  您当前为“访客”身份，无权访问数据采集与录入模块。请联系管理员或在右上角切换至“研究员”角色进行演示。
              </p>
          </div>
      )
  }

  // --- CSV Handlers ---
  const handleCSVProcess = async (file: File) => {
    setStatus('processing');
    try {
      const text = await file.text();
      const result = parseCSV(text);
      setReport({ success: result.success.length, errors: result.errors });
      
      setTimeout(() => {
        if (result.success.length > 0) {
            addRecords(result.success);
            setStatus(result.errors.length > 0 ? 'error' : 'success'); 
        } else {
            setStatus('error');
        }
      }, 800);
    } catch (err) {
      setStatus('error');
      setReport({ success: 0, errors: ["文件解析发生的未知错误"] });
    }
  };

  // --- Asset Handlers ---
  const handleAssetProcess = (file: File) => {
      if (!selectedRecordId) return;
      const record = records.find(r => r.id === selectedRecordId);
      if (!record) return;

      const fileType = getFileType(file.name);
      const newResource: ResourceItem = {
          name: file.name,
          type: fileType,
          size: formatFileSize(file.size),
          date: new Date().toISOString().split('T')[0],
          url: URL.createObjectURL(file) // Create ephemeral URL for demo
      };

      const updatedRecord = { ...record };
      // Initialize array if undefined
      const currentList = (updatedRecord[assetCategory] as ResourceItem[]) || [];
      updatedRecord[assetCategory] = [...currentList, newResource] as any;

      updateRecord(updatedRecord);
      setLastUploadedAsset(file.name);
      setAssetStatus('success');
      setTimeout(() => setAssetStatus('idle'), 3000);
  };

  // Generic Drag Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'csv' | 'asset') => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'csv') handleCSVProcess(e.dataTransfer.files[0]);
      else handleAssetProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-red-900 mb-2 serif">数据采集与入库</h2>
        <p className="text-stone-600">支持批量导入档案数据，或上传特定的测绘、模型与影像资料。</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
          <div className="bg-stone-200 p-1 rounded-lg flex space-x-1">
              <button 
                onClick={() => setMode('batch')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${mode === 'batch' ? 'bg-white text-red-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <FileText size={16}/> 批量建档 (CSV)
              </button>
              <button 
                onClick={() => setMode('asset')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${mode === 'asset' ? 'bg-white text-red-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <FilePlus size={16}/> 素材上传 (Files)
              </button>
          </div>
      </div>

      {/* --- Batch Mode --- */}
      {mode === 'batch' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
                <div 
                    className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer h-full flex flex-col justify-center items-center ${dragActive ? 'border-red-600 bg-red-50' : 'border-stone-300 hover:border-red-400 bg-white'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'csv')}
                    onClick={() => csvInputRef.current?.click()}
                >
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleCSVProcess(e.target.files[0])} />
                    
                    {status === 'idle' || status === 'processing' ? (
                        <>
                            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
                                <UploadCloud size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-stone-700 mb-2">点击或拖拽上传 CSV 文件</h3>
                            <p className="text-sm text-stone-500 mb-6">支持批量导入基础档案信息</p>
                        </>
                    ) : null}

                    {status === 'processing' && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl z-10">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-900 border-t-transparent mb-3"></div>
                                <span className="text-red-900 font-medium">数据清洗中...</span>
                            </div>
                        </div>
                    )}

                    {(status === 'success' || status === 'error') && (
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                {status === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-stone-700 mb-2">处理完成</h3>
                            <p className="text-stone-600 mb-4">
                                成功: <span className="text-green-600 font-bold">{report.success}</span> | 
                                异常: <span className="text-red-600 font-bold">{report.errors.length}</span>
                            </p>
                             <div className="flex space-x-4">
                                <button onClick={(e) => { e.stopPropagation(); navigate('/records'); }} className="px-4 py-2 bg-stone-700 text-white rounded hover:bg-stone-800">查看档案</button>
                                <button onClick={(e) => { e.stopPropagation(); setStatus('idle'); }} className="px-4 py-2 bg-stone-200 text-stone-700 rounded hover:bg-stone-300">继续上传</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h4 className="font-bold text-red-900 mb-3 text-sm flex items-center gap-2"><FileText size={16}/> 模板说明</h4>
                    <p className="text-xs text-stone-500 mb-3">请上传 UTF-8 编码的 CSV 文件。</p>
                    <div className="bg-stone-800 text-stone-300 p-3 rounded text-xs font-mono overflow-x-auto whitespace-pre">
                        标题,地点,年份,人物...<br/>张氏帅府,沈河区,1914,张作霖
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* --- Asset Mode --- */}
      {mode === 'asset' && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-fade-in flex flex-col md:flex-row">
              {/* Configuration Panel */}
              <div className="p-8 md:w-1/3 bg-stone-50 border-r border-stone-100 space-y-6">
                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-2">1. 选择所属遗产点</label>
                      <select 
                        className="w-full p-3 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-red-800 outline-none"
                        value={selectedRecordId}
                        onChange={(e) => setSelectedRecordId(e.target.value)}
                      >
                          <option value="">-- 请选择 --</option>
                          {records.map(r => (
                              <option key={r.id} value={r.id}>{r.title}</option>
                          ))}
                      </select>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-2">2. 选择资料归属区域</label>
                      <div className="space-y-2">
                          {[
                              { id: 'fieldImages', label: '实地调研 - 照片', icon: <ImageIcon size={14}/> },
                              { id: 'mappingData', label: '实地调研 - 测绘 (CAD)', icon: <Ruler size={14}/> },
                              { id: 'models', label: '数字化模型 (3D)', icon: <Box size={14}/> },
                              { id: 'literature', label: '文献资料 (PDF/Doc)', icon: <FileText size={14}/> },
                              { id: 'publicity', label: '科普图册', icon: <BookOpen size={14}/> }
                          ].map(opt => (
                              <div 
                                key={opt.id}
                                onClick={() => setAssetCategory(opt.id as any)}
                                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${assetCategory === opt.id ? 'bg-red-50 border-red-500 text-red-900' : 'bg-white border-stone-200 hover:border-red-300'}`}
                              >
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                      {opt.icon} {opt.label}
                                  </div>
                                  {assetCategory === opt.id && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Drop Zone */}
              <div className="md:w-2/3 p-8 relative flex flex-col">
                    {!selectedRecordId ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                            <Lock size={32} className="mb-2"/>
                            <p className="text-sm">请先在左侧选择遗产点</p>
                        </div>
                    ) : (
                        <div 
                            className={`flex-grow border-3 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${dragActive ? 'border-red-500 bg-red-50' : 'border-stone-300 hover:border-red-400 hover:bg-stone-50'}`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                            onDrop={(e) => handleDrop(e, 'asset')}
                            onClick={() => assetInputRef.current?.click()}
                        >
                            <input ref={assetInputRef} type="file" multiple={false} className="hidden" onChange={(e) => e.target.files?.[0] && handleAssetProcess(e.target.files[0])} />
                            
                            {assetStatus === 'success' ? (
                                <div className="text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <CheckCircle size={32}/>
                                    </div>
                                    <h4 className="text-green-800 font-bold mb-1">上传成功</h4>
                                    <p className="text-green-600 text-sm">{lastUploadedAsset}</p>
                                </div>
                            ) : (
                                <div className="text-center pointer-events-none">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                        <FilePlus size={32}/>
                                    </div>
                                    <h4 className="text-stone-700 font-bold mb-1">拖拽文件至此 或 点击上传</h4>
                                    <p className="text-stone-400 text-xs mt-2">支持 .jpg, .png, .pdf, .dwg, .skp, .doc 等格式</p>
                                    <p className="text-stone-400 text-xs">系统将自动识别文件类型并归档</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Helper text */}
                    <div className="mt-4 flex items-start gap-2 text-xs text-stone-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                        <div className="mt-0.5 text-yellow-600"><AlertTriangle size={12}/></div>
                        <p>注意：演示模式下，上传的文件仅在当前浏览器会话中有效。刷新页面后，新添加的文件记录将保留，但文件内容（Blob URL）将失效。</p>
                    </div>
              </div>
          </div>
      )}
    </div>
  );
};