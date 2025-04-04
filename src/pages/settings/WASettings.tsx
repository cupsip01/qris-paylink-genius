
import Layout from "@/components/Layout";

const WASettings = () => {
  return (
    <Layout title="WhatsApp Settings" subtitle="Configure your WhatsApp notification settings" showBackButton={true}>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">WhatsApp Integration</h2>
          {/* Content here */}
          <p className="text-gray-500">WhatsApp settings will be available soon.</p>
        </div>
      </div>
    </Layout>
  );
};

export default WASettings;
