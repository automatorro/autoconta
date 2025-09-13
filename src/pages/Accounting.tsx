import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, BookOpen, TrendingUp, Users, Building } from 'lucide-react';
import { ChartOfAccountsForm } from '@/components/ChartOfAccountsForm';
import { JournalEntryForm } from '@/components/JournalEntryForm';
import { FinancialReports } from '@/components/FinancialReports';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('chart-of-accounts');

  const accountingModules = [
    {
      id: 'chart-of-accounts',
      title: 'Planul de Conturi',
      description: 'Gestionați planul de conturi conform standardelor românești',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-800',
      component: ChartOfAccountsForm
    },
    {
      id: 'journal-entries',
      title: 'Jurnal Contabil',
      description: 'Înregistrări contabile și jurnalul general',
      icon: FileText,
      color: 'bg-green-100 text-green-800',
      component: JournalEntryForm
    },
    {
      id: 'financial-reports',
      title: 'Rapoarte Financiare',
      description: 'Balanța de verificare, bilanț și contul de profit și pierdere',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-800',
      component: FinancialReports
    }
  ];

  const complianceFeatures = [
    {
      title: 'Conformitate Legislație Română',
      description: 'Planul de conturi și rapoartele respectă standardele românești',
      icon: Building,
      status: 'implemented'
    },
    {
      title: 'TVA Dinamic (August 2025)',
      description: 'Sistem de TVA adaptat pentru modificările din august 2025',
      icon: Calculator,
      status: 'implemented'
    },
    {
      title: 'Documente Legislative',
      description: 'Gestionarea autorizațiilor de transport, copiilor conforme și ecusonelor',
      icon: FileText,
      status: 'implemented'
    },
    {
      title: 'Integrare Saga',
      description: 'Compatibilitate cu sistemul Saga pentru conturi și operațiuni',
      icon: Users,
      status: 'in-progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'implemented': return 'Implementat';
      case 'in-progress': return 'În progres';
      case 'planned': return 'Planificat';
      default: return 'Necunoscut';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contabilitate</h1>
        <p className="text-muted-foreground">
          Sistem complet de contabilitate conform legislației românești, cu suport pentru modificările TVA din august 2025
        </p>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Conformitate și Funcționalități
          </CardTitle>
          <CardDescription>
            Statusul implementării funcționalităților pentru conformitatea cu legislația română
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.title} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-medium text-sm">{feature.title}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                      <Badge className={getStatusColor(feature.status)} variant="secondary">
                        {getStatusText(feature.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Accounting Modules */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            {accountingModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <TabsTrigger key={module.id} value={module.id} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{module.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Module Description Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accountingModules.map((module) => {
              const IconComponent = module.icon;
              const isActive = activeTab === module.id;
              return (
                <Card 
                  key={module.id} 
                  className={`cursor-pointer transition-all ${
                    isActive ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
                  }`}
                  onClick={() => setActiveTab(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{module.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                        {isActive && (
                          <Badge variant="default" className="mt-2">
                            Activ
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        {accountingModules.map((module) => {
          const ComponentToRender = module.component;
          return (
            <TabsContent key={module.id} value={module.id} className="space-y-6">
              <ComponentToRender />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informații Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Modificări TVA August 2025</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sistem dinamic de calcul TVA</li>
                <li>• Adaptare automată la noile cote</li>
                <li>• Compatibilitate cu firmele plătitoare de TVA normal</li>
                <li>• Istoric complet al modificărilor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Documente Legislative</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autorizații de transport alternativ</li>
                <li>• Copii conforme cu gestionare expirare</li>
                <li>• Ecusoane pentru platforme</li>
                <li>• Notificări automate pentru expirări</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="h-4 w-4" />
              <span>
                Sistemul este configurat pentru conformitatea cu legislația română și 
                modificările TVA din august 2025. Toate calculele și rapoartele respectă 
                standardele contabile românești.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}