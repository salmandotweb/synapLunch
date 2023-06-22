import { FiHome } from "react-icons/fi";

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
];
