import { MediumShell } from '@/components/layout/MediumShell';
import { SectionPlaceholder } from '@/components/pages/SectionPlaceholder';
import { EditorialRail } from '@/components/right-rail/EditorialRail';
import { followingAccounts } from '@/data/following';

export default function LibraryPage() {
  return (
    <MediumShell
      currentNav="library"
      rightRail={<EditorialRail />}
    >
      <SectionPlaceholder
        title="Your reading list is warming up"
        description="Save drafts and bookmarked stories here. Add highlights, resurface old favorites, and keep track of what to revisit next."
        actions={['Add stories to your first list', 'Import highlights from the Gemini CLI', 'Plan a weekend reading session']}
      />
    </MediumShell>
  );
}
