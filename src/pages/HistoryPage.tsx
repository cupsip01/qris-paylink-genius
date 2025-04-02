import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* History content */}
        </CardContent>
      </Card>
    </div>
  );
} 