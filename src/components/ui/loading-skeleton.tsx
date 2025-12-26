type LoadingSkeletonProps = {
  count?: number;
};

export default function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "280px",
            backgroundColor: "#e5e7eb",
            borderRadius: "0.75rem",
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
    </>
  )
}
