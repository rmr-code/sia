import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import logo from '../assets/logo.png';

interface HeaderWithLinkProps {
  link: string; // Required link prop
}

const HeaderWithLink: React.FC<HeaderWithLinkProps> = ({ link }) => {
  return (
    <header className="bg-gray-50 text-blue-600 p-4">
      <div className="container max-w-4xl mx-auto flex justify-between items-center">
        <img src={logo} alt="Logo" width={48} height={48} />
        <Link to={link}>
          <HiOutlineX className="w-6 h-6 cursor-pointer" />
        </Link>
      </div>
    </header>
  );
};

export default HeaderWithLink;
