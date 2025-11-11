import Image from "next/image";

type FollowingListProps = {
    following: { label: string; imageSrc: string }[];
};

export function FollowingList({ following }: FollowingListProps) {
  return (
    <>
      <div className="mt-8 text-sm font-medium text-zinc-500">Following</div>
      <ul className="mt-2 space-y-2 text-sm">
        {following.map(({ label, imageSrc }) => (
          <li key={label} className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-2">
                <Image src={imageSrc} alt={label} width={32} height={32} className="rounded-full h-8 w-8"/>
                <span>{label}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          </li>
        ))}
      </ul>
    </>
  );
}
