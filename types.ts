import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface ResourceItem {
  name: string;
  type: 'pdf' | 'image' | 'cad' | 'model' | 'doc';
  url?: string;
  date?: string;
  size?: string;
}

export interface HeritageRecord {
  id: string;
  title: string;
  category: string; // e.g., 纪念馆, 旧址, 故居
  location: string;
  year: string;
  person: string;
  event: string;
  description?: string;
  status?: string; // e.g., 保护良好, 需修缮
  imageUrl?: string;
  researchNotes?: string; // 调研成果
  
  // Architectural Research Extension
  literature?: ResourceItem[];      // 1. 文献资料
  fieldImages?: ResourceItem[];     // 2. 实地调研-照片
  mappingData?: ResourceItem[];     // 2. 实地调研-测绘数据 (CAD/Drawings)
  models?: ResourceItem[];          // 3. 建模资料 (3D/BIM)
  publicity?: ResourceItem[];       // 4. 科普图册
  
  // Index signature to allow dynamic access by key
  [key: string]: any;
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  group: 'person' | 'location' | 'event' | 'site';
  radius?: number;
  img?: string;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ImportResult {
  success: HeritageRecord[];
  errors: string[];
}

// For Context API
export interface DataContextType {
  records: HeritageRecord[];
  addRecords: (newRecords: HeritageRecord[]) => void;
  updateRecord: (updatedRecord: HeritageRecord) => void;
  clearRecords: () => void;
}

export type UserRole = 'admin' | 'researcher' | 'guest';

export interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}