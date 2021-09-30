import { createContext, useContext } from "react";
export const AppContext = createContext()

export function useLangStrings(moduleName) {
    const { strings } = useContext(AppContext);
    return strings[moduleName]
}