import { useEffect, useState } from 'react';

import { AppContext } from './utils';
import Hello from './Hello';

export const getLangStrings = lang => {
  const url = `${process.env.PUBLIC_URL}/strings/${lang}/strings.${window.STRINGS_HASH}.json`
  return fetch(url)
  .then(res => res.json())
};



function App() {
  const [langStrings, setLangStrings] = useState(null);
  console.log(process.env)
  useEffect(() => {
    getLangStrings(process.env.REACT_APP_LANG)
    .then(data => {
      setLangStrings(data)
    })
  }, [])

  if (langStrings === null) return null

  return (
    <div className="App">
      <AppContext.Provider value={{
        strings: langStrings
      }}>
        <Hello />
      </AppContext.Provider>
    </div>
  );
}

export default App;
