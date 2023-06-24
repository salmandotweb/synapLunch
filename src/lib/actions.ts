import { FiHome, FiSettings } from "react-icons/fi";

export const actions = [
  {
    id: "home",
    name: "Home",
    shortcut: ["h"],
    keywords: "home",
    perform: () => (window.location.pathname = "/"),
    section: "Navigation",
    icon: FiHome({ size: "1rem" }),
  },
  {
    id: "settings",
    name: "Settings",
    shortcut: ["s"],
    keywords: "settings",
    perform: () => (window.location.pathname = "/settings/profile"),
    section: "Navigation",
    icon: FiSettings({ size: "1rem" }),
  },
];
