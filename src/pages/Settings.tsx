import { useState } from "react";
import { Building2, Car, Users, Download, Key, Save, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Vehicle, Driver } from "@/types/accounting";

export default function Settings() {
  const { authUser, user, getActiveAlerts, vehicles, addVehicle, updateVehicle, removeVehicle, addDriver, updateDriver, removeDriver, setCompany } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Company form data
  const [companyData, setCompanyData] = useState({
    companyName: user.company?.name || '',
    companyType: user.company?.type || 'PFA',
    cif: user.company?.cif || '',
    cnp: user.company?.cnp || '',
    vatPayer: user.company?.vatPayer || false,
    vatIntraCommunity: '', // Will be loaded from API
    address: {
      street: user.company?.address?.street || '',
      city: user.company?.address?.city || '',
      county: user.company?.address?.county || '',
      postalCode: user.company?.address?.postalCode || ''
    },
    contact: {
      phone: user.company?.contact?.phone || '',
      email: user.company?.contact?.email || ''
    }
  });

  // Vehicle form data
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    plateNumber: '',
    year: new Date().getFullYear(),
    vin: '',
    fuelType: 'benzina'
  });

  // Driver form data  
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

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);

  const handleSaveCompany = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          company_name: companyData.companyName,
          company_type: companyData.companyType,
          cif: companyData.cif,
          cnp: companyData.cnp || null,
          vat_payer: companyData.vatPayer,
          vat_intra_community: companyData.vatIntraCommunity,
          address_street: companyData.address.street,
          address_city: companyData.address.city,
          address_county: companyData.address.county,
          address_postal_code: companyData.address.postalCode,
          contact_phone: companyData.contact.phone,
          contact_email: companyData.contact.email,
        })
        .eq('user_id', authUser.id);

      if (error) throw error;

      // Update local store
      setCompany({
        id: user.company?.id || '',
        name: companyData.companyName,
        cif: companyData.cif,
        cnp: companyData.cnp || undefined,
        type: companyData.companyType as 'PFA' | 'SRL',
        vatPayer: companyData.vatPayer,
        address: companyData.address,
        contact: companyData.contact,
        createdAt: user.company?.createdAt || new Date(),
        updatedAt: new Date()
      });

      toast({
        title: "Succes!",
        description: "Datele companiei au fost actualizate"
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut actualiza datele companiei",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVehicle = async () => {
    if (!authUser) return;

    setIsLoading(true);
    try {
      const vehicleData = {
        user_id: authUser.id,
        make: vehicleForm.make,
        model: vehicleForm.model,
        license_plate: vehicleForm.plateNumber,
        year: vehicleForm.year,
        vin: vehicleForm.vin || null,
        fuel_type: vehicleForm.fuelType
      };

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) throw error;

        updateVehicle(editingVehicle.id, {
          ...editingVehicle,
          make: vehicleForm.make,
          model: vehicleForm.model,
          plateNumber: vehicleForm.plateNumber,
          year: vehicleForm.year,
          vin: vehicleForm.vin,
          updatedAt: new Date()
        });
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert(vehicleData)
          .select()
          .single();

        if (error) throw error;

        const newVehicle: Vehicle = {
          id: data.id,
          make: vehicleForm.make,
          model: vehicleForm.model,
          plateNumber: vehicleForm.plateNumber,
          year: vehicleForm.year,
          vin: vehicleForm.vin,
          documents: {
            itp: {
              documentNumber: '',
              issueDate: new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            rca: {
              documentNumber: '',
              issueDate: new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
          },
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        addVehicle(newVehicle);
      }

      // Reset form
      setVehicleForm({
        make: '',
        model: '',
        plateNumber: '',
        year: new Date().getFullYear(),
        vin: '',
        fuelType: 'benzina'
      });
      setEditingVehicle(null);
      setIsVehicleDialogOpen(false);

      toast({
        title: "Succes!",
        description: `Vehiculul a fost ${editingVehicle ? 'actualizat' : 'adăugat'}`
      });
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut ${editingVehicle ? 'actualiza' : 'adăuga'} vehiculul`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      removeVehicle(vehicleId);

      toast({
        title: "Succes!",
        description: "Vehiculul a fost șters"
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge vehiculul",
        variant: "destructive"
      });
    }
  };

  const handleSaveDriver = async () => {
    if (!authUser) return;

    setIsLoading(true);
    try {
      const driverData = {
        user_id: authUser.id,
        name: driverForm.name,
        cnp: driverForm.cnp,
        license_number: driverForm.licenseNumber,
        license_category: driverForm.licenseCategory,
        contract_type: driverForm.contractType,
        phone: driverForm.phone || null,
        email: driverForm.email || null,
        license_expiry_date: driverForm.licenseExpiryDate
      };

      if (editingDriver) {
        // Update existing driver
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver.id);

        if (error) throw error;

        updateDriver(editingDriver.id, {
          ...editingDriver,
          name: driverForm.name,
          cnp: driverForm.cnp,
          licenseNumber: driverForm.licenseNumber,
          updatedAt: new Date()
        });
      } else {
        // Create new driver
        const { data, error } = await supabase
          .from('drivers')
          .insert(driverData)
          .select()
          .single();

        if (error) throw error;

        const newDriver: Driver = {
          id: data.id,
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
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
          },
          vehicleIds: [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        addDriver(newDriver);
      }

      // Reset form
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
      setEditingDriver(null);
      setIsDriverDialogOpen(false);

      toast({
        title: "Succes!",
        description: `Șoferul a fost ${editingDriver ? 'actualizat' : 'adăugat'}`
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut ${editingDriver ? 'actualiza' : 'adăuga'} șoferul`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      removeDriver(driverId);

      toast({
        title: "Succes!",
        description: "Șoferul a fost șters"
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge șoferul",
        variant: "destructive"
      });
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      plateNumber: vehicle.plateNumber,
      year: vehicle.year,
      vin: vehicle.vin || '',
      fuelType: 'benzina'
    });
    setIsVehicleDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      cnp: driver.cnp,
      licenseNumber: driver.licenseNumber,
      licenseCategory: 'B',
      contractType: 'permanent',
      phone: '',
      email: '',
      licenseExpiryDate: driver.certificates.professionalAttestation.expiryDate.toISOString().split('T')[0]
    });
    setIsDriverDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Setări și Management</h1>
          <p className="text-muted-foreground">
            Gestionați datele companiei, vehiculele și șoferii
          </p>
        </div>
        <Button 
          onClick={handleSaveCompany}
          disabled={isLoading}
          className="gradient-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvează modificările
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Date firmă
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicule
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Șoferi
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Backup & Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informații entitate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="companyName">Denumirea companiei</Label>
                  <Input
                    id="companyName"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tip entitate</Label>
                  <RadioGroup
                    value={companyData.companyType}
                    onValueChange={(value) => setCompanyData({ ...companyData, companyType: value as 'PFA' | 'SRL' })}
                    className="flex gap-6 mt-2"
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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="cif">CIF/CUI</Label>
                  <Input
                    id="cif"
                    value={companyData.cif}
                    onChange={(e) => setCompanyData({ ...companyData, cif: e.target.value })}
                  />
                </div>
                {companyData.companyType === 'PFA' && (
                  <div>
                    <Label htmlFor="cnp">CNP</Label>
                    <Input
                      id="cnp"
                      value={companyData.cnp}
                      onChange={(e) => setCompanyData({ ...companyData, cnp: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="vatIntraCommunity">
                    TVA Intracomunitar <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="vatIntraCommunity"
                    value={companyData.vatIntraCommunity}
                    onChange={(e) => setCompanyData({ ...companyData, vatIntraCommunity: e.target.value })}
                    placeholder="ex: RO12345678"
                  />
                </div>
              </div>

              <div>
                <Label>Status TVA</Label>
                <RadioGroup
                  value={companyData.vatPayer ? "yes" : "no"}
                  onValueChange={(value) => setCompanyData({ ...companyData, vatPayer: value === "yes" })}
                  className="flex gap-6 mt-2"
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
                <Label htmlFor="street">Adresa completă</Label>
                <Input
                  id="street"
                  value={companyData.address.street}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, street: e.target.value }
                  })}
                  placeholder="Strada și numărul"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">Oraș</Label>
                  <Input
                    id="city"
                    value={companyData.address.city}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="county">Județ</Label>
                  <Input
                    id="county"
                    value={companyData.address.county}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, county: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Cod poștal</Label>
                  <Input
                    id="postalCode"
                    value={companyData.address.postalCode}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      address: { ...companyData.address, postalCode: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={companyData.contact.phone}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      contact: { ...companyData.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.contact.email}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      contact: { ...companyData.contact, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Vehicule</h3>
              <p className="text-muted-foreground">Gestionați mașinile folosite pentru transport</p>
            </div>
            <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingVehicle(null);
                    setVehicleForm({
                      make: '',
                      model: '',
                      plateNumber: '',
                      year: new Date().getFullYear(),
                      vin: '',
                      fuelType: 'benzina'
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă vehicul
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? 'Editează vehicul' : 'Adaugă vehicul nou'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="make">Marca</Label>
                      <Input
                        id="make"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                        placeholder="ex: Dacia"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
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
                      <Label htmlFor="plateNumber">Numărul de înmatriculare</Label>
                      <Input
                        id="plateNumber"
                        value={vehicleForm.plateNumber}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                        placeholder="ex: B-123-ABC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Anul fabricației</Label>
                      <Input
                        id="year"
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="vin">Seria de șasiu (VIN) - opțional</Label>
                    <Input
                      id="vin"
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                      placeholder="ex: UU1LNBABAXMU123456"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSaveVehicle}
                      disabled={!vehicleForm.make || !vehicleForm.model || !vehicleForm.plateNumber || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Se salvează...' : (editingVehicle ? 'Actualizează' : 'Adaugă vehicul')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {user.vehicles.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Niciun vehicul adăugat</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Adăugați primul vehicul pentru a începe
                  </p>
                </CardContent>
              </Card>
            ) : (
              user.vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.plateNumber} • {vehicle.year}
                        </div>
                        {vehicle.vin && (
                          <div className="text-xs text-muted-foreground">
                            VIN: {vehicle.vin}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Activ</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ștergeți vehiculul?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Această acțiune nu poate fi anulată. Vehiculul va fi șters permanent din sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anulează</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Șterge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Șoferi</h3>
              <p className="text-muted-foreground">Gestionați persoanele autorizate să conducă</p>
            </div>
            <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingDriver(null);
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
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă șofer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDriver ? 'Editează șofer' : 'Adaugă șofer nou'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driverName">Nume complet</Label>
                    <Input
                      id="driverName"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      placeholder="ex: Popescu Ion"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="driverCnp">CNP</Label>
                      <Input
                        id="driverCnp"
                        value={driverForm.cnp}
                        onChange={(e) => setDriverForm({ ...driverForm, cnp: e.target.value })}
                        placeholder="ex: 1234567890123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Număr permis</Label>
                      <Input
                        id="licenseNumber"
                        value={driverForm.licenseNumber}
                        onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                        placeholder="ex: AB123456"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licenseExpiryDate">Data expirării permisului</Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={driverForm.licenseExpiryDate}
                      onChange={(e) => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="driverPhone">Telefon - opțional</Label>
                      <Input
                        id="driverPhone"
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                        placeholder="ex: 0721123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverEmail">Email - opțional</Label>
                      <Input
                        id="driverEmail"
                        type="email"
                        value={driverForm.email}
                        onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                        placeholder="ex: ion@email.ro"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSaveDriver}
                      disabled={!driverForm.name || !driverForm.cnp || !driverForm.licenseNumber || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Se salvează...' : (editingDriver ? 'Actualizează' : 'Adaugă șofer')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {user.drivers.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Niciun șofer adăugat</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Adăugați primul șofer pentru a începe
                  </p>
                </CardContent>
              </Card>
            ) : (
              user.drivers.map((driver) => (
                <Card key={driver.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          CNP: {driver.cnp} • Permis: {driver.licenseNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expiră: {driver.certificates.professionalAttestation.expiryDate.toLocaleDateString('ro-RO')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {driver.certificates.professionalAttestation.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expiră în curând
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDriver(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ștergeți șoferul?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Această acțiune nu poate fi anulată. Șoferul va fi șters permanent din sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anulează</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDriver(driver.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Șterge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Backup și Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Export date</div>
                    <div className="text-xs text-muted-foreground">Descarcă toate datele în Excel</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Key className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">API Keys</div>
                    <div className="text-xs text-muted-foreground">Gestionează integrările</div>
                  </div>
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Backup automat</h4>
                <p className="text-sm text-muted-foreground">
                  Datele sunt salvate automat în cloud. Ultima salvare: {new Date().toLocaleDateString('ro-RO')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}