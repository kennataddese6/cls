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
    title: "Sam Spotless Cleaning",
    description:
      "Comprehensive professional cleaning in UK. We provide a wide range of cleaning services for homes and businesses, ensuring a spotless environment.",
  },
};
