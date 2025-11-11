import { MediumShell } from '@/components/layout/MediumShell';
import { SectionPlaceholder } from '@/components/pages/SectionPlaceholder';
import { EditorialRail } from '@/components/right-rail/EditorialRail';
import { followingAccounts } from '@/data/following';

export default function ProfilePage() {
  return (
    <MediumShell currentNav="profile" rightRail={<EditorialRail />}>
      <SectionPlaceholder
        title="Introduce yourself to readers"
        description="Your profile is the hub for published drafts, series, and curated collections. Share a short bio, link favorite projects, and outline the topics you cover most."
        actions={['Write a bio that highlights your expertise', 'Pin 3 stories you love', 'Connect with collaborators']}
      />
    </MediumShell>
  );
}
