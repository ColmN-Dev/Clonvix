import { useEffect } from "react";

function ColmNDev() {
  useEffect(() => {
    document.title = 'ColmN-Dev | Clonvix';
  }, []);
  
  return (
  <div className="p-6">
    <h1 className="p-6 text-4xl text-center font-semibold">ColmN-Dev</h1>
  </div>
  )
}

export default ColmNDev
