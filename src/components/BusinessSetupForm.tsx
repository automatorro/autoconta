import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Building2, User, Truck, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { BusinessEntity, BusinessEntityInsert } from '@/types/business';
import { businessService } from '@/services/businessService';
import { useAuth } from '@/hooks/useAuth';

interface BusinessSetupFormProps {
  onBusinessCreated?: (business: BusinessEntity) => void;
  existingBusiness?: BusinessEntity;
}

export function BusinessSetupForm({ onBusinessCreated, existingBusiness }: BusinessSetupFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [activeTab, setActiveTab] = useState('setup');
  
  const [formData, setFormData] = useState<BusinessEntityInsert>({
    user_id: user?.id || '',
    business_type: 'PFA',
    business_name: '',
    fiscal_code: '',
    registration_number: '',
    transport_license: '',
    manager_transport_license: '',
    address: '',
    phone: '',
    email: user?.email || '',
    bank_account: '',
    bank_name: '',
    vat_payer: false,
    micro_enterprise: false
  });

  useEffect(() => {
    if (existingBusiness) {
      setFormData({
        user_id: existingBusiness.user_id,
        business_type: existingBusiness.business_type,
        business_name: existingBusiness.business_name,
        fiscal_code: existingBusiness.fiscal_code,
        registration_number: existingBusiness.registration_number || '',
        transport_license: existingBusiness.transport_license || '',
        manager_transport_license: existingBusiness.manager_transport_license || '',
        address: existingBusiness.address,
        phone: existingBusiness.phone,
        email: existingBusiness.email,
        bank_account: existingBusiness.bank_account || '',
        bank_name: existingBusiness.bank_name || '',
        vat_payer: existingBusiness.vat_payer,
        micro_enterprise: existingBusiness.micro_enterprise
      });
    }
    loadBusinesses();
  }, [existingBusiness]);

  const loadBusinesses = async () => {
    if (!user?.id) return;
    
    try {
      const data = await businessService.getBusinessEntities(user.id);
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      let result: BusinessEntity;
      
      if (existingBusiness) {
        result = await businessService.updateBusinessEntity(existingBusiness.id, formData);
        toast({
          title: "Succes",
          description: "Entitatea de business a fost actualizată cu succes."
        });
      } else {
        result = await businessService.createBusinessEntity({
          ...formData,
          user_id: user.id
        });
        toast({
          title: "Succes",
          description: "Entitatea de business a fost creată cu succes."
        });
      }
      
      onBusinessCreated?.(result);
      loadBusinesses();
      
      if (!existingBusiness) {
        // Reset form pentru o nouă entitate
        setFormData({
          user_id: user.id,
          business_type: 'PFA',
          business_name: '',
          fiscal_code: '',
          registration_number: '',
          transport_license: '',
          manager_transport_license: '',
          address: '',
          phone: '',
          email: user.email || '',
          bank_account: '',
          bank_name: '',
          vat_payer: false,
          micro_enterprise: false
        });
      }
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la salvarea entității de business.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getBusinessTypeInfo = (type: string) => {
    switch (type) {
      case 'SRL_MANAGER_TRANSPORT':
        return {
          title: 'SRL cu Manager de Transport',
          description: 'Societate cu răspundere limitată cu Manager de Transport atestat',
          icon: Building2,
          color: 'bg-blue-100 text-blue-800',
          requirements: ['CUI', 'Nr. înregistrare la Registrul Comerțului', 'Atestat Manager Transport', 'Licență transport']
        };
      case 'PFA':
        return {
          title: 'Persoană Fizică Autorizată',
          description: 'Activitate independentă de transport',
          icon: User,
          color: 'bg-green-100 text-green-800',
          requirements: ['CNP', 'Autorizație PFA', 'Licență transport (opțional)']
        };
      case 'FLEET_DRIVER':
        return {
          title: 'Șofer în Flotă',
          description: 'Șofer angajat la o companie de transport',
          icon: Truck,
          color: 'bg-orange-100 text-orange-800',
          requirements: ['CNP', 'Contract de muncă', 'Permis de conducere']
        };
      default:
        return {
          title: 'Necunoscut',
          description: '',
          icon: FileText,
          color: 'bg-gray-100 text-gray-800',
          requirements: []
        };
    }
  };

  const businessTypeInfo = getBusinessTypeInfo(formData.business_type);
  const IconComponent = businessTypeInfo.icon;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">Configurare Business</TabsTrigger>
          <TabsTrigger value="existing">Entități Existente</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                {existingBusiness ? 'Editează Entitatea de Business' : 'Configurează Entitatea de Business'}
              </CardTitle>
              <CardDescription>
                {existingBusiness 
                  ? 'Modifică informațiile entității de business existente'
                  : 'Configurează tipul de activitate și informațiile necesare pentru conformitatea fiscală'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipul de business */}
                <div className="space-y-2">
                  <Label htmlFor="business_type">Tipul de Activitate</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value: any) => setFormData({ ...formData, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul de activitate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SRL_MANAGER_TRANSPORT">SRL cu Manager de Transport</SelectItem>
                      <SelectItem value="PFA">Persoană Fizică Autorizată (PFA)</SelectItem>
                      <SelectItem value="FLEET_DRIVER">Șofer în Flotă</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Info despre tipul selectat */}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${businessTypeInfo.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{businessTypeInfo.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{businessTypeInfo.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Documente necesare:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {businessTypeInfo.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Informații de bază */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Denumirea Entității *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="Ex: Transport SRL sau Nume PFA"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiscal_code">
                      {formData.business_type === 'PFA' || formData.business_type === 'FLEET_DRIVER' ? 'CNP *' : 'CUI *'}
                    </Label>
                    <Input
                      id="fiscal_code"
                      value={formData.fiscal_code}
                      onChange={(e) => setFormData({ ...formData, fiscal_code: e.target.value })}
                      placeholder={formData.business_type === 'PFA' || formData.business_type === 'FLEET_DRIVER' ? 'CNP' : 'CUI'}
                      required
                    />
                  </div>

                  {formData.business_type === 'SRL_MANAGER_TRANSPORT' && (
                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Nr. Înregistrare Registrul Comerțului</Label>
                      <Input
                        id="registration_number"
                        value={formData.registration_number}
                        onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        placeholder="J40/1234/2024"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="transport_license">Licența de Transport</Label>
                    <Input
                      id="transport_license"
                      value={formData.transport_license}
                      onChange={(e) => setFormData({ ...formData, transport_license: e.target.value })}
                      placeholder="Numărul licenței de transport"
                    />
                  </div>

                  {formData.business_type === 'SRL_MANAGER_TRANSPORT' && (
                    <div className="space-y-2">
                      <Label htmlFor="manager_transport_license">Atestat Manager Transport *</Label>
                      <Input
                        id="manager_transport_license"
                        value={formData.manager_transport_license}
                        onChange={(e) => setFormData({ ...formData, manager_transport_license: e.target.value })}
                        placeholder="Numărul atestatului Manager Transport"
                        required={formData.business_type === 'SRL_MANAGER_TRANSPORT'}
                      />
                    </div>
                  )}
                </div>

                {/* Date de contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Date de Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0712345678"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresa *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Adresa completă"
                      required
                    />
                  </div>
                </div>

                {/* Date bancare */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Date Bancare (Opțional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Banca</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="Ex: BRD, BCR, ING"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_account">IBAN</Label>
                      <Input
                        id="bank_account"
                        value={formData.bank_account}
                        onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                        placeholder="RO49AAAA1B31007593840000"
                      />
                    </div>
                  </div>
                </div>

                {/* Opțiuni fiscale */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Opțiuni Fiscale</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vat_payer"
                        checked={formData.vat_payer}
                        onCheckedChange={(checked) => setFormData({ ...formData, vat_payer: checked as boolean })}
                      />
                      <Label htmlFor="vat_payer" className="text-sm">
                        Plătitor de TVA
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="micro_enterprise"
                        checked={formData.micro_enterprise}
                        onCheckedChange={(checked) => setFormData({ ...formData, micro_enterprise: checked as boolean })}
                      />
                      <Label htmlFor="micro_enterprise" className="text-sm">
                        Microîntreprindere (impozit 1%)
                      </Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Se salvează...' : (existingBusiness ? 'Actualizează' : 'Creează Entitatea')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entități de Business Existente</CardTitle>
              <CardDescription>
                Gestionează entitățile de business configurate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu ai încă entități de business configurate.</p>
                  <Button 
                    onClick={() => setActiveTab('setup')} 
                    className="mt-4"
                  >
                    Configurează Prima Entitate
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {businesses.map((business) => {
                    const typeInfo = getBusinessTypeInfo(business.business_type);
                    const TypeIcon = typeInfo.icon;
                    
                    return (
                      <Card key={business.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{business.business_name}</h4>
                              <p className="text-sm text-muted-foreground">{typeInfo.title}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{business.fiscal_code}</Badge>
                                {business.vat_payer && <Badge variant="secondary">Plătitor TVA</Badge>}
                                {business.micro_enterprise && <Badge variant="secondary">Microîntreprindere</Badge>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                user_id: business.user_id,
                                business_type: business.business_type,
                                business_name: business.business_name,
                                fiscal_code: business.fiscal_code,
                                registration_number: business.registration_number || '',
                                transport_license: business.transport_license || '',
                                manager_transport_license: business.manager_transport_license || '',
                                address: business.address,
                                phone: business.phone,
                                email: business.email,
                                bank_account: business.bank_account || '',
                                bank_name: business.bank_name || '',
                                vat_payer: business.vat_payer,
                                micro_enterprise: business.micro_enterprise
                              });
                              setActiveTab('setup');
                            }}
                          >
                            Editează
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BusinessSetupForm;