
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminWhatsApp: string;
  setAdminWhatsApp: (value: string) => void;
  whatsAppMessage: string;
  setWhatsAppMessage: (value: string) => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  adminWhatsApp,
  setAdminWhatsApp,
  whatsAppMessage,
  setWhatsAppMessage,
}: SettingsDialogProps) => {
  const [tmpWhatsApp, setTmpWhatsApp] = useState(adminWhatsApp);
  const [tmpMessage, setTmpMessage] = useState(whatsAppMessage);

  const handleSave = () => {
    setAdminWhatsApp(tmpWhatsApp);
    setWhatsAppMessage(tmpMessage);
    
    // Save to localStorage
    localStorage.setItem('adminWhatsApp', tmpWhatsApp);
    localStorage.setItem('whatsAppMessage', tmpMessage);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>WhatsApp Settings</DialogTitle>
          <DialogDescription>
            Configure the WhatsApp number and message template for payment confirmations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Admin WhatsApp Number</p>
            <Input
              value={tmpWhatsApp}
              onChange={(e) => setTmpWhatsApp(e.target.value)}
              placeholder="628123456789"
            />
            <p className="text-xs text-gray-500">
              Include country code without + (e.g., 628123456789)
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Message Template</p>
            <Input
              value={tmpMessage}
              onChange={(e) => setTmpMessage(e.target.value)}
              placeholder="Halo admin, saya sudah bayar untuk pesanan"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
