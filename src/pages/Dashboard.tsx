import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Plus, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bună ziua, Adrian! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Iată o privire de ansamblu asupra activității dvs. de transport.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Raport lunar
          </Button>
          <Button className="gap-2 gradient-primary">
            <Plus className="h-4 w-4" />
            Document nou
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <DashboardStats />

      {/* Recent Activity & Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documente recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
<<<<<<< HEAD
              { id: "doc1", type: "Combustibil", amount: "245 RON", date: "Azi, 14:30", status: "procesat" },
              { id: "doc2", type: "Service auto", amount: "890 RON", date: "Ieri, 09:15", status: "verificare" },
              { id: "doc3", type: "Asigurare RCA", amount: "1,200 RON", date: "2 zile", status: "procesat" },
              { id: "doc4", type: "Spălătorie", amount: "35 RON", date: "3 zile", status: "procesat" }
            ].map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
=======
              { type: "Combustibil", amount: "245 RON", date: "Azi, 14:30", status: "procesat" },
              { type: "Service auto", amount: "890 RON", date: "Ieri, 09:15", status: "verificare" },
              { type: "Asigurare RCA", amount: "1,200 RON", date: "2 zile", status: "procesat" },
              { type: "Spălătorie", amount: "35 RON", date: "3 zile", status: "procesat" }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
                <div>
                  <p className="font-medium">{doc.type}</p>
                  <p className="text-sm text-muted-foreground">{doc.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{doc.amount}</p>
                  <p className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'procesat' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {doc.status}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistici rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Cost/km</span>
                <span className="font-semibold">1.2 RON</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Eficiență combustibil</span>
                <span className="font-semibold">7.2L/100km</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profit/cursă</span>
                <span className="font-semibold">28 RON</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}