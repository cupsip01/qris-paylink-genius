
import Layout from "@/components/Layout";

const AppearanceSettings = () => {
  return (
    <Layout title="Appearance" subtitle="Customize the app's appearance" showBackButton={true}>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Theme Settings</h2>
          {/* Content here */}
          <p className="text-gray-500">Appearance settings will be available soon.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AppearanceSettings;
