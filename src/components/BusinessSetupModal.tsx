import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface BusinessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessSetupModal: React.FC<BusinessSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    onClose();
    navigate('/settings');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Setup Business Necesar</DialogTitle>
          </div>
          <DialogDescription>
            Pentru a putea salva documente și date, trebuie să completezi mai întâi
            configurarea business-ului în pagina de setări.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={handleGoToSettings}>
            Mergi la Setări
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};