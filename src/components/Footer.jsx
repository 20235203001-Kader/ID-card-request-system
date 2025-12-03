// Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-6 ">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        
        {/* ID Card Services */}
        <div>
          <h3 className="text-white font-semibold mb-4">ID Card Services</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Request Card</a></li>
            <li><a href="#" className="hover:text-white">Lost/Stolen Cards</a></li>
            <li><a href="#" className="hover:text-white">Card Policies</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <p>University Card Center</p>
          <p>123 University Avenue</p>
          <p>Campus Building C, Room 101</p>
          <p>Phone: (555) 123-4567</p>
          <p>
            Email:{" "}
            <a
              href="mailto:idcards@bubt.edu.bd"
              className="hover:text-white"
            >
              idcards@bubt.edu.bd
            </a>
          </p>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-white font-semibold mb-4">Hours</h3>
          <p>Monday - Friday: 8:30 AM - 4:30 PM</p>
          <p>Saturday: Closed</p>
          <p>Sunday: Closed</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-3 pt-3 mb-3 text-sm text-gray-400 text-center max-w-5xl mx-auto px-6">
        <p>
          © {new Date().getFullYear()} BUBT CSE. All rights reserved. Developed by{" "}
          <a
            href="https://www.facebook.com/tanvirahmedrume"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Tanvir Ahmed
          </a>
        </p>
      </div>
    </footer>
  );
}
