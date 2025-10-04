import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Declarations() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Declarații Fiscale</h1>
            <Badge variant="secondary">În curând</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Gestionare și depunere declarații fiscale</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Declarații TVA</CardTitle>
            </div>
            <CardDescription>
              Formularul 300 și 301 pentru TVA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Pre-completare automată din documente</li>
              <li>• Verificare automată a soldurilor</li>
              <li>• Depunere electronică la ANAF</li>
              <li>• Arhivă declarații anterioare</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Calendar fiscal</CardTitle>
            </div>
            <CardDescription>
              Termine și obligații fiscale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Notificări automate pentru termene</li>
              <li>• Calendar personalizat pe profil</li>
              <li>• Istorie obligații fiscale</li>
              <li>• Alerte 7 zile înainte de termen</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>D390 & D394</CardTitle>
            </div>
            <CardDescription>
              Declarații de impozit și contribuții
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Calcul automat impozit pe venit</li>
              <li>• Contribuții sociale și asigurări</li>
              <li>• Declarații trimestriale și anuale</li>
              <li>• Validare încrucișată cu documentele</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Funcționalitate în dezvoltare</h3>
            <p className="text-muted-foreground">
              Modulul de declarații fiscale va fi disponibil în curând. Includem integrare directă cu SPV ANAF.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
