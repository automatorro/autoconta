import { useState } from "react";
import { Search, Loader2, Building2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { anafService, AnafCompanyData } from "@/services/anafService";

interface CifLookupProps {
  onCompanyFound: (companyData: any) => void;
  initialCif?: string;
  disabled?: boolean;
}

export default function CifLookup({ onCompanyFound, initialCif = "", disabled = false }: CifLookupProps) {
  const [cif, setCif] = useState(initialCif);
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState<AnafCompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCifChange = (value: string) => {
    setCif(value);
    setError(null);
    setCompanyData(null);
  };

  const searchCompany = async () => {
    if (!cif.trim()) {
      setError("Introduceți un CIF");
      return;
    }

    if (!anafService.validateCif(cif)) {
      setError("CIF invalid. Introduceți un CIF valid (2-10 cifre)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCompanyData(null);

    try {
      console.log('🔍 Searching company with CIF:', cif);
      const data = await anafService.getCompanyData(cif);
      
      if (data) {
        setCompanyData(data);
        const convertedData = anafService.convertToCompanyFormat(data);
        
        toast({
          title: "Companie găsită!",
          description: `${data.denumire} - ${anafService.formatCif(data.cui)}`
        });
        
        console.log('✅ Company found:', convertedData);
      } else {
        setError("Compania nu a fost găsită în baza de date ANAF");
        toast({
          title: "Companie negăsită",
          description: "CIF-ul introdus nu a fost găsit în registrul ANAF",
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la căutarea companiei";
      setError(errorMessage);
      
      toast({
        title: "Eroare la căutare",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('❌ Company search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const useCompanyData = () => {
    if (companyData) {
      const convertedData = anafService.convertToCompanyFormat(companyData);
      onCompanyFound(convertedData);
      
      toast({
        title: "Date preluate!",
        description: "Datele companiei au fost completate automat"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      searchCompany();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cif-input">Căutare automată după CIF</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="cif-input"
              placeholder="Introduceți CIF-ul (ex: 12345678 sau RO12345678)"
              value={cif}
              onChange={(e) => handleCifChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
          <Button
            onClick={searchCompany}
            disabled={disabled || isLoading || !cif.trim()}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Introduceți CIF-ul companiei pentru a prelua automat datele din registrul ANAF
        </p>
      </div>

      {companyData && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-green-800">{companyData.denumire}</h3>
                    <p className="text-sm text-green-700">CIF: {anafService.formatCif(companyData.cui)}</p>
                  </div>
                  
                  {companyData.nrRegCom && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nr. Reg. Com:</span> {companyData.nrRegCom}
                    </p>
                  )}
                  
                  {companyData.adresa && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Adresă:</span> {companyData.adresa}
                    </p>
                  )}
                  
                  {companyData.telefon && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Telefon:</span> {companyData.telefon}
                    </p>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    {companyData.scpTVA && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Plătitor TVA
                      </Badge>
                    )}
                    
                    {companyData.tvainc && (
                      <Badge variant="outline" className="text-xs">
                        TVA la încasare
                      </Badge>
                    )}
                    
                    {!companyData.statusInactivi && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activă
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={useCompanyData}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                Folosește datele
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}