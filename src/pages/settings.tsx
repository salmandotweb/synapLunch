import { ProfileForm } from "~/components/SettingsForm";
import Layout from "~/layout";
import SettingsLayout from "~/layout/settingsLayout";
import { Separator } from "~/ui/separator";

export default function SettingsProfilePage() {
  return (
    <Layout emoji="🎐" description="Sal.">
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-muted-foreground text-sm">
              This is how others will see you on the site.
            </p>
          </div>
          <Separator />
          <ProfileForm />
        </div>
      </SettingsLayout>
    </Layout>
  );
}
