import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { accidentAnalysisApi } from '@/utils/apiClient';

interface FileWithError {
  file: File;
  error?: string;
}

interface AnalysisResult {
  grade: string;
  grade_code: 'yes' | 'no' | 'uncertain' | 'insufficient';
  justification: string;
  circumstances?: string;
  anomalies?: string;
  raw?: any;
  card_file_path?: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const validateFile = (file: File): string | null => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Typ pliku ${file.type} nie jest dozwolony. Dozwolone typy: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, WEBP, BMP, TIFF`;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `Rozmiar pliku (${formatFileSize(file.size)}) przekracza limit 10 MB`;
  }

  return null;
};

export const OfficerView: React.FC = () => {
  const [files, setFiles] = useState<FileWithError[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithError[] = Array.from(selectedFiles).map((file) => {
      const error = validateFile(file);
      return { file, error };
    });

    setFiles((prev) => [...prev, ...newFiles]);
    setAnalysisError(null);
    setAnalysisResult(null);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setAnalysisError(null);
    setAnalysisResult(null);
  };

  const validFiles = files.filter((f) => !f.error);
  const hasValidFiles = validFiles.length > 0;

  const handleAnalyze = async () => {
    if (!hasValidFiles) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const result = await accidentAnalysisApi.analyseAccident(validFiles.map((f) => f.file));
      setAnalysisResult(result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Wystąpił błąd podczas analizy. Spróbuj ponownie.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeDisplay = (gradeCode: string) => {
    switch (gradeCode) {
      case 'yes':
        return { text: 'Tak', color: 'text-green-600', bg: 'bg-green-50' };
      case 'no':
        return { text: 'Nie', color: 'text-red-600', bg: 'bg-red-50' };
      case 'uncertain':
        return { text: 'Wątpliwy', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'insufficient':
        return { text: 'Brak danych', color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { text: gradeCode, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload dokumentów</CardTitle>
          <CardDescription>
            Prześlij dokumenty związane z wypadkiem przy pracy (PDF, DOC, DOCX, XLS, XLSX, obrazy)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              Upload documents
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Maksymalny rozmiar pliku: 10 MB
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Wybrane pliki:</h3>
              <div className="space-y-2">
                {files.map((fileWithError, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-md border ${fileWithError.error
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border bg-card'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileWithError.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileWithError.file.size)}
                        </p>
                        {fileWithError.error && (
                          <p className="text-xs text-destructive mt-1">{fileWithError.error}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={isAnalyzing}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleAnalyze}
            disabled={!hasValidFiles || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizowanie...
              </>
            ) : (
              'Analizuj przypadek'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {analysisError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive mb-1">Błąd analizy</h3>
                <p className="text-sm text-muted-foreground">{analysisError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Wyniki analizy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grade */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Ocena:</h3>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-md font-semibold ${getGradeDisplay(analysisResult.grade_code).bg
                    } ${getGradeDisplay(analysisResult.grade_code).color}`}
                >
                  {getGradeDisplay(analysisResult.grade_code).text}
                </div>
                <span className="text-sm text-muted-foreground">{analysisResult.grade}</span>
              </div>
            </div>

            {/* Justification */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Uzasadnienie:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {analysisResult.justification}
              </p>
            </div>

            {/* Circumstances */}
            {analysisResult.circumstances && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Okoliczności:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysisResult.circumstances}
                </p>
              </div>
            )}

            {/* Anomalies */}
            {analysisResult.anomalies && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Anomalie:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysisResult.anomalies}
                </p>
              </div>
            )}

            {/* Download accident card if available */}
            {analysisResult.card_file_path && analysisResult.circumstances && (
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    try {
                      await accidentAnalysisApi.downloadAccidentCard(analysisResult.circumstances || '');
                    } catch (error: any) {
                      console.error('Error downloading accident card:', error);
                      alert('Nie udało się pobrać karty wypadku. Spróbuj ponownie.');
                    }
                  }}
                  className="w-full"
                  variant="default"
                >
                  <File className="w-4 h-4 mr-2" />
                  Pobierz Kartę Wypadku
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

