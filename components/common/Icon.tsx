
import React from 'react';

interface IconProps {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, className }) => {
  return <IconComponent className={className} />;
};

export default Icon;
