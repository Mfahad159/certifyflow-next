import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../../../ui/alert-dialog';

const UnsavedDialog = ({ 
  showUnsavedDialog, 
  setShowUnsavedDialog, 
  isSavingWork, 
  navigate, 
  handleSaveWork 
}) => {
  return (
    <AlertDialog open={showUnsavedDialog} onOpenChange={(open) => {
      // Only allow closing (not opening) and only when not saving
      if (!open && !isSavingWork) {
        setShowUnsavedDialog(false);
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save your work before leaving? If you don't save, your changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isSavingWork}
            onClick={() => {
              setShowUnsavedDialog(false);
              navigate('/dashboard');
            }}
          >
            Don't Save
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={async () => {
              await handleSaveWork();
              navigate('/dashboard');
            }}
            disabled={isSavingWork}
            className="bg-accent text-white hover:bg-accent/90"
          >
            {isSavingWork ? 'Saving...' : 'Save & Exit'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedDialog;
