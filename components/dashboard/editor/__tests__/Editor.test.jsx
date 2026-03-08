
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Editor from '../Editor';
import React, { act } from 'react';

import { campaignService } from '@/lib/campaignService';
import { supabase } from '@/lib/supabaseClient';

// -- MOCKS --

// Mock Fabric.js
vi.mock('fabric', () => {
    return {
      Canvas: vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        off: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        renderAll: vi.fn(),
        requestRenderAll: vi.fn(),
        dispose: vi.fn(),
        setZoom: vi.fn(),
        getObjects: vi.fn(() => []),
        setActiveObject: vi.fn(),
        getActiveObject: vi.fn(),
        setWidth: vi.fn(),
        setHeight: vi.fn(),
        sendObjectToBack: vi.fn(),
        moveObjectTo: vi.fn(),
        discardActiveObject: vi.fn(),
        upperCanvasEl: document.createElement('canvas'),
        lowerCanvasEl: document.createElement('canvas'),
        getElement: () => document.createElement('div')
      })),
      FabricImage: { 
          fromURL: vi.fn().mockResolvedValue({ 
              set: vi.fn(), 
              width: 100, 
              height: 100,
              scaleX: 1,
              scaleY: 1
          }) 
      },
      IText: vi.fn().mockImplementation(() => ({
          set: vi.fn(),
          setCoords: vi.fn()
      })),
      Rect: vi.fn().mockImplementation(() => ({
          set: vi.fn(),
          setCoords: vi.fn()
      })),
      Circle: vi.fn().mockImplementation(() => ({
          set: vi.fn(),
          setCoords: vi.fn()
      })),
      Triangle: vi.fn().mockImplementation(() => ({
          set: vi.fn(),
          setCoords: vi.fn()
      })),
      Shadow: vi.fn(),
      ActiveSelection: vi.fn(),
      StaticCanvas: vi.fn()
    };
});

// Mock Dependencies
vi.mock('@use-gesture/react', () => ({
  usePinch: vi.fn(() => () => {})
}));

vi.mock('@/lib/campaignService', () => ({
  campaignService: {
    getCampaign: vi.fn(), // We keep it but expect direct supabase usage
    updateCampaign: vi.fn()
  }
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-123' } }, 
          error: null 
      }),
      getSession: vi.fn().mockResolvedValue({ 
          data: { session: { user: { id: 'test-user-123' } } }, 
          error: null 
      }),
      signOut: vi.fn()
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockImplementation(() => ({
           single: vi.fn().mockResolvedValue({
              data: {
                id: 'campaign-123',
                name: 'Test Campaign',
                type: 'generate_only', 
                canvas_config: { textFields: [] },
                csv_data: { headers: ['Name'], data: [{ Name: 'John Doe' }]}
              },
              error: null
           }),
           then: vi.fn().mockResolvedValue({
              data: [],
              error: null
           }) // Handle certificates check
        }))
      }))
    }))
  }
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue(document.createElement('canvas'))
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    save: vi.fn(),
    addImage: vi.fn()
  }))
}));

vi.mock('jszip', () => ({
  default: vi.fn().mockImplementation(() => ({
    file: vi.fn(),
    generateAsync: vi.fn().mockResolvedValue(new Blob())
  }))
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,...')
  }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

describe('Editor Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/editor/campaign-123']}>
                <Routes>
                    <Route path="/dashboard/editor/:campaignId" element={<Editor />} />
                </Routes>
            </MemoryRouter>
        );

        // Check for default UI state immediately
        expect(screen.getByText(/Certificate Editor/)).toBeInTheDocument();
        expect(screen.getByText(/Certificate Editor/)).toBeInTheDocument();
    });
});
