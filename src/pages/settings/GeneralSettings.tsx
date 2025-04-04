
import Layout from "@/components/Layout";

const GeneralSettings = () => {
  return (
    <Layout title="General Settings" subtitle="Configure general app settings" showBackButton={true}>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">General Preferences</h2>
          {/* Content here */}
          <p className="text-gray-500">General settings will be available soon.</p>
        </div>
      </div>
    </Layout>
  );
};

export default GeneralSettings;
