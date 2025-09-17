import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Calculator, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const { authUser, setUser, setSession } = useAppStore();
  
  // Verificăm și curățăm starea de autentificare la încărcarea paginii Index
  useEffect(() => {
    // Verificăm dacă există chei Supabase în localStorage
    const hasSbKeys = Object.keys(localStorage).some(key => key.startsWith('sb-'));
    
    // Verificăm dacă există stare Zustand persistentă
    const hasZustandState = localStorage.getItem('contauber-storage') !== null;
    
    // Dacă există chei de autentificare sau stare persistentă, dar nu există utilizator autentificat
    // sau dacă suntem pe pagina principală și există stare persistentă
    if ((hasSbKeys || hasZustandState) && !authUser) {
      console.log('🧹 Index: Detected inconsistent auth state, cleaning up...');
      
      // Curățăm starea Zustand
      setUser(null);
      setSession(null);
      
      // Curățăm localStorage
      localStorage.removeItem('contauber-storage');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [authUser, setUser, setSession]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            AutoConta
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Contabilitate online pentru șoferi și flote Uber/Bolt
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatizează procesarea documentelor, reconcilierea datelor și 
            generarea declarațiilor fiscale obligatorii pentru activitatea ta de transport.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Începe acum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Vezi demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">OCR Documente</h3>
            <p className="text-muted-foreground">
              Fotografiază bonurile fiscale și extrage automat datele importante
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Declarații Automate</h3>
            <p className="text-muted-foreground">
              Generează declarațiile 212, 301 și 394 direct din contabilitate
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Analytics Avansate</h3>
            <p className="text-muted-foreground">
              Monitorizează profitabilitatea și optimizează costurile pe cursă
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Compliance Total</h3>
            <p className="text-muted-foreground">
              Respectă toate cerințele legale și primește alerte pentru termene
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Gata să îți simplifici contabilitatea?
          </h2>
          <p className="text-lg text-muted-foreground">
            Alătură-te șoferilor profesioniști care economisesc timp și bani cu AutoConta
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Creează cont gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
