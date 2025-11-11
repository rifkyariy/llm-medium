import { MediumShell } from '@/components/layout/MediumShell';
import { SectionPlaceholder } from '@/components/pages/SectionPlaceholder';
import { EditorialRail } from '@/components/right-rail/EditorialRail';
import { followingAccounts } from '@/data/following';

export default function StoriesPage() {
  return (
    <MediumShell currentNav="stories" rightRail={<EditorialRail />}>
      <SectionPlaceholder
        title="Drafts and published stories"
        description="Organize Gemini-generated drafts, track edits, and publish to targeted publications. Start a new story or import Markdown from the CLI."
        actions={['Start a brand-new draft', 'Review your latest Gemini article', 'Connect to a publication']}
      />
    </MediumShell>
  );
}
