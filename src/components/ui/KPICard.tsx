import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: 'red' | 'green' | 'blue' | 'purple';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, bgColor }) => {
  const bgColorClasses = {
    red: 'bg-card-red',
    green: 'bg-card-green',
    blue: 'bg-card-blue',
    purple: 'bg-card-purple'
  };

  return (
    <div className={`${bgColorClasses[bgColor]} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-400 ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;