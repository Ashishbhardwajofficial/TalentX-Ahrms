import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  padding?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'large',
  className = '',
  padding = true
}) => {
  const containerClasses = [
    'container',
    `container-${size}`,
    padding && 'container-padded',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default Container;