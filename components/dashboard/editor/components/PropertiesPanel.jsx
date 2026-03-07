import React from 'react';
import { 
  Settings, 
  QrCode, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ChevronDown, 
  ChevronsUp, 
  ChevronUp, 
  ChevronsDown, 
  Copy, 
  Trash2,
  Loader2,
  Download,
  Send,
  Printer,
  FileText
} from 'lucide-react';
import { Input } from '../../../ui/input';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../../../ui/dropdown-menu';
import { Slider } from '../../../ui/slider';
import { Sketch } from '@uiw/react-color';

const PropertiesPanel = ({
  rightSidebarOpen,
  textFields,
  selectedFieldId,
  setSelectedFieldId,
  updateTextField,
  removeTextField,
  moveLayer,
  csvColumns,
  isEmailSendEnabled,
  saveImages,
  sendCertificatesViaEmail,
  handlePrint,
  exportAsPDF,
  saving,
  uploadedImage,
  csvData,
  sendingEmails,
  emailsSent,
  addToHistory,
  setTextFields,
  duplicateLayer,
  isTemplateMode
}) => {
  const field = textFields.find(f => f.id === selectedFieldId);

  return (
    <div className={`fixed right-4 top-24 bottom-4 z-10 ${rightSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-secondary/20 backdrop-blur-2xl border border-border rounded-[40px] overflow-hidden flex flex-col`}>
      {rightSidebarOpen && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6" style={{ touchAction: 'pan-y' }}>
          {field ? (
            <>
              <div>
                <div className="mb-6 pt-2">
                   <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Arrangement</h3>
                   <div className="grid grid-cols-4 gap-2">
                     <button 
                       onClick={() => moveLayer(selectedFieldId, 'front')}
                       className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border hover:bg-accent/10 hover:border-accent transition-all group"
                       title="Bring to Front"
                     >
                       <ChevronsUp size={14} className="group-hover:text-accent" />
                       <span className="text-[7px] font-bold">Front</span>
                     </button>
                     <button 
                       onClick={() => moveLayer(selectedFieldId, 'up')}
                       className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border hover:bg-accent/10 hover:border-accent transition-all group"
                       title="Bring Forward"
                     >
                       <ChevronUp size={14} className="group-hover:text-accent" />
                       <span className="text-[7px] font-bold">Forward</span>
                     </button>
                     <button 
                       onClick={() => moveLayer(selectedFieldId, 'down')}
                       className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border hover:bg-accent/10 hover:border-accent transition-all group"
                       title="Send Backward"
                     >
                       <ChevronDown size={14} className="group-hover:text-accent" />
                       <span className="text-[7px] font-bold">Back</span>
                     </button>
                     <button 
                       onClick={() => moveLayer(selectedFieldId, 'back')}
                       className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border hover:bg-accent/10 hover:border-accent transition-all group"
                       title="Send to Back"
                     >
                       <ChevronsDown size={14} className="group-hover:text-accent" />
                       <span className="text-[7px] font-bold">Bottom</span>
                     </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 mt-2">
                     <button 
                       onClick={() => duplicateLayer && duplicateLayer(selectedFieldId)}
                       className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-background border border-border hover:bg-accent/10 hover:border-accent transition-all group text-[12px] font-bold"
                     >
                       <Copy size={12} className="group-hover:text-accent" />
                       Duplicate
                     </button>
                     <button 
                       onClick={() => removeTextField(selectedFieldId)}
                       className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-background border border-border hover:bg-red-500/10 hover:border-red-500/50 transition-all group text-[12px] font-bold"
                     >
                       <Trash2 size={12} className="group-hover:text-red-500" />
                       Delete
                     </button>
                   </div>
                </div>

                <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Properties</h3>
                {(() => {
                  if (field.type === 'qrcode') {
                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode size={16} className="text-accent" />
                            <span className="text-xs font-bold text-accent">QR Code Verification</span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">
                            Each certificate will have a unique QR code for verification at certifyflow.com/verify
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Size <span>{field.size}px</span>
                          </label>
                          <Slider 
                            value={[field.size]} 
                            min={50}
                            max={500}
                            step={1}
                            onValueChange={([val]) => updateTextField(field.id, { size: val })}
                            className="py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Rotation <span>{Math.round(field.rotation || 0)}°</span>
                          </label>
                          <Slider 
                            value={[field.rotation || 0]} 
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={([val]) => updateTextField(field.id, { rotation: val })}
                            className="py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Opacity <span>{Math.round((field.opacity ?? 1) * 100)}%</span>
                          </label>
                          <Slider 
                            value={[(field.opacity ?? 1) * 100]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={([val]) => updateTextField(field.id, { opacity: val / 100 })}
                            className="py-2"
                          />
                        </div>
                        

                      </div>
                    )
                  } else if (field.type === 'image') {
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-2">Dimensions</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-muted-foreground block mb-1">Width</label>
                              <Input 
                                type="number" 
                                value={Math.round(field.width)} 
                                onChange={e => updateTextField(field.id, { width: Number(e.target.value) })}
                                className="h-9 text-sm rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" 
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-muted-foreground block mb-1">Height</label>
                              <Input 
                                type="number" 
                                value={Math.round(field.height)} 
                                onChange={e => updateTextField(field.id, { height: Number(e.target.value) })}
                                className="h-9 text-sm rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" 
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Rotation <span>{Math.round(field.rotation || 0)}°</span>
                          </label>
                          <Slider 
                            value={[field.rotation || 0]} 
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={([val]) => updateTextField(field.id, { rotation: val })}
                            className="py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Opacity <span>{Math.round((field.opacity ?? 1) * 100)}%</span>
                          </label>
                          <Slider 
                            value={[(field.opacity ?? 1) * 100]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={([val]) => updateTextField(field.id, { opacity: val / 100 })}
                            className="py-2"
                          />
                        </div>
                        

                      </div>
                    )
                  } else if (['rect', 'circle', 'triangle'].includes(field.type)) {
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-2">Color</label>
                          <div className="p-1 border border-border rounded-xl bg-background">
                             <Sketch 
                               color={field.color || '#A098FF'} 
                               onChange={(color) => updateTextField(field.id, { color: color.hex })}
                               disableAlpha 
                               presetColors={[]}
                               style={{ width: '100%', boxShadow: 'none' }}
                             />
                          </div>
                        </div>

                        {field.type === 'circle' ? (
                            <div>
                                <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                                  Radius <span>{field.radius || 50}px</span>
                                </label>
                                <Slider 
                                    value={[field.radius || 50]} 
                                    min={10}
                                    max={500}
                                    step={1}
                                    onValueChange={([val]) => updateTextField(field.id, { radius: val })}
                                    className="py-2"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[12px] font-bold text-muted-foreground block mb-2">Width</label>
                                    <Input 
                                        type="number" 
                                        value={field.width || 100} 
                                        onChange={e => updateTextField(field.id, { width: Number(e.target.value) })}
                                        className="h-9 text-sm rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold text-muted-foreground block mb-2">Height</label>
                                    <Input 
                                        type="number" 
                                        value={field.height || 100} 
                                        onChange={e => updateTextField(field.id, { height: Number(e.target.value) })}
                                        className="h-9 text-sm rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" 
                                    />
                                </div>
                            </div>
                        )}

                        {field.type === 'rect' && (
                            <div className="mt-4">
                                <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                                  Corner Radius <span>{field.cornerRadius || 0}px</span>
                                </label>
                                <Slider 
                                    value={[field.cornerRadius || 0]} 
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={([val]) => updateTextField(field.id, { cornerRadius: val })}
                                    className="py-2"
                                />
                            </div>
                        )}

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Rotation <span>{Math.round(field.rotation || 0)}°</span>
                          </label>
                          <Slider 
                            value={[field.rotation || 0]} 
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={([val]) => updateTextField(field.id, { rotation: val })}
                            className="py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Opacity <span>{Math.round((field.opacity ?? 1) * 100)}%</span>
                          </label>
                          <Slider 
                            value={[(field.opacity ?? 1) * 100]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={([val]) => updateTextField(field.id, { opacity: val / 100 })}
                            className="py-2"
                          />
                        </div>


                      </div>
                    )
                  } else {
                    // Default to text field properties
                    return (
                      <div className="space-y-4">
                        {field.type === 'staticText' ? (
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-2">Text Content</label>
                            <Input 
                              type="text" 
                              value={field.text} 
                              onChange={e => updateTextField(field.id, { text: e.target.value })}
                              className="h-9 text-sm rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" 
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-2">Column</label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-full h-10 px-2 rounded-full border border-input bg-background text-[12px] font-medium hover:bg-secondary transition-colors flex items-center justify-between cursor-pointer">
                                  {field.column}
                                  <ChevronDown size={12} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[200px]">
                                {csvColumns.map(col => (
                                  <DropdownMenuItem 
                                    key={col} 
                                    onClick={() => updateTextField(field.id, { column: col })}
                                  >
                                    {col}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                              Font Size <span>{field.fontSize}px</span>
                            </label>
                            <Slider 
                              value={[field.fontSize]} 
                              min={8}
                              max={200}
                              step={1}
                              onValueChange={([val]) => updateTextField(field.id, { fontSize: val })}
                              className="py-2"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-2">Align</label>
                            <div className="flex bg-background border border-border rounded-xl p-0.5">
                              {['left', 'center', 'right'].map((align) => (
                                <button
                                  key={align}
                                  onClick={() => updateTextField(field.id, { textAlign: align })}
                                  className={`flex-1 h-7 flex items-center justify-center rounded-lg transition-all ${
                                    field.textAlign === align ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-secondary'
                                  }`}
                                >
                                  {align === 'left' && <AlignLeft size={14} />}
                                  {align === 'center' && <AlignCenter size={14} />}
                                  {align === 'right' && <AlignRight size={14} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-2">Style</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateTextField(field.id, { bold: !field.bold })}
                              className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all ${
                                field.bold ? 'bg-accent border-accent text-white' : 'border-border text-muted-foreground hover:bg-secondary'
                              }`}
                            >
                              Bold
                            </button>
                            <button
                              onClick={() => updateTextField(field.id, { italic: !field.italic })}
                              className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all ${
                                field.italic ? 'bg-accent border-accent text-white' : 'border-border text-muted-foreground hover:bg-secondary'
                              }`}
                            >
                              Italic
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex-1 h-9 px-3 rounded-xl border border-border text-[12px] font-bold text-muted-foreground hover:bg-secondary transition-all flex items-center justify-between">
                                  {field.fontFamily || 'Arial'}
                                  <ChevronDown size={12} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact'].map(font => (
                                  <DropdownMenuItem key={font} onClick={() => updateTextField(field.id, { fontFamily: font })}>
                                    {font}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                              Spacing <span>{field.charSpacing || 0}</span>
                            </label>
                            <Slider 
                              value={[field.charSpacing || 0]} 
                              min={-100}
                              max={1000}
                              step={10}
                              onValueChange={([val]) => updateTextField(field.id, { charSpacing: val })}
                              className="py-2"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                              Height <span>{field.lineHeight || 1}</span>
                            </label>
                            <Slider 
                              value={[field.lineHeight || 1]} 
                              min={0.5}
                              max={3}
                              step={0.1}
                              onValueChange={([val]) => updateTextField(field.id, { lineHeight: val })}
                              className="py-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Rotation <span>{Math.round(field.rotation || 0)}°</span>
                          </label>
                          <Slider 
                            value={[field.rotation || 0]} 
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={([val]) => updateTextField(field.id, { rotation: val })}
                            className="py-2"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-3 flex justify-between">
                            Opacity <span>{Math.round((field.opacity ?? 1) * 100)}%</span>
                          </label>
                          <Slider 
                            value={[(field.opacity ?? 1) * 100]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={([val]) => updateTextField(field.id, { opacity: val / 100 })}
                            className="py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="text-[12px] font-bold text-muted-foreground block mb-2">Color</label>
                          <div className="flex flex-col gap-3">
                            <div className="p-1 border border-border rounded-xl bg-background">
                               <Sketch 
                                 color={field.color} 
                                 onChange={(color) => updateTextField(field.id, { color: color.hex })}
                                 disableAlpha 
                                 presetColors={[]}
                                 style={{ width: '100%', boxShadow: 'none' }}
                               />
                            </div>
                          </div>
                        </div>
                        

                      </div>
                    )
                  }
                })()}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/20 flex items-center justify-center">
                <Settings size={32} className="opacity-40" />
              </div>
              <p className="text-xs font-medium">Select a layer to edit properties</p>
            </div>
          )}

          {/* Export Section */}
          {!isTemplateMode && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Export & Send</h3>
              <div className="space-y-3">
                <button 
                  onClick={saveImages} 
                  disabled={saving || !uploadedImage || csvData.length === 0} 
                  className="w-full bg-accent text-white hover:bg-lavender-600 font-bold h-11 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download ZIP ({csvData.length})
                    </>
                  )}
                </button>
                
                {isEmailSendEnabled && (
                  <button 
                    onClick={() => sendCertificatesViaEmail()} 
                    disabled={sendingEmails || !uploadedImage || csvData.length === 0} 
                    className="w-full bg-green-600 text-white hover:bg-green-700 font-bold h-11 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {sendingEmails ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Sending {emailsSent}/{csvData.length}...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send via Email ({csvData.length})
                      </>
                    )}
                  </button>
                )}
                
                <button 
                  onClick={handlePrint} 
                  disabled={saving || !uploadedImage || csvData.length === 0} 
                  className="w-full bg-background border border-border text-foreground hover:bg-accent/10 hover:border-accent/50 font-bold h-10 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={14} />
                  Print Certificates
                </button>
  
                <button 
                  onClick={exportAsPDF} 
                  disabled={!uploadedImage || csvData.length === 0} 
                  className="w-full bg-background border border-border text-foreground hover:bg-accent/10 hover:border-accent/50 font-bold h-10 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={14} />
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(PropertiesPanel);
