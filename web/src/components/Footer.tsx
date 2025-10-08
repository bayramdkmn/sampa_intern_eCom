import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
const Footer = () => {
  return (
    <footer className="bg-white text-black border-t border-black/10">
      <div className="flex flex-row justify-between px-4 py-4">
        <div>
          <img src="/sampa-logo.png" alt="logo" width={150} height={150} />
        </div>
        <div>
          <span className="text-xl font-semibold">Shop</span>
          <div className="flex flex-col gap-4 text-gray-500">
            <span>Products</span>
            <span>Categories</span>
            <span>Brands</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xl font-semibold">Support</span>
          <div className="flex flex-col gap-4 text-gray-500">
            <span>Contact Us</span>
            <span>Privacy Policy</span>
          </div>
        </div>
        <div className="pr-20 flex justify-center flex-col">
          <span className="pl-3 text-xl font-semibold my-2">Follow Us</span>
          <div className="flex flex-row gap-4 w-full h-full">
            <InstagramIcon sx={{ width: 50, height: 30 }} />
            <TwitterIcon sx={{ width: 50, height: 30 }} />
            <LinkedInIcon sx={{ width: 50, height: 30 }} />
          </div>
        </div>
      </div>
      <FooterBottom />
    </footer>
  );
};

const FooterBottom = () => {
  return (
    <div className="bg-white border-t border-black/10 px-4 py-3 text-center text-xs text-black/60">
      © {new Date().getFullYear()} sampa.shop — All rights reserved.
    </div>
  );
};

export default Footer;
