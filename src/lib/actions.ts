import { BiFoodMenu } from "react-icons/bi";
import { FiHome, FiSettings } from "react-icons/fi";
import { RiTeamLine } from "react-icons/ri";

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
    id: "food-summary",
    name: "Food Summary",
    shortcut: ["f"],
    keywords: "food summary",
    perform: () => (window.location.pathname = "/food-summary"),
    section: "Navigation",
    icon: BiFoodMenu({ size: "1rem" }),
  },
  {
    id: "team",
    name: "Team",
    shortcut: ["t"],
    keywords: "team",
    perform: () => (window.location.pathname = "/team"),
    section: "Navigation",
    icon: RiTeamLine({ size: "1rem" }),
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
