import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Lightbulb, PiggyBank } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TaxOptimization() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Optimizare Fiscală</h1>
            <Badge variant="secondary">În curând</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Recomandări inteligente pentru reducerea obligațiilor fiscale</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Recomandări AI</CardTitle>
            </div>
            <CardDescription>
              Sugestii automate de economisire fiscală
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Analiza cheltuielilor deductibile</li>
              <li>• Identificare oportunități de economie</li>
              <li>• Simulări diferite scenarii fiscale</li>
              <li>• Planificare fiscală anuală</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              <CardTitle>Deduceri inteligente</CardTitle>
            </div>
            <CardDescription>
              Maximizare deduceri legale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Cheltuieli vehicule și carburant</li>
              <li>• Amortizare accelerată active</li>
              <li>• Contribuții pensii private</li>
              <li>• Donații și sponsorizări</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <CardTitle>Planificare fiscală</CardTitle>
            </div>
            <CardDescription>
              Strategie pe termen lung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Analiza forme de impozitare</li>
              <li>• Comparație PFA vs SRL vs II</li>
              <li>• Optimizare plată dividende</li>
              <li>• Planuri personalizate</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Funcționalitate în dezvoltare</h3>
            <p className="text-muted-foreground">
              Modulul de optimizare fiscală folosește inteligență artificială pentru a identifica oportunități de economisire legală.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
