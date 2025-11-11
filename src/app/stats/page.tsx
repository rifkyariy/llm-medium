import { MediumShell } from '@/components/layout/MediumShell';
import { SectionPlaceholder } from '@/components/pages/SectionPlaceholder';
import { EditorialRail } from '@/components/right-rail/EditorialRail';
import { followingAccounts } from '@/data/following';

export default function StatsPage() {
  return (
    <MediumShell currentNav="stats" rightRail={<EditorialRail />}>
      <SectionPlaceholder
        title="Track how your stories perform"
        description="Analytics will populate as soon as your first Gemini-assisted post goes live. Until then, plan experiments, set benchmarks, and align with your team."
        actions={['Define success metrics', 'Schedule your next post', 'Share results with stakeholders']}
      />
    </MediumShell>
  );
}
