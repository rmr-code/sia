import React from 'react';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-50 p-4">
      <div className="container mx-auto flex justify-center items-center">
        <img src={logo} alt="Logo" width={64} height={64} />
      </div>
    </header>
  );
};

export default Header;
