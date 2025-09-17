import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
<<<<<<< HEAD
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
=======
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
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

<<<<<<< HEAD
  const handleContinueExploring = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Configurația business necesară
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-left py-4">
          Pentru a introduce sau salva date contabile, trebuie să completezi mai întâi 
          datele firmei. Poți continua să explorezi aplicația, dar operațiunile cu date 
          sunt restricționate până la completarea configurației business-ului.
        </DialogDescription>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinueExploring}
            className="w-full sm:w-auto"
          >
            Continuă explorarea
          </Button>
          <Button
            onClick={handleGoToSettings}
            className="w-full sm:w-auto"
          >
            Completează datele firmei
=======
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
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};