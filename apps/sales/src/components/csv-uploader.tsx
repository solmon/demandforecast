"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CSVUploaderProps {
  onDataLoaded: (data: string[][]) => void;
}

export function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setSuccess(true), 500);
    }
  }, [progress]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setFileName(file.name);
    setProgress(5);

    if (!file.name.endsWith(".csv")) {
      setError("Invalid file format. Please upload a .csv file.");
      setProgress(100);
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 50));
      }
    };

    reader.onload = async (event) => {
      setProgress(50);
      
      const worker = new Worker(
        new URL("@/workers/csv-worker.ts", import.meta.url)
      );

      worker.onmessage = (msg) => {
        if (msg.data.type === 'progress') {
          setProgress(50 + Math.round(msg.data.progress * 45));
        } else if (msg.data.success) {
          setProgress(100);
          onDataLoaded(msg.data.data);
        } else {
          setError(msg.data.error);
          setProgress(100);
        }
        
        if (msg.data.type !== 'progress') {
          worker.terminate();
          setIsLoading(false);
        }
      };

      worker.postMessage({ text: event.target?.result as string });
    };

    reader.onerror = () => {
      setError("Error reading the file.");
      setProgress(100);
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {!isLoading && !success ? (
              <>
                <div className="rounded-full bg-primary/10 p-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>

                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="max-w-sm cursor-pointer"
                  id="csv-upload"
                />
                <Button
                  variant="default"
                  disabled={isLoading}
                  onClick={() => document.getElementById("csv-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                {fileName && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{fileName}</span>
                  </div>
                )}

                <Progress value={progress} className="h-2 w-full" />

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>CSV file processed successfully!</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {isLoading && (
                  <p className="text-sm text-muted-foreground">
                    Processing data...
                  </p>
                )}

                {(success || error) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setError(null);
                      setFileName(null);
                      setProgress(0);
                    }}
                  >
                    Upload another file
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
