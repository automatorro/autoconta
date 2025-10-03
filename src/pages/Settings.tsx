import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Moon, Sun, BellRing, Lock, LogOut, Save, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { authUser } = useAppStore();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Settings form data
  const [settingsForm, setSettingsForm] = useState({
    theme: "light",
    notifications: true,
    language: "ro",
    autoSave: true,
    twoFactorAuth: false,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Setări Aplicație</h1>
          <p className="text-muted-foreground">
            Personalizați experiența și securitatea aplicației
          </p>
        </div>
        <Button 
          onClick={() => toast({
            title: "Succes!",
            description: "Setările au fost salvate"
          })}
          disabled={isLoading}
          className="gradient-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvează setările
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Aspect
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Securitate
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setări Generale</CardTitle>
              <CardDescription>Configurați preferințele generale ale aplicației</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Limbă</Label>
                  <p className="text-sm text-muted-foreground">Selectați limba preferată pentru interfață</p>
                </div>
                <div className="w-[200px]">
                  <select 
                    id="language"
                    className="w-full p-2 border rounded-md"
                    value={settingsForm.language}
                    onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })}
                  >
                    <option value="ro">Română</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificări</Label>
                  <p className="text-sm text-muted-foreground">Primiți notificări despre actualizări și alerte</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settingsForm.notifications}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, notifications: checked })}
                />
              </div>

              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave">Salvare automată</Label>
                  <p className="text-sm text-muted-foreground">Salvează automat modificările în formulare</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settingsForm.autoSave}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoSave: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aspect</CardTitle>
              <CardDescription>Personalizați aspectul vizual al aplicației</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Temă</Label>
                  <p className="text-sm text-muted-foreground">Alegeți tema preferată pentru interfață</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant={settingsForm.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettingsForm({ ...settingsForm, theme: "light" })}
                    className="w-24"
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Lumină
                  </Button>
                  <Button 
                    variant={settingsForm.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettingsForm({ ...settingsForm, theme: "dark" })}
                    className="w-24"
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Întuneric
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Securitate</CardTitle>
              <CardDescription>Gestionați setările de securitate ale contului</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Autentificare în doi pași</Label>
                  <p className="text-sm text-muted-foreground">Activați autentificarea în doi pași pentru securitate sporită</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settingsForm.twoFactorAuth}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, twoFactorAuth: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  onClick={signOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Deconectare
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debug & Test Tools</CardTitle>
              <CardDescription>Instrumente pentru testarea routing-ului și autentificării</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="h-20 flex-col gap-2"
                >
                  <SettingsIcon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Test Dashboard</div>
                    <div className="text-xs text-muted-foreground">Navighează la dashboard</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Auth User:', authUser);
                    toast({
                      title: "Stare autentificare",
                      description: `Auth User: ${authUser ? 'Conectat' : 'Neconectat'}`,
                    });
                  }}
                  className="h-20 flex-col gap-2"
                >
                  <Lock className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Check Auth State</div>
                    <div className="text-xs text-muted-foreground">Verifică starea autentificării</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    toast({
                      title: "Storage curățat",
                      description: "LocalStorage și SessionStorage au fost curățate",
                    });
                  }}
                  className="h-20 flex-col gap-2"
                >
                  <LogOut className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Clear Storage</div>
                    <div className="text-xs text-muted-foreground">Curăță storage-ul local</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Reload App",
                      description: "Aplicația va fi reîncărcată...",
                    });
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="h-20 flex-col gap-2"
                >
                  <SettingsIcon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Reload App</div>
                    <div className="text-xs text-muted-foreground">Reîncarcă aplicația</div>
                  </div>
                </Button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Informații Utilizator</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {authUser?.email || 'N/A'}</p>
                    <p><span className="font-medium">ID:</span> {authUser?.id || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}