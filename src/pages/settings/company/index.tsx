import { CompanyForm } from "~/components/Settings/CompanyForm";
import Layout from "~/layout";
import SettingsLayout from "~/layout/settingsLayout";
import { Separator } from "~/ui/separator";

export default function CompanyProfilePage() {
  return (
    <Layout emoji="🎐" description="Sal.">
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Company Profile</h3>
            <p className="text-muted-foreground text-sm">
              Update your company profile.
            </p>
          </div>
          <Separator />
          <CompanyForm />
        </div>
      </SettingsLayout>
    </Layout>
  );
}
