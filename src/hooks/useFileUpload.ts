/**
 * File Upload Hook
 *
 * Handles file upload, validation, and data loading
 */

import { useState, useCallback } from 'react';
import { validateGraphData } from '@/lib/dataValidator';
import { parseJSONFile, loadSampleData, extractTemporalDataset } from '@/utils/dataUtils';
import type { GraphData, TemporalDataset } from '@/types';
import type { ValidationResult } from '@/lib/dataValidator';

interface UseFileUploadResult {
  data: GraphData | null;
  temporalData: TemporalDataset | null;
  isLoading: boolean;
  error: string | null;
  validationResult: ValidationResult | null;
  uploadFile: (file: File) => Promise<void>;
  loadSample: () => Promise<void>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadResult {
  const [data, setData] = useState<GraphData | null>(null);
  const [temporalData, setTemporalData] = useState<TemporalDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const processData = useCallback((rawData: any) => {
    // Validate data
    const validation = validateGraphData(rawData);
    setValidationResult(validation);

    if (!validation.isValid) {
      throw new Error('Data validation failed');
    }

    // Transform data
    const graphData = validation.data!;
    setData(graphData);

    // Extract temporal data if events exist
    const temporal = extractTemporalDataset(rawData);
    setTemporalData(temporal);

    return graphData;
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Please upload a JSON file');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Parse file
      const rawData = await parseJSONFile(file);

      // Process data
      processData(rawData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMessage);
      setData(null);
      setTemporalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [processData]);

  const loadSample = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const rawData = await loadSampleData();
      processData(rawData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sample data';
      setError(errorMessage);
      setData(null);
      setTemporalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [processData]);

  const reset = useCallback(() => {
    setData(null);
    setTemporalData(null);
    setError(null);
    setValidationResult(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    temporalData,
    isLoading,
    error,
    validationResult,
    uploadFile,
    loadSample,
    reset
  };
}
