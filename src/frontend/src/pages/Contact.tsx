import { useEffect } from "react";

function Contact() {
  useEffect(() => {
    document.title = 'Contact | Clonvix';
  }, []);
  return (
  <div className="p-6">
    <h1 className="p-6 text-4xl text-center font-semibold">Contact</h1>
  </div>
  )
}

export default Contact
