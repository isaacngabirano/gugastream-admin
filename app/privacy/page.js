export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Introduction</h2>
          <p>
            Welcome to GugaStream ("we," "our," or "us"). We are committed to protecting your privacy 
            and ensuring you have a positive experience on our mobile application.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Information We Collect</h2>
          <p>
            We collect minimal information to provide our services:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Device Information:</strong> We may collect information about your mobile device, including model and operating system, to ensure app compatibility.</li>
            <li><strong>Usage Data:</strong> We collect anonymous data about how you use the app, such as movies watched and features used, to improve our content.</li>
            <li><strong>User Provided Information:</strong> When you use the app, you may provide a name or nickname. We do not require phone numbers or email addresses for basic access.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Provide and maintain our streaming service.</li>
            <li>Monitor the usage of our service to detect, prevent and address technical issues.</li>
            <li>Personalize your experience (e.g., Watch History and Favorites).</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Data Security</h2>
            <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet, 
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
            your Personal Data, we cannot guarantee its absolute security.
            </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@gugastream.com.
          </p>
        </div>
      </div>
    </div>
  );
}
