
import Layout from "@/components/Layout";

const QRISSettings = () => {
  return (
    <Layout title="QRIS Settings" subtitle="Configure your QRIS payment settings" showBackButton={true}>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">QRIS Configuration</h2>
          {/* Content here */}
          <p className="text-gray-500">QRIS settings will be available soon.</p>
        </div>
      </div>
    </Layout>
  );
};

export default QRISSettings;
