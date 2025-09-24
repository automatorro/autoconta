import Papa from 'papaparse';

// Tipuri pentru rapoarte
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  matched: boolean;
  documentId?: string;
}

export interface Report {
  id: string;
  source: 'uber' | 'bolt';
  period: string;
  fileName: string;
  uploadDate: string;
  transactions: Transaction[];
  totalAmount: number;
  matchedAmount: number;
  status: 'processing' | 'completed' | 'error';
}

// Funcție pentru procesarea rapoartelor CSV Uber
export const processUberReport = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions: Transaction[] = [];
          let data = results.data as any[];
          
          // Procesăm datele din CSV-ul Uber
          data.forEach((row, index) => {
            // Verificăm dacă rândul conține date valide
            if (row['Trip or Order Date'] && row['Amount']) {
              transactions.push({
                id: `uber-${Date.now()}-${index}`,
                date: new Date(row['Trip or Order Date']).toISOString(),
                amount: parseFloat(row['Amount'].replace(',', '.')),
                description: row['Trip or Order'] || `Cursă Uber #${index}`,
                category: 'transport',
                matched: false
              });
            }
          });
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Funcție pentru procesarea rapoartelor CSV Bolt
export const processBoltReport = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions: Transaction[] = [];
          let data = results.data as any[];
          
          // Procesăm datele din CSV-ul Bolt
          data.forEach((row, index) => {
            // Verificăm dacă rândul conține date valide
            if (row['Date'] && row['Amount']) {
              transactions.push({
                id: `bolt-${Date.now()}-${index}`,
                date: new Date(row['Date']).toISOString(),
                amount: parseFloat(row['Amount'].replace(',', '.')),
                description: row['Description'] || `Cursă Bolt #${index}`,
                category: 'transport',
                matched: false
              });
            }
          });
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Funcție pentru potrivirea tranzacțiilor cu documentele
export const matchTransactionsWithDocuments = (
  transactions: Transaction[], 
  documents: any[]
): Transaction[] => {
  // Implementare simplificată pentru potrivirea tranzacțiilor
  return transactions.map(transaction => {
    // Căutăm un document care ar putea corespunde tranzacției
    const matchedDocument = documents.find(doc => {
      // Verificăm dacă suma și data sunt apropiate
      const docAmount = parseFloat(doc.totalAmount);
      const docDate = new Date(doc.date);
      const txDate = new Date(transaction.date);
      
      // Verificăm dacă suma este aceeași (cu o toleranță de 0.01)
      const amountMatch = Math.abs(docAmount - transaction.amount) < 0.01;
      
      // Verificăm dacă data este în aceeași zi
      const dateMatch = 
        docDate.getFullYear() === txDate.getFullYear() &&
        docDate.getMonth() === txDate.getMonth() &&
        docDate.getDate() === txDate.getDate();
      
      return amountMatch && dateMatch;
    });
    
    if (matchedDocument) {
      return {
        ...transaction,
        matched: true,
        documentId: matchedDocument.id
      };
    }
    
    return transaction;
  });
};

// Funcție pentru calcularea sumelor din raport
export const calculateReportTotals = (transactions: Transaction[]): { totalAmount: number, matchedAmount: number } => {
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const matchedAmount = transactions
    .filter(tx => tx.matched)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  return { totalAmount, matchedAmount };
};

// Funcție pentru generarea unui ID unic pentru raport
export const generateReportId = (): string => {
  return `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Funcție pentru determinarea perioadei din tranzacții
export const determinePeriodFromTransactions = (transactions: Transaction[]): string => {
  if (transactions.length === 0) {
    return `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
  }
  
  // Sortăm tranzacțiile după dată
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Luăm prima și ultima tranzacție pentru a determina perioada
  const firstDate = new Date(sortedTransactions[0].date);
  const lastDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);
  
  // Dacă sunt în aceeași lună, returnăm luna/anul
  if (
    firstDate.getMonth() === lastDate.getMonth() &&
    firstDate.getFullYear() === lastDate.getFullYear()
  ) {
    return `${firstDate.getMonth() + 1}/${firstDate.getFullYear()}`;
  }
  
  // Altfel, returnăm un interval
  return `${firstDate.getMonth() + 1}/${firstDate.getFullYear()} - ${lastDate.getMonth() + 1}/${lastDate.getFullYear()}`;
};