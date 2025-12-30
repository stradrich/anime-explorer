type LoadingSkeletonProps = {
  count?: number;
};

export default function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
        />
      ))}
    </>
  )
}
