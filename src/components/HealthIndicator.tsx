import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { medAiApi } from '@/services/medAiApi';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  message?: string;
}

export const HealthIndicator = () => {
  const [health, setHealth] = useState<HealthStatus>({ status: 'healthy' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await medAiApi.healthCheck();
        setHealth({ status: 'healthy' });
      } catch (error) {
        setHealth({ 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        <span className="text-xs text-muted-foreground">Checking...</span>
      </div>
    );
  }

  const getVariant = () => {
    switch (health.status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'warning' as any;
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case 'healthy':
        return 'API Online';
      case 'degraded':
        return 'API Degraded';
      case 'error':
        return 'API Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getVariant()} className="text-xs">
      <div className={`w-2 h-2 rounded-full mr-1 ${
        health.status === 'healthy' ? 'bg-success' : 
        health.status === 'degraded' ? 'bg-warning' : 'bg-destructive'
      }`}></div>
      {getStatusText()}
    </Badge>
  );
};