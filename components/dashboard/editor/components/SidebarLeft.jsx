import React from 'react';
import ElementsPanel from './ElementsPanel';
import DataPanel from './DataPanel';
import LayerList from './LayerList';

const SidebarLeft = ({
  leftSidebarOpen,
  CANVAS_PRESETS,
  setTextFields,
  textFields,
  addStaticText,
  addTextField,
  addToHistory,
  handleLogoUpload,
  addQRCode,
  addDate,
  addUUIDField,
  dbTemplates,
  isFetchingTemplates,
  setUploadedImage,
  addShape,
  uploadedImage,
  handleCSV,
  csvData,
  loadDemoCSV,
  csvColumns,
  selectedFieldId,
  setSelectedFieldId,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  moveLayer,
  removeTextField,
  isTemplateMode
}) => {
  return (
    <div className={`fixed left-4 top-24 bottom-4 z-20 ${leftSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-secondary/20 backdrop-blur-2xl border border-border rounded-[40px] overflow-hidden flex flex-col`}>
      {leftSidebarOpen && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6" style={{ touchAction: 'pan-y' }}>
          <ElementsPanel 
            CANVAS_PRESETS={CANVAS_PRESETS}
            dbTemplates={dbTemplates}
            isFetchingTemplates={isFetchingTemplates}
            setTextFields={setTextFields}
            addToHistory={addToHistory}
            addStaticText={addStaticText}
            addTextField={addTextField}
            handleLogoUpload={handleLogoUpload}
            addQRCode={addQRCode}
            addDate={addDate}
            addUUIDField={addUUIDField}
            addShape={addShape}
            setUploadedImage={setUploadedImage}
          />
          
          {!isTemplateMode && (
            <DataPanel 
              uploadedImage={uploadedImage}
              handleCSV={handleCSV}
              csvData={csvData}
              loadDemoCSV={loadDemoCSV}
              csvColumns={csvColumns}
              textFields={textFields}
              setTextFields={setTextFields}
              addTextField={addTextField}
              setSelectedFieldId={setSelectedFieldId}
            />
          )}
          
          <LayerList 
            textFields={textFields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            moveLayer={moveLayer}
            removeTextField={removeTextField}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SidebarLeft);
