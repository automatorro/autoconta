import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Car, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { Company } from "@/types/accounting";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Tip Entitate", icon: Building2, description: "PFA sau SRL" },
  { id: 2, title: "Date Firmă", icon: Building2, description: "Informații legale" },
  { id: 3, title: "Vehicule", icon: Car, description: "Mașinile folosite" },
  { id: 4, title: "Șoferi", icon: Users, description: "Persoanele autorizate" },
];

export default function Setup() {
  const navigate = useNavigate();
  const { setCompany, addVehicle, addDriver, authUser } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyType: '' as 'PFA' | 'SRL' | '',
    vatPayer: false,
    vatIntraCommunity: '',
    companyName: '',
    cif: '',
    cnp: '',
    address: {
      street: '',
      city: '',
      county: '',
      postalCode: ''
    },
    contact: {
      phone: '',
      email: ''
    }
  });

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!authUser) {
        toast({
          title: "Eroare",
          description: "Nu sunteți autentificat",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      console.log('💾 Starting to save company data for user:', authUser.id);
      console.log('📋 Form data:', formData);
      
      try {
        // Save user profile to Supabase
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: authUser.id,
            company_name: formData.companyName,
            company_type: formData.companyType,
            cif: formData.cif,
            cnp: formData.cnp || null,
            vat_payer: formData.vatPayer,
            vat_intra_community: formData.vatIntraCommunity,
            address_street: formData.address.street,
            address_city: formData.address.city,
            address_county: formData.address.county,
            address_postal_code: formData.address.postalCode,
            contact_phone: formData.contact.phone,
            contact_email: formData.contact.email,
            setup_completed: true
          });
        
        console.log('📊 Profile save result - Error:', profileError);

        if (profileError) {
          console.log('❌ Profile save failed:', profileError);
          throw profileError;
        }
        
        console.log('✅ Profile saved successfully to Supabase!');

        // Create company object for local store
        const company: Company = {
          id: crypto.randomUUID(),
          name: formData.companyName,
          cif: formData.cif,
          cnp: formData.cnp || undefined,
          type: formData.companyType as 'PFA' | 'SRL',
          vatPayer: formData.vatPayer,
          address: formData.address,
          contact: formData.contact,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('🏢 Setting company in local store:', company);
        setCompany(company);
        
        // Force reload of user data to reflect setup_completed status
        console.log('🔄 Reloading page to refresh user data...');
        
        toast({
          title: "Succes!",
          description: "Configurarea inițială a fost completată cu succes"
        });
        
        // Reload the page to ensure fresh data is loaded
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Error saving setup data:', error);
        toast({
          title: "Eroare",
          description: "A apărut o eroare la salvarea datelor. Încercați din nou.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Tipul entității</h2>
              <p className="text-muted-foreground">
                Selectați forma juridică sub care activați
              </p>
            </div>
            
            <RadioGroup
              value={formData.companyType}
              onValueChange={(value) => setFormData({ ...formData, companyType: value as 'PFA' | 'SRL' })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-secondary/50">
                <RadioGroupItem value="PFA" id="pfa" />
                <Label htmlFor="pfa" className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">Persoană Fizică Autorizată (PFA)</div>
                    <div className="text-sm text-muted-foreground">
                      Regim simplu, ideal pentru activitate individuală
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-secondary/50">
                <RadioGroupItem value="SRL" id="srl" />
                <Label htmlFor="srl" className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">Societate cu Răspundere Limitată (SRL)</div>
                    <div className="text-sm text-muted-foreground">
                      Pentru activități mai complexe, mai mulți asociați
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div>
              <Label className="text-base font-medium">Status TVA</Label>
              <RadioGroup
                value={formData.vatPayer ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, vatPayer: value === "yes" })}
                className="flex gap-6 mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="vat-yes" />
                  <Label htmlFor="vat-yes">Plătitor de TVA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="vat-no" />
                  <Label htmlFor="vat-no">Scutit de TVA</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="vatIntraCommunity" className="text-base font-medium">
                TVA Intracomunitar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vatIntraCommunity"
                value={formData.vatIntraCommunity}
                onChange={(e) => setFormData({ ...formData, vatIntraCommunity: e.target.value })}
                placeholder="ex: RO12345678"
                className="mt-2"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Obligatoriu pentru toate entitățile (PFA/SRL), indiferent de statusul TVA
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Date firmă</h2>
              <p className="text-muted-foreground">
                Informațiile legale ale entității
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="companyName">Denumirea {formData.companyType}</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="ex: Transport Popescu Adrian PFA"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cif">Cod Fiscal (CIF/CUI)</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                    placeholder="ex: RO12345678"
                  />
                </div>
                {formData.companyType === 'PFA' && (
                  <div>
                    <Label htmlFor="cnp">CNP (pentru PFA)</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp}
                      onChange={(e) => setFormData({ ...formData, cnp: e.target.value })}
                      placeholder="ex: 1234567890123"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="street">Adresa (strada, numărul)</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                  placeholder="ex: Str. Libertății nr. 25"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">Oraș</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    placeholder="ex: București"
                  />
                </div>
                <div>
                  <Label htmlFor="county">Județ</Label>
                  <Input
                    id="county"
                    value={formData.address.county}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, county: e.target.value }
                    })}
                    placeholder="ex: Bucuresti"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Cod poștal</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value }
                    })}
                    placeholder="ex: 010123"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    placeholder="ex: 0721123456"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    placeholder="ex: contact@firma.ro"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Vehicule</h2>
              <p className="text-muted-foreground">
                Adăugați mașinile folosite pentru transport (opțional acum)
              </p>
            </div>

            <Card className="border-dashed border-2 border-muted">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Niciun vehicul adăugat</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Puteți adăuga vehiculele mai târziu din modulul Setup & Management
                </p>
                <Button variant="outline" size="sm">
                  Adaugă vehicul acum
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Șoferi</h2>
              <p className="text-muted-foreground">
                Persoanele autorizate să conducă (opțional acum)
              </p>
            </div>

            <Card className="border-dashed border-2 border-muted">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Niciun șofer adăugat</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Puteți adăuga șoferii mai târziu din modulul Setup & Management
                </p>
                <Button variant="outline" size="sm">
                  Adaugă șofer acum
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyType !== '' && formData.vatIntraCommunity !== '';
      case 2:
        return formData.companyName && formData.cif;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Configurare inițială</h1>
          <p className="text-muted-foreground">
            Configurați-vă contul pentru a începe contabilitatea profesională
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep > step.id
                    ? 'bg-success border-success text-success-foreground'
                    : currentStep === step.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-2 ${
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-strong">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 px-2">
                    Pasul {currentStep}
                  </Badge>
                  {steps[currentStep - 1]?.title}
                </CardTitle>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentStep} din {steps.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Înapoi
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className="gradient-primary"
          >
            {isLoading ? 'Se salvează...' : (currentStep === steps.length ? 'Finalizează' : 'Continuă')}
          </Button>
        </div>
      </div>
    </div>
  );
}