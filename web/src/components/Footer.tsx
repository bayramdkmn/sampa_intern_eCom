import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="bg-white text-black border-t border-black/10">
      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 px-4 py-6 md:py-4">
        <div className="flex justify-center md:justify-start">
          <img src="/sampa-logo.png" alt="logo" width={150} height={150} />
        </div>

        <div className="text-center md:text-left">
          <span className="text-xl font-semibold">Shop</span>
          <div className="flex flex-col gap-2 md:gap-4 text-gray-500 mt-2">
            <Link href="/products">Products</Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:gap-4 text-center md:text-left">
          <span className="text-xl font-semibold">Support</span>
          <div className="flex flex-col gap-2 md:gap-4 text-gray-500">
            <span>Contact Us</span>
            <span>Privacy Policy</span>
          </div>
        </div>

        <div className="flex justify-center flex-col items-center md:items-start md:pr-20">
          <span className="text-xl font-semibold my-2">Follow Us</span>
          <div className="flex flex-row gap-4">
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
