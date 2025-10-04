import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Accounting() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Contabilitate</h1>
            <Badge variant="secondary">În curând</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Gestionare completă a contabilității și raportării financiare</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>Jurnal Contabil</CardTitle>
            </div>
            <CardDescription>
              Înregistrare automată a tranzacțiilor conform normelor contabile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Plan de conturi conform OMFP 1802/2014</li>
              <li>• Înregistrări automate din documente</li>
              <li>• Rapoarte contabile personalizabile</li>
              <li>• Export pentru contabil</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Balanță de verificare</CardTitle>
            </div>
            <CardDescription>
              Generare automată a balanței de verificare lunară
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Balanță sintetică și analitică</li>
              <li>• Verificare automată a echilibrului</li>
              <li>• Comparații lunare</li>
              <li>• Export în format Excel/PDF</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Situații financiare</CardTitle>
            </div>
            <CardDescription>
              Generare bilanț, cont de profit și pierdere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Bilanț contabil (activ și pasiv)</li>
              <li>• Cont de profit și pierdere</li>
              <li>• Fluxuri de numerar</li>
              <li>• Note explicative</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Funcționalitate în dezvoltare</h3>
            <p className="text-muted-foreground">
              Modulul de contabilitate este în curs de dezvoltare. Veți fi notificat când devine disponibil.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
