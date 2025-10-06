import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/integrations/supabase/client";
import CifLookup from "@/components/CifLookup";
import { ArrowRight, Building2, Search, SkipForward } from "lucide-react";

export default function Setup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authUser, setCompany, setUserData } = useAppStore();
  const [activeTab, setActiveTab] = useState("anaf");
  const [isLoading, setIsLoading] = useState(false);
  
  // Company form data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyType: 'PFA',
    cif: '',
    cnp: '',
    vatPayer: false,
    address: {
      street: '',
      city: '',
      county: '',
      postalCode: ''
    },
    contact: {
      phone: '',
      email: authUser?.email || ''
    }
  });

  // Handle company data from ANAF lookup
  const handleCompanyFound = (data: any) => {
    setCompanyData({
      ...companyData,
      companyName: data.name,
      cif: data.cif,
      vatPayer: data.vatPayer,
      address: {
        street: data.address.street,
        city: data.address.city || companyData.address.city,
        county: data.address.county || companyData.address.county,
        postalCode: data.address.postalCode || companyData.address.postalCode
      },
      contact: {
        ...companyData.contact,
        phone: data.contact.phone || companyData.contact.phone
      }
    });
    
    // Switch to manual tab to review and complete the data
    setActiveTab("manual");
  };

  // Save company data to Supabase
  const saveCompanyData = async () => {
    if (!authUser) return;
    
    // Validare câmpuri obligatorii
    if (!companyData.companyName || !companyData.cif) {
      toast({
        title: "Câmpuri obligatorii lipsă",
        description: "Te rugăm să completezi cel puțin numele și CIF-ul companiei.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('💾 Saving company data:', companyData);
      
      // Create user profile with company data
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authUser.id,
          company_name: companyData.companyName,
          company_type: companyData.companyType,
          cif: companyData.cif,
          cnp: companyData.cnp || null,
          vat_payer: companyData.vatPayer,
          address_street: companyData.address.street || null,
          address_city: companyData.address.city || null,
          address_county: companyData.address.county || null,
          address_postal_code: companyData.address.postalCode || null,
          contact_phone: companyData.contact.phone || null,
          contact_email: companyData.contact.email || authUser.email,
          setup_completed: true
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      // Update local store
      const company = {
        id: authUser.id,
        name: companyData.companyName,
        cif: companyData.cif,
        cnp: companyData.cnp || undefined,
        type: companyData.companyType as 'PFA' | 'SRL',
        vatPayer: companyData.vatPayer,
        address: companyData.address,
        contact: companyData.contact,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCompany(company);
      
      // Update user data with setup completed
      setUserData({
        id: authUser.id,
        email: authUser.email || '',
        setupCompleted: true,
        company: company,
        vehicles: [],
        drivers: []
      });

      toast({
        title: "Configurare finalizată!",
        description: "Datele companiei au fost salvate cu succes."
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving company data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva datele companiei",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Skip setup and go to dashboard
  const skipSetup = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Skip setup - checking profile for user:', authUser.id);
      
      // Verificăm dacă profilul există
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();
      
      console.log('📊 Existing profile:', existingProfile, 'Error:', checkError);
      
      if (existingProfile) {
        // Profilul există, facem UPDATE
        const { error } = await supabase
          .from('user_profiles')
          .update({ setup_completed: true })
          .eq('user_id', authUser.id);
          
        if (error) throw error;
      } else {
        // Profilul nu există, îl creăm
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authUser.id,
            contact_email: authUser.email,
            setup_completed: true
          });
          
        if (error) throw error;
      }
      
      // Actualizează starea locală
      setUserData({
        id: authUser.id,
        email: authUser.email || '',
        setupCompleted: true,
        company: null,
        vehicles: [],
        drivers: []
      });
      
      toast({
        title: 'Success',
        description: 'Setup omis cu succes.'
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Skip setup error:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'A apărut o eroare.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Configurare inițială</CardTitle>
          <CardDescription>
            Configurează datele companiei tale pentru a începe să folosești aplicația.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="anaf" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Căutare ANAF
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Introducere manuală
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="anaf" className="py-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Caută automat datele companiei tale în baza de date ANAF folosind CIF-ul.
                </p>
                <CifLookup onCompanyFound={handleCompanyFound} />
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="py-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informații generale</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Denumire companie</Label>
                      <Input
                        id="company-name"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cif">CIF/CUI</Label>
                      <Input
                        id="cif"
                        value={companyData.cif}
                        onChange={(e) => setCompanyData({...companyData, cif: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tip companie</Label>
                      <RadioGroup
                        value={companyData.companyType}
                        onValueChange={(value) => setCompanyData({...companyData, companyType: value})}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PFA" id="pfa" />
                          <Label htmlFor="pfa">PFA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SRL" id="srl" />
                          <Label htmlFor="srl">SRL</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {companyData.companyType === 'PFA' && (
                      <div className="space-y-2">
                        <Label htmlFor="cnp">CNP</Label>
                        <Input
                          id="cnp"
                          value={companyData.cnp}
                          onChange={(e) => setCompanyData({...companyData, cnp: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vat-payer"
                        checked={companyData.vatPayer}
                        onCheckedChange={(checked) => 
                          setCompanyData({...companyData, vatPayer: checked as boolean})
                        }
                      />
                      <Label htmlFor="vat-payer">Plătitor de TVA</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Adresă</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="street">Stradă</Label>
                      <Input
                        id="street"
                        value={companyData.address.street}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          address: {...companyData.address, street: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Oraș</Label>
                      <Input
                        id="city"
                        value={companyData.address.city}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          address: {...companyData.address, city: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="county">Județ</Label>
                      <Input
                        id="county"
                        value={companyData.address.county}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          address: {...companyData.address, county: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Cod poștal</Label>
                      <Input
                        id="postal-code"
                        value={companyData.address.postalCode}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          address: {...companyData.address, postalCode: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={companyData.contact.phone}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          contact: {...companyData.contact, phone: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyData.contact.email}
                        onChange={(e) => setCompanyData({
                          ...companyData, 
                          contact: {...companyData.contact, email: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={skipSetup}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Sari peste
          </Button>
          
          <Button 
            onClick={saveCompanyData} 
            disabled={isLoading || !companyData.companyName || !companyData.cif}
            className="flex items-center gap-2"
          >
            Salvează și continuă
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};