import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
interface ExportCSVButtonProps {
  data: any[];
  filename?: string;
  className?: string;
}
export function ExportCSVButton({ data, filename = 'export.csv', className }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const convertToCSV = (objArray: any[]) => {
    if (!objArray || objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]).join(',');
    str += header + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  };
  const handleExport = () => {
    setIsExporting(true);
    try {
      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error("Export failed:", error);
      toast.error('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleExport}
      disabled={isExporting || !data || data.length === 0}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}