import React from 'react';

const Footer = () => {
  return (
    <footer className="flex justify-center items-center py-4 bg-gray-800 text-white">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} MPESA. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;