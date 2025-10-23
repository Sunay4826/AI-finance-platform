"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      await scanReceiptFn(file);
    } catch (error) {
      console.error("Receipt scan error:", error);
      
      // Show specific error messages based on error type
      if (error.message.includes("overloaded")) {
        toast.error("Gemini API is currently busy. Please try again in a few minutes.");
      } else if (error.message.includes("API key")) {
        toast.error("Gemini API key is invalid. Please check your configuration.");
      } else {
        toast.error("Failed to scan receipt. Please try again or enter details manually.");
      }
    }
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData, onScanComplete]);

  // Check if API key is missing and show helpful message
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not configured. Receipt scanning will not work.");
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReceiptScan(file);
          }}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanReceiptLoading}
            >
              {scanReceiptLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  <span>Scanning Receipt...</span>
                </>
              ) : (
                <>
                  <Camera className="mr-2" />
                  <span>Scan Receipt with AI</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload a receipt image to automatically extract transaction details</p>
            <p className="text-xs text-muted-foreground mt-1">
              Requires GEMINI_API_KEY in environment variables
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
