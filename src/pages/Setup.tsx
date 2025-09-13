import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Car, Users, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { Company, Vehicle, Driver } from "@/types/accounting";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CifLookup from "@/components/CifLookup";

const steps = [
  { id: 1, title: "Date Firmă", icon: Building2, description: "Informații legale" },
  { id: 2, title: "Vehicule", icon: Car, description: "Mașinile folosite" },
  { id: 3, title: "Șoferi", icon: Users, description: "Persoanele autorizate" },
];

export default function Setup() {
  const navigate = useNavigate();
  const { setCompany, addVehicle, addDriver, authUser } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    plateNumber: '',
    year: new Date().getFullYear(),
    vin: '',
    fuelType: 'benzina'
  });
  
  const [driverForm, setDriverForm] = useState({
    name: '',
    cnp: '',
    licenseNumber: '',
    licenseCategory: 'B',
    contractType: 'permanent',
    phone: '',
    email: '',
    licenseExpiryDate: ''
  });
  
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

  const handleAddVehicle = () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.plateNumber) {
      toast({
        title: "Eroare",
        description: "Completați toate câmpurile obligatorii",
        variant: "destructive"
      });
      return;
    }

    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      make: vehicleForm.make,
      model: vehicleForm.model,
      plateNumber: vehicleForm.plateNumber,
      year: vehicleForm.year,
      vin: vehicleForm.vin,
      documents: {
        itp: {
          documentNumber: '',
          issueDate: new Date(),
          expiryDate: new Date()
        },
        rca: {
          documentNumber: '',
          issueDate: new Date(),
          expiryDate: new Date()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setVehicles([...vehicles, newVehicle]);
    setVehicleForm({
      make: '',
      model: '',
      plateNumber: '',
      year: new Date().getFullYear(),
      vin: '',
      fuelType: 'benzina'
    });
    setIsVehicleDialogOpen(false);
    
    toast({
      title: "Succes",
      description: "Vehiculul a fost adăugat cu succes"
    });
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const handleAddDriver = () => {
    if (!driverForm.name || !driverForm.cnp || !driverForm.licenseNumber || !driverForm.licenseExpiryDate) {
      toast({
        title: "Eroare",
        description: "Completați toate câmpurile obligatorii",
        variant: "destructive"
      });
      return;
    }

    const newDriver: Driver = {
      id: crypto.randomUUID(),
      name: driverForm.name,
      cnp: driverForm.cnp,
      licenseNumber: driverForm.licenseNumber,
      certificates: {
        professionalAttestation: {
          documentNumber: '',
          issueDate: new Date(),
          expiryDate: new Date(driverForm.licenseExpiryDate)
        },
        medicalCertificate: {
          documentNumber: '',
          issueDate: new Date(),
          expiryDate: new Date()
        }
      },
      vehicleIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setDrivers([...drivers, newDriver]);
    setDriverForm({
      name: '',
      cnp: '',
      licenseNumber: '',
      licenseCategory: 'B',
      contractType: 'permanent',
      phone: '',
      email: '',
      licenseExpiryDate: ''
    });
    setIsDriverDialogOpen(false);
    
    toast({
      title: "Succes",
      description: "Șoferul a fost adăugat cu succes"
    });
  };

  const handleRemoveDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const handleSkipSetup = async () => {
    if (!authUser) {
      toast({
        title: "Eroare",
        description: "Nu sunteți autentificat",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('⏭️ Skipping setup - creating minimal company profile');
    
    try {
      // Create minimal company profile to mark setup as completed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authUser.id,
          company_name: 'Companie Nouă',
          company_type: 'PFA',
          cif: 'COMPLETEAZĂ_ULTERIOR',
          setup_completed: true
        });

      console.log('📊 Skip setup - Profile save result - Error:', profileError);

      if (profileError) {
        console.log('❌ Profile save failed:', profileError);
      } else {
        console.log('✅ Minimal profile saved successfully!');
      }

      // Create minimal company object for local store
      const company: Company = {
        id: crypto.randomUUID(),
        name: 'Companie Nouă',
        cif: 'COMPLETEAZĂ_ULTERIOR',
        type: 'PFA',
        vatPayer: false,
        address: {
          street: '',
          city: '',
          county: '',
          postalCode: ''
        },
        contact: {
          phone: '',
          email: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🏢 Setting minimal company in local store:', company);
      setCompany(company);
      
      toast({
        title: "Setup sărit cu succes!",
        description: "Puteți completa datele companiei mai târziu din Setări"
      });
      
      // Navigate first, then reset loading
      navigate('/dashboard');
      setIsLoading(false);
    } catch (error) {
      console.error('Error skipping setup:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la salvarea datelor",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

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
        // Save user profile to Supabase with better error handling
        console.log('📊 Attempting to save user profile...');
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
          // Try to continue with local store even if Supabase fails
          console.log('⚠️ Continuing with local store only due to connection issues');
        } else {
          console.log('✅ Profile saved successfully to Supabase!');
        }

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
        
        // Save vehicles to Supabase and local store
        for (const vehicle of vehicles) {
          try {
            const { error: vehicleError } = await supabase
              .from('vehicles')
              .insert({
                user_id: authUser.id,
                make: vehicle.make,
                model: vehicle.model,
                license_plate: vehicle.plateNumber,
                year: vehicle.year,
                vin: vehicle.vin || null,
                fuel_type: 'benzina' // Default fuel type for setup
              });
            
            if (vehicleError) {
              console.error('Error saving vehicle:', vehicleError);
            } else {
              console.log('✅ Vehicle saved:', vehicle.make, vehicle.model);
              addVehicle(vehicle);
            }
          } catch (error) {
            console.error('Vehicle save error:', error);
          }
        }
        
        // Save drivers to Supabase and local store
        for (const driver of drivers) {
          try {
            const { error: driverError } = await supabase
              .from('drivers')
              .insert({
                user_id: authUser.id,
                name: driver.name,
                cnp: driver.cnp,
                license_number: driver.licenseNumber,
                license_category: 'B', // Default category for setup
                license_expiry_date: driver.certificates.professionalAttestation.expiryDate.toISOString().split('T')[0],
                phone: driverForm.phone || null,
                email: driverForm.email || null
              });
            
            if (driverError) {
              console.error('Error saving driver:', driverError);
            } else {
              console.log('✅ Driver saved:', driver.name);
              addDriver(driver);
            }
          } catch (error) {
            console.error('Driver save error:', error);
          }
        }
        
        // Force reload of user data to reflect setup_completed status
        console.log('🔄 Navigating to dashboard...');
        
        toast({
          title: "Succes!",
          description: "Configurarea inițială a fost completată cu succes"
        });
        
        // Navigate first, then reset loading
        navigate('/dashboard');
        setIsLoading(false);
      } catch (error) {
        console.error('Error saving setup data:', error);
        
        let errorMessage = "A apărut o eroare la salvarea datelor";
        
        if (error instanceof Error) {
          if (error.message.includes('network')) {
            errorMessage = "Problemă de conexiune. Verificați internetul și încercați din nou.";
          } else if (error.message.includes('auth')) {
            errorMessage = "Sesiunea a expirat. Vă rugăm să vă autentificați din nou.";
          } else if (error.message.includes('duplicate')) {
            errorMessage = "Datele introduse există deja în sistem.";
          } else {
            errorMessage = `Eroare: ${error.message}`;
          }
        }
        
        toast({
          title: "Eroare la salvare",
          description: errorMessage,
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
              <h2 className="text-2xl font-semibold mb-2">Date firmă</h2>
              <p className="text-muted-foreground">
                Informațiile legale ale entității
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label className="text-base font-medium">Tipul entității</Label>
                <RadioGroup
                  value={formData.companyType}
                  onValueChange={(value) => setFormData({ ...formData, companyType: value as 'PFA' | 'SRL' })}
                  className="flex gap-6 mt-3"
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

            <CifLookup
              onCompanyFound={(companyData) => {
                console.log('🏢 Auto-filling company data:', companyData);
                setFormData({
                  ...formData,
                  companyName: companyData.name || formData.companyName,
                  cif: companyData.cif || formData.cif,
                  address: {
                    street: companyData.address?.street || formData.address.street,
                    city: companyData.address?.city || formData.address.city,
                    county: companyData.address?.county || formData.address.county,
                    postalCode: companyData.address?.postalCode || formData.address.postalCode
                  },
                  contact: {
                    phone: companyData.contact?.phone || formData.contact.phone,
                    email: companyData.contact?.email || formData.contact.email
                  },
                  vatPayer: companyData.vatPayer !== undefined ? companyData.vatPayer : formData.vatPayer
                });
              }}
              initialCif={formData.cif}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  sau completați manual
                </span>
              </div>
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

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Vehicule</h2>
              <p className="text-muted-foreground">
                Adăugați mașinile folosite pentru transport (opțional acum)
              </p>
            </div>

            {vehicles.length > 0 && (
              <div className="space-y-3 mb-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.plateNumber} • {vehicle.year}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVehicle(vehicle.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {vehicles.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Niciun vehicul adăugat</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Puteți adăuga vehiculele mai târziu din modulul Setup & Management
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă vehicul acum
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adaugă vehicul</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="make">Marca *</Label>
                      <Input
                        id="make"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                        placeholder="ex: Dacia"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                        placeholder="ex: Logan"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="plateNumber">Număr înmatriculare *</Label>
                      <Input
                        id="plateNumber"
                        value={vehicleForm.plateNumber}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                        placeholder="ex: B123ABC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">An fabricație</Label>
                      <Input
                        id="year"
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vin">VIN (opțional)</Label>
                    <Input
                      id="vin"
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                      placeholder="ex: WDB1234567890123"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
                      Anulează
                    </Button>
                    <Button onClick={handleAddVehicle}>
                      Adaugă vehicul
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Șoferi</h2>
              <p className="text-muted-foreground">
                Persoanele autorizate să conducă (opțional acum)
              </p>
            </div>

            {drivers.length > 0 && (
              <div className="space-y-3 mb-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-sm text-muted-foreground">CNP: {driver.cnp} • Permis: {driver.licenseNumber}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDriver(driver.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {drivers.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Niciun șofer adăugat</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Puteți adăuga șoferii mai târziu din modulul Setup & Management
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă șofer acum
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adaugă șofer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driverName">Nume complet *</Label>
                    <Input
                      id="driverName"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      placeholder="ex: Popescu Adrian"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cnp">CNP *</Label>
                      <Input
                        id="cnp"
                        value={driverForm.cnp}
                        onChange={(e) => setDriverForm({ ...driverForm, cnp: e.target.value })}
                        placeholder="ex: 1234567890123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Număr permis *</Label>
                      <Input
                        id="licenseNumber"
                        value={driverForm.licenseNumber}
                        onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                        placeholder="ex: AB123456"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="licenseExpiryDate">Data expirare permis *</Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={driverForm.licenseExpiryDate}
                      onChange={(e) => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                        placeholder="ex: 0721123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={driverForm.email}
                        onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                        placeholder="ex: sofer@email.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDriverDialogOpen(false)}>
                      Anulează
                    </Button>
                    <Button onClick={handleAddDriver}>
                      Adaugă șofer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.cif;
      case 2:
      case 3:
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
          <p className="text-muted-foreground mb-2">
            Configurați-vă contul pentru a începe contabilitatea profesională
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Puteți sări peste această configurare și completa datele mai târziu din Setări
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
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Înapoi
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkipSetup}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              {isLoading ? 'Se salvează...' : 'Sari peste'}
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
    </div>
  );
}