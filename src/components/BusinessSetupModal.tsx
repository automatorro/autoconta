import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};