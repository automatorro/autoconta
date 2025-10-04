import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Reconciliation() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reconciliere Automată</h1>
          <p className="text-muted-foreground">Potrivire automată documente cu tranzacții bancare și rapoarte platforme</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <CardTitle>Reconciliere bancară</CardTitle>
            </div>
            <CardDescription>Import și potrivire extrase de cont</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Import automat extrase bancare</li>
              <li>• Potrivire cu facturi emise/primite</li>
              <li>• Detectare discrepanțe</li>
              <li>• Rapoarte de reconciliere</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>Rapoarte platforme</CardTitle>
            </div>
            <CardDescription>Verificare cu Uber, Bolt, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Import rapoarte platforme rideshare</li>
              <li>• Verificare venituri declarate</li>
              <li>• Identificare diferențe</li>
              <li>• Sincronizare automată</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Alerte și notificări</CardTitle>
            </div>
            <CardDescription>Monitorizare discrepanțe</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Detectare tranzacții nereconciliate</li>
              <li>• Alerte pentru diferențe mari</li>
              <li>• Sugestii de corectare</li>
              <li>• Rapoarte lunare</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Funcționalitate în dezvoltare</h3>
            <p className="text-muted-foreground">
              Modulul de reconciliere automată va simplifica verificarea și potrivirea documentelor cu tranzacțiile bancare.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
