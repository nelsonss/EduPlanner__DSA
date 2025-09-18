
import React from 'react';
import { Alert, AlertLevel } from '../../types';
import Card from '../common/Card';
import { AlertTriangle, Bell, Info } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertConfig: Record<AlertLevel, { icon: React.ElementType, color: string }> = {
    [AlertLevel.Critical]: { icon: AlertTriangle, color: 'text-brand-danger' },
    [AlertLevel.Important]: { icon: Bell, color: 'text-orange-500' },
    [AlertLevel.Info]: { icon: Info, color: 'text-brand-primary' },
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  return (
    <Card>
        <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Actionable Alerts</h2>
        <div className="space-y-4">
            {alerts.map((alert) => {
                const config = alertConfig[alert.level];
                return (
                    <div key={alert.id} className="flex items-start p-3 bg-brand-light-accent dark:bg-brand-dark rounded-lg">
                       <config.icon className={`w-6 h-6 mr-3 mt-1 flex-shrink-0 ${config.color}`} />
                       <div>
                            <p className="font-bold text-brand-dark dark:text-brand-light">{alert.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{alert.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.timestamp}</p>
                       </div>
                    </div>
                );
            })}
        </div>
    </Card>
  );
};

export default AlertsPanel;