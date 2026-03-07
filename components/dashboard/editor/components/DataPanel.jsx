import React from 'react';
import { 
  FileSpreadsheet 
} from 'lucide-react';
import { Input } from '../../../ui/input';

const DataPanel = ({ 
  uploadedImage, 
  handleCSV, 
  csvData, 
  loadDemoCSV, 
  csvColumns, 
  textFields, 
  setTextFields, 
  addTextField,
  setSelectedFieldId 
}) => {
  if (!uploadedImage) return null;

  return (
    <>
      {/* CSV Section */}
      <div className="mb-8 pt-4 border-t border-border/30">
        <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Data Source</h3>
        <div className="space-y-3">
          <div>
            <div className="relative group">
              <Input type="file" accept=".csv,.txt" onChange={handleCSV} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                csvData.length > 0 
                  ? 'border-accent/50 bg-accent/10 hover:bg-accent/15' 
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
              }`}>
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-background/50 flex items-center justify-center">
                  <FileSpreadsheet className="opacity-60" size={20} />
                </div>
                <span className="text-[12px] font-bold text-muted-foreground block">
                  {csvData.length > 0 ? `✓ ${csvData.length} Recipients` : 'Upload CSV Data'}
                </span>
              </div>
            </div>
            <button 
              onClick={loadDemoCSV}
              className="w-full mt-2 text-[12px] font-bold text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* CSV Columns */}
      {csvColumns.length > 0 && (
        <div className="mb-8 pt-4 border-t border-border/30">
          <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Available Columns</h3>
          <div className="flex flex-wrap gap-2">
            {csvColumns.map(col => {
              const isAdded = textFields.some(f => f.type === 'text' && f.column === col)
              return (
                <button 
                  key={col} 
                  onClick={() => addTextField(col)}
                  disabled={isAdded}
                  className={`text-[12px] px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all ${
                    isAdded 
                      ? 'bg-accent text-white opacity-60 cursor-not-allowed' 
                      : 'bg-background border border-border text-foreground hover:bg-accent/20 hover:border-accent/50'
                  }`}
                >
                  {col}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(DataPanel);
