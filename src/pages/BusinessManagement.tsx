import React, { useState } from "react";
import { Building2, Car, Users, Download, Key, Save, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Setup from "./Setup";

export default function BusinessManagement() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("company");
  
  // Note: Users can access BusinessManagement directly without forced setup redirect
  // Setup is available as a separate route if needed

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
                    <Button>
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
                  <Button className="mt-4">
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
              <Button size="sm">
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
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
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
                  <Button className="mt-4">
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
              <Button size="sm">
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
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
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
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Adaugă șofer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}