import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Compliance() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Conformitate Fiscală</h1>
            <Badge variant="secondary">În curând</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Monitorizare conformitate și risc fiscal</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Audit intern</CardTitle>
            </div>
            <CardDescription>
              Verificare automată conformitate fiscală
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Verificare automată documente</li>
              <li>• Detectare anomalii și erori</li>
              <li>• Rapoarte de conformitate lunare</li>
              <li>• Score de risc fiscal</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <CardTitle>Validare documente</CardTitle>
            </div>
            <CardDescription>
              Verificare conformitate facturi și chitanțe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Verificare CIF furnizori în ANAF</li>
              <li>• Validare facturi conform normelor</li>
              <li>• Detectare documente suspecte</li>
              <li>• Alerte pentru documente neconforme</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Management risc</CardTitle>
            </div>
            <CardDescription>
              Identificare și prevenire riscuri fiscale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Monitorizare modificări legislative</li>
              <li>• Alerte pentru riscuri fiscale</li>
              <li>• Recomandări preventive</li>
              <li>• Rapoarte pentru revisal fiscal</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Funcționalitate în dezvoltare</h3>
            <p className="text-muted-foreground">
              Modulul de conformitate fiscală va include verificări automate și alerte preventive pentru evitarea problemelor cu ANAF.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
