import React from 'react';
import SearchOffIcon from '@mui/icons-material/SearchOff'; 

interface NoResultsProps {
  description: string;
}

const NoResults: React.FC<NoResultsProps> = ({ description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 p-4">
      <SearchOffIcon style={{ fontSize: 64, color: 'inherit' }} />
      <p className="mt-2 text-base">{description}</p>
    </div>
  );
};

export default NoResults;
