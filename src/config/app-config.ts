import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Cleaning Management System",
  version: packageJson.version,
  copyright: `© ${currentYear}, Cleaning Management System.`,
  meta: {
    title: "Cleaning Management System - Admin Dashboard",
    description:
      "Comprehensive cleaning service management system for handling enquiries, quotations, job assignments, evidence, invoices, and payments.",
  },
};
