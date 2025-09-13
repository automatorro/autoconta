import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileText, Shield, Award, Plus, AlertTriangle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TransportAuthorizationForm } from '@/components/TransportAuthorizationForm';
import { CertifiedCopyForm } from '@/components/CertifiedCopyForm';
import { BadgeForm } from '@/components/BadgeForm';
import type { TransportAuthorization, CertifiedCopy, Badge as BadgeType } from '@/types/accounting';

export default function LegislativeDocuments() {
  const [transportAuthorizations, setTransportAuthorizations] = useState<TransportAuthorization[]>([]);
  const [certifiedCopies, setCertifiedCopies] = useState<CertifiedCopy[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [authResponse, copiesResponse, badgesResponse] = await Promise.all([
        supabase.from('transport_authorizations').select('*').order('created_at', { ascending: false }),
        supabase.from('certified_copies').select('*').order('created_at', { ascending: false }),
        supabase.from('badges').select('*').order('created_at', { ascending: false })
      ]);

      if (authResponse.error) throw authResponse.error;
      if (copiesResponse.error) throw copiesResponse.error;
      if (badgesResponse.error) throw badgesResponse.error;

      setTransportAuthorizations(authResponse.data || []);
      setCertifiedCopies(copiesResponse.data || []);
      setBadges(badgesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const warningDate = addDays(now, 30);

    if (isBefore(expiry, now)) {
      return { status: 'expired', label: 'Expirat', variant: 'destructive' as const };
    } else if (isBefore(expiry, warningDate)) {
      return { status: 'warning', label: 'Expiră în curând', variant: 'secondary' as const };
    } else {
      return { status: 'valid', label: 'Valid', variant: 'default' as const };
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Se încarcă documentele...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documente Legislative</h1>
          <p className="text-muted-foreground mt-2">
            Gestionați documentele necesare pentru conformitatea cu legislația română
          </p>
        </div>
      </div>

      <Tabs defaultValue="transport" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Autorizații Transport
          </TabsTrigger>
          <TabsTrigger value="copies" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Copii Conforme
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Ecusoane
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transport" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Autorizații de Transport Alternativ</h2>
            <Dialog open={dialogOpen === 'transport'} onOpenChange={(open) => setDialogOpen(open ? 'transport' : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Autorizație
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Autorizație de Transport Nouă</DialogTitle>
                </DialogHeader>
                <TransportAuthorizationForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setDialogOpen(null)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {transportAuthorizations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Nu există autorizații de transport înregistrate</p>
                </CardContent>
              </Card>
            ) : (
              transportAuthorizations.map((auth) => {
                const expiryStatus = getExpiryStatus(auth.expiry_date);
                return (
                  <Card key={auth.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {auth.series} {auth.number}
                        </CardTitle>
                        <Badge variant={expiryStatus.variant}>
                          {expiryStatus.label}
                        </Badge>
                      </div>
                      <CardDescription>{auth.company_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Platformă:</span> {auth.platform}
                        </div>
                        <div>
                          <span className="font-medium">Data obținerii:</span> {format(new Date(auth.issue_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                        <div>
                          <span className="font-medium">Data expirării:</span> {format(new Date(auth.expiry_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="copies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Copii Conforme</h2>
            <Dialog open={dialogOpen === 'copies'} onOpenChange={(open) => setDialogOpen(open ? 'copies' : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Copie Conformă
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Copie Conformă Nouă</DialogTitle>
                </DialogHeader>
                <CertifiedCopyForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setDialogOpen(null)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {certifiedCopies.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Nu există copii conforme înregistrate</p>
                </CardContent>
              </Card>
            ) : (
              certifiedCopies.map((copy) => {
                const expiryStatus = getExpiryStatus(copy.expiry_date);
                return (
                  <Card key={copy.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {copy.number}
                        </CardTitle>
                        <Badge variant={expiryStatus.variant}>
                          {expiryStatus.label}
                        </Badge>
                      </div>
                      <CardDescription>{copy.document_type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Data emiterii:</span> {format(new Date(copy.issue_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                        <div>
                          <span className="font-medium">Data expirării:</span> {format(new Date(copy.expiry_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ecusoane</h2>
            <Dialog open={dialogOpen === 'badges'} onOpenChange={(open) => setDialogOpen(open ? 'badges' : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Ecuson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ecuson Nou</DialogTitle>
                </DialogHeader>
                <BadgeForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setDialogOpen(null)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {badges.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Nu există ecusoane înregistrate</p>
                </CardContent>
              </Card>
            ) : (
              badges.map((badge) => {
                const expiryStatus = getExpiryStatus(badge.expiry_date);
                return (
                  <Card key={badge.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {badge.number}
                        </CardTitle>
                        <Badge variant={expiryStatus.variant}>
                          {expiryStatus.label}
                        </Badge>
                      </div>
                      <CardDescription>{badge.platform} - {badge.badge_type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Data obținerii:</span> {format(new Date(badge.issue_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                        <div>
                          <span className="font-medium">Data expirării:</span> {format(new Date(badge.expiry_date), 'dd/MM/yyyy', { locale: ro })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}