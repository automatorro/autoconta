import React, { useState, useEffect } from "react";
import { Building2, Car, Users, Download, Key, Save, Plus, Edit, Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Vehicle, Driver, Company } from "@/types/accounting";
import { supabase } from "@/integrations/supabase/client";

export default function BusinessManagement() {
  const { user, authUser, setCompany, addVehicle, updateVehicle, removeVehicle, addDriver, updateDriver, removeDriver } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  
  // State pentru gestionarea companiei
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
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
      email: ''
    }
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  
  // State pentru gestionarea vehiculelor
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  
  // State pentru gestionarea șoferilor
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  
  // State pentru confirmări ștergere
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'vehicle' | 'driver', id: string } | null>(null);

  // Load company data when editing
  useEffect(() => {
    if (isCompanyDialogOpen && user.company) {
      setCompanyFormData({
        companyName: user.company.name,
        companyType: user.company.type,
        cif: user.company.cif,
        cnp: user.company.cnp || '',
        vatPayer: user.company.vatPayer,
        address: user.company.address,
        contact: user.company.contact
      });
    }
  }, [isCompanyDialogOpen, user.company]);

  // Funcții pentru gestionarea companiei
  const openAddCompanyDialog = () => {
    setCompanyFormData({
      companyName: '',
      companyType: 'PFA',
      cif: '',
      cnp: '',
      vatPayer: false,
      address: { street: '', city: '', county: '', postalCode: '' },
      contact: { phone: '', email: authUser?.email || '' }
    });
    setIsCompanyDialogOpen(true);
  };

  const openEditCompanyDialog = () => {
    setIsCompanyDialogOpen(true);
  };

  const handleSaveCompany = async () => {
    if (!authUser || !companyFormData.companyName || !companyFormData.cif) {
      toast({
        title: "Validare",
        description: "Te rugăm să completezi toate câmpurile obligatorii.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingCompany(true);
    try {
      // Salvare în Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authUser.id,
          company_name: companyFormData.companyName,
          company_type: companyFormData.companyType,
          cif: companyFormData.cif,
          cnp: companyFormData.cnp || null,
          vat_payer: companyFormData.vatPayer,
          address_street: companyFormData.address.street,
          address_city: companyFormData.address.city,
          address_county: companyFormData.address.county,
          address_postal_code: companyFormData.address.postalCode,
          contact_phone: companyFormData.contact.phone,
          contact_email: companyFormData.contact.email,
          setup_completed: true
        });

      if (error) throw error;

      // Actualizare store local
      const company: Company = {
        id: authUser.id,
        name: companyFormData.companyName,
        cif: companyFormData.cif,
        cnp: companyFormData.cnp || undefined,
        type: companyFormData.companyType as 'PFA' | 'SRL',
        vatPayer: companyFormData.vatPayer,
        address: companyFormData.address,
        contact: companyFormData.contact,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCompany(company);

      toast({
        title: "✓ Succes",
        description: "Datele companiei au fost salvate cu succes.",
      });

      setIsCompanyDialogOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "✗ Eroare",
        description: "Nu s-au putut salva datele companiei.",
        variant: "destructive"
      });
    } finally {
      setIsSavingCompany(false);
    }
  };
  
  // Funcții pentru gestionarea vehiculelor
  const openAddVehicleDialog = () => {
    setCurrentVehicle(null);
    setIsVehicleDialogOpen(true);
  };
  
  const openEditVehicleDialog = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsVehicleDialogOpen(true);
  };
  
  const confirmDeleteVehicle = (vehicleId: string) => {
    setDeleteTarget({ type: 'vehicle', id: vehicleId });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteVehicle = async () => {
    if (!deleteTarget || deleteTarget.type !== 'vehicle') return;
    
    try {
      await removeVehicle(deleteTarget.id);
      toast({
        title: "✓ Vehicul șters",
        description: "Vehiculul a fost șters cu succes.",
      });
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Eroare la ștergerea vehiculului:", error);
      toast({
        title: "✗ Eroare",
        description: "A apărut o eroare la ștergerea vehiculului.",
        variant: "destructive",
      });
    }
  };
  
  // Funcții pentru gestionarea șoferilor
  const openAddDriverDialog = () => {
    setCurrentDriver(null);
    setIsDriverDialogOpen(true);
  };
  
  const openEditDriverDialog = (driver: Driver) => {
    setCurrentDriver(driver);
    setIsDriverDialogOpen(true);
  };
  
  const confirmDeleteDriver = (driverId: string) => {
    setDeleteTarget({ type: 'driver', id: driverId });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteDriver = async () => {
    if (!deleteTarget || deleteTarget.type !== 'driver') return;
    
    try {
      await removeDriver(deleteTarget.id);
      toast({
        title: "✓ Șofer șters",
        description: "Șoferul a fost șters cu succes.",
      });
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Eroare la ștergerea șoferului:", error);
      toast({
        title: "✗ Eroare",
        description: "A apărut o eroare la ștergerea șoferului.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveVehicle = () => {
    if (!currentVehicle) return;
    
    try {
      if (currentVehicle.id) {
        updateVehicle(currentVehicle.id, currentVehicle);
      } else {
        addVehicle({
          ...currentVehicle,
          id: `vehicle-${Date.now()}`
        });
      }
      
      setIsVehicleDialogOpen(false);
      toast({
        title: currentVehicle.id ? "✓ Vehicul actualizat" : "✓ Vehicul adăugat",
        description: "Vehiculul a fost salvat cu succes.",
      });
    } catch (error) {
      console.error("Eroare la salvarea vehiculului:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la salvarea vehiculului.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveDriver = () => {
    if (!currentDriver) return;
    
    try {
      if (currentDriver.id) {
        updateDriver(currentDriver.id, currentDriver);
      } else {
        addDriver({
          ...currentDriver,
          id: `driver-${Date.now()}`
        });
      }
      
      setIsDriverDialogOpen(false);
      toast({
        title: currentDriver.id ? "✓ Șofer actualizat" : "✓ Șofer adăugat",
        description: "Șoferul a fost salvat cu succes.",
      });
    } catch (error) {
      console.error("Eroare la salvarea șoferului:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la salvarea șoferului.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestionare Business</h1>
          <p className="text-muted-foreground">Administrează datele companiei, vehicule și șoferi</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companie
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicule
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Șoferi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informații Companie</CardTitle>
            </CardHeader>
            <CardContent>
              {user.company ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Nume companie</h3>
                      <p>{user.company.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">CIF</h3>
                      <p>{user.company.cif}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Tip companie</h3>
                      <p>{user.company.type}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Plătitor TVA</h3>
                      <p>{user.company.vatPayer ? 'Da' : 'Nu'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Adresă</h3>
                    <p>{user.company.address.street}, {user.company.address.city}, {user.company.address.county}, {user.company.address.postalCode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Telefon</h3>
                      <p>{user.company.contact.phone}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p>{user.company.contact.email}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="mr-2">
                      <Download className="mr-2 h-4 w-4" />
                      Exportă date
                    </Button>
                    <Button onClick={openEditCompanyDialog}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editează
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Nu există date despre companie</h3>
                  <p className="text-muted-foreground">Adaugă informațiile companiei tale pentru a continua.</p>
                  <Button className="mt-4" onClick={openAddCompanyDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adaugă companie
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicule</CardTitle>
              <Button size="sm" onClick={openAddVehicleDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adaugă vehicul
              </Button>
            </CardHeader>
            <CardContent>
              {user.vehicles && user.vehicles.length > 0 ? (
                <div className="space-y-4">
                  {user.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{vehicle.make} {vehicle.model}</h3>
                          <p className="text-muted-foreground">Număr înmatriculare: {vehicle.plateNumber}</p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="font-medium">ITP expiră: </span>
                              {new Date(vehicle.documents.itp.expiryDate).toLocaleDateString('ro-RO')}
                            </div>
                            <div>
                              <span className="font-medium">RCA expiră: </span>
                              {new Date(vehicle.documents.rca.expiryDate).toLocaleDateString('ro-RO')}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditVehicleDialog(vehicle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => confirmDeleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Nu există vehicule</h3>
                  <p className="text-muted-foreground">Adaugă vehiculele tale pentru a continua.</p>
                  <Button className="mt-4" onClick={openAddVehicleDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adaugă vehicul
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Șoferi</CardTitle>
              <Button size="sm" onClick={openAddDriverDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adaugă șofer
              </Button>
            </CardHeader>
            <CardContent>
              {user.drivers && user.drivers.length > 0 ? (
                <div className="space-y-4">
                  {user.drivers.map((driver) => (
                    <div key={driver.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{driver.name}</h3>
                          <p className="text-muted-foreground">CNP: {driver.cnp}</p>
                          <p className="text-muted-foreground">Permis: {driver.licenseNumber}</p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="font-medium">Atestat expiră: </span>
                              {new Date(driver.certificates.professionalAttestation.expiryDate).toLocaleDateString('ro-RO')}
                            </div>
                            <div>
                              <span className="font-medium">Fișă medicală expiră: </span>
                              {new Date(driver.certificates.medicalCertificate.expiryDate).toLocaleDateString('ro-RO')}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDriverDialog(driver)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => confirmDeleteDriver(driver.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Nu există șoferi</h3>
                  <p className="text-muted-foreground">Adaugă șoferii tăi pentru a continua.</p>
                  <Button className="mt-4" onClick={openAddDriverDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adaugă șofer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pentru adăugare/editare vehicul */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentVehicle ? "Editează vehicul" : "Adaugă vehicul"}</DialogTitle>
            <DialogDescription>
              {currentVehicle ? "Modifică detaliile vehiculului" : "Adaugă un vehicul nou în flotă"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Marcă</Label>
                <Input
                  id="make"
                  value={currentVehicle?.make || ""}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle || {}, make: e.target.value } as Vehicle)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={currentVehicle?.model || ""}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle || {}, model: e.target.value } as Vehicle)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Număr înmatriculare</Label>
              <Input
                id="plateNumber"
                value={currentVehicle?.plateNumber || ""}
                onChange={(e) => setCurrentVehicle({ ...currentVehicle || {}, plateNumber: e.target.value } as Vehicle)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">An fabricație</Label>
                <Input
                  id="year"
                  type="number"
                  value={currentVehicle?.year || ""}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle || {}, year: parseInt(e.target.value) } as Vehicle)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">Serie șasiu (VIN)</Label>
                <Input
                  id="vin"
                  value={currentVehicle?.vin || ""}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle || {}, vin: e.target.value } as Vehicle)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itp">ITP expiră</Label>
                <Input
                  id="itp"
                  type="date"
                  value={currentVehicle?.documents?.itp?.expiryDate ? new Date(currentVehicle.documents.itp.expiryDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    const newVehicle = { ...currentVehicle || {} } as Vehicle;
                    if (!newVehicle.documents) newVehicle.documents = {
                      itp: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() },
                      rca: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() }
                    };
                    if (!newVehicle.documents.itp) newVehicle.documents.itp = { documentNumber: '', issueDate: new Date(), expiryDate: new Date() };
                    newVehicle.documents.itp.expiryDate = new Date(e.target.value);
                    setCurrentVehicle(newVehicle);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rca">RCA expiră</Label>
                <Input
                  id="rca"
                  type="date"
                  value={currentVehicle?.documents?.rca?.expiryDate ? new Date(currentVehicle.documents.rca.expiryDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    const newVehicle = { ...currentVehicle || {} } as Vehicle;
                    if (!newVehicle.documents) newVehicle.documents = {
                      itp: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() },
                      rca: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() }
                    };
                    if (!newVehicle.documents.rca) newVehicle.documents.rca = { documentNumber: '', issueDate: new Date(), expiryDate: new Date() };
                    newVehicle.documents.rca.expiryDate = new Date(e.target.value);
                    setCurrentVehicle(newVehicle);
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveVehicle}>
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru adăugare/editare șofer */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentDriver ? "Editează șofer" : "Adaugă șofer"}</DialogTitle>
            <DialogDescription>
              {currentDriver ? "Modifică detaliile șoferului" : "Adaugă un șofer nou în echipă"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Nume complet</Label>
              <Input
                id="driverName"
                value={currentDriver?.name || ""}
                onChange={(e) => setCurrentDriver({ ...currentDriver || {}, name: e.target.value } as Driver)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnp">CNP</Label>
                <Input
                  id="cnp"
                  value={currentDriver?.cnp || ""}
                  onChange={(e) => setCurrentDriver({ ...currentDriver || {}, cnp: e.target.value } as Driver)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Număr permis</Label>
                <Input
                  id="licenseNumber"
                  value={currentDriver?.licenseNumber || ""}
                  onChange={(e) => setCurrentDriver({ ...currentDriver || {}, licenseNumber: e.target.value } as Driver)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attestation">Atestat expiră</Label>
                <Input
                  id="attestation"
                  type="date"
                  value={currentDriver?.certificates?.professionalAttestation?.expiryDate ? new Date(currentDriver.certificates.professionalAttestation.expiryDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    const newDriver = { ...currentDriver || {} } as Driver;
                    if (!newDriver.certificates) newDriver.certificates = { 
                      professionalAttestation: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() }, 
                      medicalCertificate: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() } 
                    };
                    if (!newDriver.certificates.professionalAttestation) newDriver.certificates.professionalAttestation = { documentNumber: '', issueDate: new Date(), expiryDate: new Date() };
                    newDriver.certificates.professionalAttestation.expiryDate = new Date(e.target.value);
                    setCurrentDriver(newDriver);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical">Fișă medicală expiră</Label>
                <Input
                  id="medical"
                  type="date"
                  value={currentDriver?.certificates?.medicalCertificate?.expiryDate ? new Date(currentDriver.certificates.medicalCertificate.expiryDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    const newDriver = { ...currentDriver || {} } as Driver;
                    if (!newDriver.certificates) newDriver.certificates = { 
                      professionalAttestation: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() }, 
                      medicalCertificate: { documentNumber: '', issueDate: new Date(), expiryDate: new Date() } 
                    };
                    if (!newDriver.certificates.medicalCertificate) newDriver.certificates.medicalCertificate = { documentNumber: '', issueDate: new Date(), expiryDate: new Date() };
                    newDriver.certificates.medicalCertificate.expiryDate = new Date(e.target.value);
                    setCurrentDriver(newDriver);
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDriverDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveDriver}>
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru adăugare/editare companie */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{user.company ? "Editează companie" : "Adaugă companie"}</DialogTitle>
            <DialogDescription>
              {user.company ? "Modifică detaliile companiei" : "Adaugă informațiile companiei tale"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Informații generale */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informații generale</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Denumire companie *</Label>
                  <Input
                    id="company-name"
                    value={companyFormData.companyName}
                    onChange={(e) => setCompanyFormData({...companyFormData, companyName: e.target.value})}
                    placeholder="Ex: SC Transport SRL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF/CUI *</Label>
                  <Input
                    id="cif"
                    value={companyFormData.cif}
                    onChange={(e) => setCompanyFormData({...companyFormData, cif: e.target.value})}
                    placeholder="Ex: RO12345678"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tip companie *</Label>
                  <RadioGroup
                    value={companyFormData.companyType}
                    onValueChange={(value) => setCompanyFormData({...companyFormData, companyType: value})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PFA" id="edit-pfa" />
                      <Label htmlFor="edit-pfa">PFA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SRL" id="edit-srl" />
                      <Label htmlFor="edit-srl">SRL</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {companyFormData.companyType === 'PFA' && (
                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP</Label>
                    <Input
                      id="cnp"
                      value={companyFormData.cnp}
                      onChange={(e) => setCompanyFormData({...companyFormData, cnp: e.target.value})}
                      placeholder="Ex: 1234567890123"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-vat-payer"
                  checked={companyFormData.vatPayer}
                  onCheckedChange={(checked) => 
                    setCompanyFormData({...companyFormData, vatPayer: checked as boolean})
                  }
                />
                <Label htmlFor="edit-vat-payer">Plătitor de TVA</Label>
              </div>
            </div>
            
            {/* Adresă */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Adresă</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street">Stradă</Label>
                  <Input
                    id="street"
                    value={companyFormData.address.street}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      address: {...companyFormData.address, street: e.target.value}
                    })}
                    placeholder="Ex: Str. Principală nr. 123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Oraș</Label>
                  <Input
                    id="city"
                    value={companyFormData.address.city}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      address: {...companyFormData.address, city: e.target.value}
                    })}
                    placeholder="Ex: București"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="county">Județ</Label>
                  <Input
                    id="county"
                    value={companyFormData.address.county}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      address: {...companyFormData.address, county: e.target.value}
                    })}
                    placeholder="Ex: Ilfov"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Cod poștal</Label>
                  <Input
                    id="postal-code"
                    value={companyFormData.address.postalCode}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      address: {...companyFormData.address, postalCode: e.target.value}
                    })}
                    placeholder="Ex: 077042"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Contact</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={companyFormData.contact.phone}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      contact: {...companyFormData.contact, phone: e.target.value}
                    })}
                    placeholder="Ex: +40712345678"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyFormData.contact.email}
                    onChange={(e) => setCompanyFormData({
                      ...companyFormData, 
                      contact: {...companyFormData.contact, email: e.target.value}
                    })}
                    placeholder="Ex: contact@firma.ro"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)} disabled={isSavingCompany}>
              Anulează
            </Button>
            <Button onClick={handleSaveCompany} disabled={isSavingCompany || !companyFormData.companyName || !companyFormData.cif}>
              {isSavingCompany ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog pentru confirmări de ștergere */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este permanentă și nu poate fi anulată. 
              {deleteTarget?.type === 'vehicle' ? ' Vehiculul ' : ' Șoferul '}
              va fi șters definitiv din baza de date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteTarget?.type === 'vehicle' ? handleDeleteVehicle : handleDeleteDriver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge definitiv
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}