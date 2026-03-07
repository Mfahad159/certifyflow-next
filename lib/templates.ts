export interface TemplateLayer {
  id: string;
  type: 'text' | 'staticText' | 'image' | 'qrcode';
  text?: string;
  column?: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  size?: number;
  width?: number;
  height?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  baseStyle: {
    background: string;
    border: string;
    primaryColor: string;
    accentColor: string;
  };
  layers: TemplateLayer[];
}

export const templates: Template[] = [
  {
    id: 'minimal-professional',
    name: 'Minimal Professional',
    description: 'Clean and elegant design for corporate certificates.',
    thumbnail: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=200&h=140&auto=format&fit=crop',
    baseStyle: {
      background: '#ffffff',
      border: '40px solid #f8f9fa',
      primaryColor: '#1a1a1a',
      accentColor: '#c5a059',
    },
    layers: [
      { id: 'l1', type: 'staticText', text: 'CERTIFICATE', x: 400, y: 120, fontSize: 60, color: '#1a1a1a', fontFamily: 'serif', bold: true, textAlign: 'center' },
      { id: 'l2', type: 'staticText', text: 'OF APPRECIATION', x: 400, y: 170, fontSize: 20, color: '#c5a059', fontFamily: 'sans-serif', bold: true, textAlign: 'center' },
      { id: 'l3', type: 'staticText', text: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO', x: 400, y: 240, fontSize: 14, color: '#666666', fontFamily: 'sans-serif', textAlign: 'center' },
      { id: 'l4', type: 'text', column: 'Name', x: 400, y: 320, fontSize: 45, color: '#1a1a1a', fontFamily: 'serif', bold: true, textAlign: 'center' },
      { id: 'l5', type: 'staticText', text: 'For successfully completing the program with excellence.', x: 400, y: 380, fontSize: 16, color: '#666666', fontFamily: 'sans-serif', textAlign: 'center' },
      { id: 'l6', type: 'qrcode', x: 350, y: 450, size: 100 }
    ]
  },
  {
    id: 'modern-technical',
    name: 'Modern Technical',
    description: 'Geometric patterns and bold typography for tech certifications.',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&h=140&auto=format&fit=crop',
    baseStyle: {
      background: '#0f172a',
      border: 'none',
      primaryColor: '#f8fafc',
      accentColor: '#38bdf8',
    },
    layers: [
      { id: 'l1', type: 'staticText', text: 'TECHNICAL CERTIFICATION', x: 400, y: 100, fontSize: 32, color: '#38bdf8', fontFamily: 'sans-serif', bold: true, textAlign: 'center' },
      { id: 'l2', type: 'staticText', text: 'PROUDLY RECOGNIZES', x: 400, y: 160, fontSize: 14, color: '#94a3b8', fontFamily: 'sans-serif', textAlign: 'center' },
      { id: 'l3', type: 'text', column: 'Name', x: 400, y: 240, fontSize: 50, color: '#f8fafc', fontFamily: 'sans-serif', bold: true, textAlign: 'center' },
      { id: 'l4', type: 'staticText', text: 'IN RECOGNITION OF OUTSTANDING ACHIEVEMENT IN THE FIELD', x: 400, y: 300, fontSize: 12, color: '#94a3b8', fontFamily: 'sans-serif', textAlign: 'center' },
      { id: 'l5', type: 'staticText', text: 'TECH STACK PROFICIENCY', x: 400, y: 340, fontSize: 18, color: '#38bdf8', fontFamily: 'sans-serif', bold: true, textAlign: 'center' },
      { id: 'l6', type: 'qrcode', x: 650, y: 420, size: 80 }
    ]
  },
  {
    id: 'creative-excellence',
    name: 'Creative Excellence',
    description: 'Elegant and artistic design for creative achievements.',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200&h=140&auto=format&fit=crop',
    baseStyle: {
      background: '#fffdfa',
      border: '20px solid #ece4d9',
      primaryColor: '#433422',
      accentColor: '#d4af37',
    },
    layers: [
      { id: 'l1', type: 'staticText', text: 'Excellence In Arts', x: 400, y: 120, fontSize: 48, color: '#433422', fontFamily: 'Georgia', italic: true, textAlign: 'center' },
      { id: 'l2', type: 'staticText', text: 'Awarded to', x: 400, y: 180, fontSize: 18, color: '#88745a', fontFamily: 'serif', textAlign: 'center' },
      { id: 'l3', type: 'text', column: 'Name', x: 400, y: 260, fontSize: 56, color: '#b8860b', fontFamily: 'Georgia', bold: true, textAlign: 'center' },
      { id: 'l4', type: 'staticText', text: 'For remarkable creativity and artistic vision.', x: 400, y: 340, fontSize: 16, color: '#433422', fontFamily: 'serif', textAlign: 'center' },
      { id: 'l5', type: 'qrcode', x: 50, y: 450, size: 90 }
    ]
  },
  {
    id: 'corporate-bold',
    name: 'Corporate Bold',
    description: 'Strong, high-contrast design for official recognition.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&h=140&auto=format&fit=crop',
    baseStyle: {
      background: '#ffffff',
      border: 'none',
      primaryColor: '#002855',
      accentColor: '#d4442e',
    },
    layers: [
      { id: 'l1', type: 'staticText', text: 'ACHIEVEMENT AWARD', x: 100, y: 100, fontSize: 40, color: '#002855', fontFamily: 'Impact', textAlign: 'left' },
      { id: 'l2', type: 'staticText', text: 'This serves to certify that', x: 100, y: 180, fontSize: 16, color: '#666', fontFamily: 'Verdana', textAlign: 'left' },
      { id: 'l3', type: 'text', column: 'Name', x: 100, y: 260, fontSize: 60, color: '#002855', fontFamily: 'Arial', bold: true, textAlign: 'left' },
      { id: 'l4', type: 'staticText', text: 'HAS REACHED THE PRESCRIBED MILESTONES OF THE QUARTER', x: 100, y: 320, fontSize: 14, color: '#d4442e', fontFamily: 'Arial', bold: true, textAlign: 'left' },
      { id: 'l5', type: 'qrcode', x: 600, y: 80, size: 120 }
    ]
  },
  {
    id: 'vibrant-startup',
    name: 'Vibrant Startup',
    description: 'Modern gradients and energetic design for fast-paced teams.',
    thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&h=140&auto=format&fit=crop',
    baseStyle: {
      background: '#f0f9ff',
      border: 'none',
      primaryColor: '#0c4a6e',
      accentColor: '#0ea5e9',
    },
    layers: [
      { id: 'l1', type: 'staticText', text: 'STARTUP STAR', x: 400, y: 120, fontSize: 50, color: '#0ea5e9', fontFamily: 'Impact', textAlign: 'center' },
      { id: 'l2', type: 'staticText', text: 'You killed it!', x: 400, y: 180, fontSize: 24, color: '#0c4a6e', fontFamily: 'Arial', bold: true, textAlign: 'center' },
      { id: 'l3', type: 'text', column: 'Name', x: 400, y: 280, fontSize: 65, color: '#0c4a6e', fontFamily: 'Arial', bold: true, textAlign: 'center' },
      { id: 'l4', type: 'staticText', text: 'Official Recognition for High-Growth Impact', x: 400, y: 360, fontSize: 18, color: '#64748b', fontFamily: 'Arial', textAlign: 'center' },
      { id: 'l5', type: 'qrcode', x: 350, y: 440, size: 100 }
    ]
  }
];
