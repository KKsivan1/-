import React, { useState, createContext, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UploadPage } from './pages/UploadPage';
import { RecordsPage } from './pages/RecordsPage';
import { GraphPage } from './pages/GraphPage';
import { HeritageRecord, DataContextType, AuthContextType, UserRole } from './types';
import { INITIAL_DATA } from './services/dataService';

export const DataContext = createContext<DataContextType>({
  records: [],
  addRecords: () => {},
  updateRecord: () => {},
  clearRecords: () => {},
});

export const AuthContext = createContext<AuthContextType>({
    role: 'researcher',
    setRole: () => {}
});

const App: React.FC = () => {
  const [records, setRecords] = useState<HeritageRecord[]>([]);
  const [role, setRole] = useState<UserRole>('researcher');

  useEffect(() => {
    // Load local storage or mock data
    const saved = localStorage.getItem('shenyang_heritage_data');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords(INITIAL_DATA);
      }
    } else {
      setRecords(INITIAL_DATA);
    }
  }, []);

  const addRecords = (newRecords: HeritageRecord[]) => {
    const updated = [...records, ...newRecords];
    setRecords(updated);
    localStorage.setItem('shenyang_heritage_data', JSON.stringify(updated));
  };

  const updateRecord = (updatedRecord: HeritageRecord) => {
      const updatedList = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
      setRecords(updatedList);
      localStorage.setItem('shenyang_heritage_data', JSON.stringify(updatedList));
  };

  const clearRecords = () => {
    setRecords([]);
    localStorage.removeItem('shenyang_heritage_data');
  };

  return (
    <AuthContext.Provider value={{ role, setRole }}>
        <DataContext.Provider value={{ records, addRecords, updateRecord, clearRecords }}>
        <HashRouter>
            <Layout>
            <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/graph" element={<GraphPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Layout>
        </HashRouter>
        </DataContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;