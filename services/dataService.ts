import { HeritageRecord, GraphData, GraphNode, GraphLink, ImportResult, ResourceItem } from '../types';

// Helper to determine file type based on extension
export const getFileType = (filename: string): ResourceItem['type'] => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['dwg', 'dxf', 'dwt'].includes(ext)) return 'cad';
  if (['skp', 'obj', 'rvt', '3ds', 'fbx', 'gltf', 'glb', 'stl', 'pts', 'ply'].includes(ext)) return 'model';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) return 'doc';
  return 'doc'; // default fallback
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Shenyang Specific Mock Data with Architectural Assets
export const INITIAL_DATA: HeritageRecord[] = [
  { 
    id: '1', 
    title: '张氏帅府', 
    category: '建筑遗产/官邸',
    location: '沈阳市沈河区朝阳街', 
    year: '1914', 
    person: '张作霖;张学良;葛香亭(建筑师)', 
    event: '东北易帜',
    status: '保护良好',
    description: '张氏帅府由大青楼、小青楼、西院红楼群及帅府花园等组成。建筑风格中西合璧，大青楼为仿罗马式建筑，小青楼为仿日本庭园式建筑，是东北地区保存最为完好的名人故居之一。',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Marshal_Zhang%27s_Mansion_20190822.jpg/640px-Marshal_Zhang%27s_Mansion_20190822.jpg',
    researchNotes: '大青楼结构主体完好，但北部墙体有轻微风化迹象。2024年3月进行了三维激光扫描测绘。',
    literature: [
      { name: '张氏帅府建筑历史沿革考.pdf', type: 'pdf', size: '2.4MB', date: '2023-11', url: 'https://pdfobject.com/pdf/sample.pdf' }, // Added sample PDF
      { name: '民国时期东北官邸建筑研究.docx', type: 'doc', size: '1.1MB', date: '2024-01' }
    ],
    fieldImages: [
      { name: '大青楼正立面现状.jpg', type: 'image', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Former_Residence_of_Zhang_Zuolin_and_Zhang_Xueliang_6.jpg/320px-Former_Residence_of_Zhang_Zuolin_and_Zhang_Xueliang_6.jpg' },
      { name: '老虎厅内部装饰细部.jpg', type: 'image', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Former_Residence_of_Zhang_Zuolin_and_Zhang_Xueliang_3.jpg/320px-Former_Residence_of_Zhang_Zuolin_and_Zhang_Xueliang_3.jpg' }
    ],
    mappingData: [
      { name: '大青楼一层平面测绘图.dwg', type: 'cad', size: '5.6MB', date: '2024-03' },
      { name: '西院红楼立面修复图.dwg', type: 'cad', size: '4.2MB', date: '2024-03' }
    ],
    models: [
      { name: '张氏帅府全景点云模型.pts', type: 'model', size: '1.2GB', date: '2024-03' },
      { name: '大青楼BIM信息模型.rvt', type: 'model', size: '450MB', date: '2024-04' }
    ],
    publicity: [
      { name: '走进帅府-科普导览手册.pdf', type: 'pdf', size: '8.5MB', url: 'https://pdfobject.com/pdf/sample.pdf' }
    ]
  },
  { 
    id: '2', 
    title: '中共满洲省委旧址', 
    category: '革命旧址/硬山式建筑',
    location: '沈阳市和平区皇寺路', 
    year: '1927', 
    person: '刘少奇;陈为人', 
    event: '中共满洲省委建立',
    status: '重点保护',
    description: '典型的东北硬山式青砖瓦房，面阔三间，进深两间。建筑形制朴素，反映了20世纪20年代沈阳普通民居的建筑特点。',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Site_of_CPC_Manchuria_Provincial_Committee.jpg/640px-Site_of_CPC_Manchuria_Provincial_Committee.jpg',
    mappingData: [
      { name: '旧址修缮工程平面图.dwg', type: 'cad', size: '1.2MB' }
    ]
  },
  { 
    id: '3', 
    title: '“九·一八”历史博物馆', 
    category: '现代纪念性建筑',
    location: '沈阳市大东区望花南街46号', 
    year: '1991', 
    person: '张学良;赵一曼;齐康(建筑师)', 
    event: '九一八事变',
    status: '保护良好',
    description: '建筑采用残历碑造型，混凝土结构，象征着一本翻开的台历，记录着1931年9月18日这一历史时刻。',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/9.18_Museum.jpg/640px-9.18_Museum.jpg',
    models: [
      { name: '残历碑结构模型.skp', type: 'model', size: '45MB' }
    ]
  },
  { 
    id: '4', 
    title: '沈阳二战盟军战俘营旧址', 
    category: '工业遗址/军事建筑',
    location: '沈阳市大东区地坛街', 
    year: '1942', 
    person: '温莱特', 
    event: '太平洋战争',
    status: '需修缮',
    description: '原有建筑群包括营房、水塔、医院等，多为红砖砌筑的单层或双层建筑，具有典型的日式军事建筑风格。',
    fieldImages: [
       { name: '1号营房墙体裂缝调研.jpg', type: 'image' }
    ]
  },
  { 
    id: '5', 
    title: '抗美援朝烈士陵园', 
    category: '纪念性景观建筑',
    location: '沈阳市皇姑区陵东街', 
    year: '1951', 
    person: '黄继光;邱少云', 
    event: '抗美援朝',
    status: '保护良好',
    description: '陵园建筑群包括纪念碑、烈士墓群、纪念馆等，采用中国传统陵园布局与现代纪念碑相结合的设计手法。'
  }
];

export const parseCSV = (csvText: string): ImportResult => {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  const result: ImportResult = { success: [], errors: [] };
  
  if (lines.length < 2) {
    result.errors.push("文件为空或格式错误");
    return result;
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  if (!headers.some(h => h.includes('标题') || h.includes('title'))) {
      result.errors.push("CSV 缺少必需的 '标题' 列");
      return result;
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    const record: any = { id: `import-${Date.now()}-${i}` };
    
    const getVal = (key: string, altKey: string) => {
        const hIndex = headers.findIndex(h => h.includes(key) || h.includes(altKey));
        return hIndex !== -1 ? values[hIndex] : '';
    };

    record.title = getVal('title', '标题');
    record.category = getVal('category', '分类') || '未分类';
    record.location = getVal('location', '地点');
    record.year = getVal('year', '年份');
    record.person = getVal('person', '人物');
    record.event = getVal('event', '事件');
    record.status = getVal('status', '状态') || '未知';
    record.description = getVal('desc', '描述') || '';
    record.imageUrl = getVal('image', '图片') || '';

    // Simple parser for demo: assume user might input file names separated by semicolon for these fields
    const createResources = (str: string, type: ResourceItem['type']): ResourceItem[] => {
        if (!str) return [];
        return str.split(';').map(s => ({ name: s.trim(), type }));
    };

    record.literature = createResources(getVal('literature', '文献'), 'pdf');
    record.mappingData = createResources(getVal('mapping', '测绘'), 'cad');
    record.models = createResources(getVal('models', '建模'), 'model');

    const missingFields = [];
    if (!record.title) missingFields.push('标题');
    if (!record.location) missingFields.push('地点');
    
    if (missingFields.length > 0) {
        result.errors.push(`第 ${i + 1} 行数据校验失败: 缺少 ${missingFields.join(', ')}`);
    } else {
        result.success.push(record as HeritageRecord);
    }
  }
  return result;
};

export const generateGraphData = (records: HeritageRecord[]): GraphData => {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  const addNode = (id: string, group: GraphNode['group'], img?: string) => {
    if (!id || id === '-') return;
    if (!nodes.has(id)) {
      nodes.set(id, { id, group, radius: group === 'site' ? 18 : group === 'event' ? 12 : 8, img });
    }
  };

  records.forEach(rec => {
    addNode(rec.title, 'site', rec.imageUrl);
    const people = rec.person.split(/[;|、]/).map(s => s.trim()).filter(s => s);
    const eventName = rec.event;
    const locName = rec.location; 
    const district = locName.match(/(.+?区)/)?.[1] || locName; 

    if (eventName) addNode(eventName, 'event');
    if (district) addNode(district, 'location');
    people.forEach(p => addNode(p, 'person'));

    if (eventName) {
        links.push({ source: rec.title, target: eventName, value: 3 });
        people.forEach(p => {
             links.push({ source: p, target: eventName, value: 2 });
             links.push({ source: p, target: rec.title, value: 1 });
        });
    }

    if (district) {
         links.push({ source: rec.title, target: district, value: 2 });
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    links
  };
};