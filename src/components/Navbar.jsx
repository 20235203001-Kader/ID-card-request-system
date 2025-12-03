import React from "react";
import bubtHome from "../assets/bubt_logo_homepage.png"; 

function Navbar() {
  return (
    <header className="px-28 w-full flex justify-between items-center p-4 bg-white shadow-md">
      <img src={bubtHome} alt="BUBT Logo" className="h-10" />


    </header>
  );
}

export default Navbar;
