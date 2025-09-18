
import React from 'react';
import Card from '../common/Card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center">
        <Card className="text-center w-full max-w-xl">
            <Construction className="mx-auto h-16 w-16 text-brand-primary mb-4"/>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-300">This module is currently under development.</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Check back soon for exciting new features!</p>
        </Card>
    </div>
  );
};

export default PlaceholderPage;