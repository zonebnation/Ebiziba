import React from 'react';

// Kulaane component that just displays an image
export const Kulaane: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <img
        src="https://iqrauganda.org/wp-content/uploads/2025/04/logo.jpeg"
        alt="Book cover"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// You can also add a default export if needed
export default Kulaane;
