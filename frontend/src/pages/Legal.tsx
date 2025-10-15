import React from "react";

const Legal: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Legal Information</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
        <p className="mb-4 text-gray-800">
          By using the Fuel Tracker app, you agree to comply with our terms and conditions. You agree that the information provided by the app is for personal use only,
          and you will not misuse the data or services offered. The app owner reserves the right to modify these terms at any time.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Privacy Policy</h2>
        <p className="mb-4 text-gray-800">
          We take your privacy seriously. The Fuel Tracker app collects only the necessary personal data to provide the service, including account information and fuel entry logs.
          Your data is stored securely and is not shared with third parties without your consent. Please refer to our detailed Privacy Policy for full information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Disclaimer</h2>
        <p className="mb-4 text-gray-800">
          The data and analytics provided by Fuel Tracker are intended for informational purposes only. The app does not guarantee accuracy or completeness of any information,
          and is not responsible for any decisions made based on this data. Use the app at your own risk.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Copyright</h2>
        <p className="mb-4 text-gray-800">
          &copy; {new Date().getFullYear()} Fuel Tracker. All rights reserved.
        </p>
      </section>
    </div>
  );
};

export default Legal;