import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Sam Spotless Cleaning",
  companyName: "Sam Spotless Cleaning",
  email: "sam@samspotlesscleaning.com",
  phoneMobile: "+44 7442 052931",
  phoneLandline: "02035761607",
  version: packageJson.version,
  copyright: `© ${currentYear}, Sam Spotless Cleaning.`,
  meta: {
    title: "Sam Spotless Cleaning - Admin Dashboard",
    description: "Comprehensive professional cleaning management system for Sam Spotless Cleaning.",
  },
};
