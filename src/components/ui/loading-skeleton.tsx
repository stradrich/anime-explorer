// type LoadingSkeletonProps = {
//   count?: number;
// };

// export default function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
//   return (
//     <>
//       {Array.from({ length: count }).map((_, i) => (
//         <div
//           key={i}
//         />
//       ))}
//     </>
//   )
// }

// src/components/ui/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  count?: number;
}

export default function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-gray-200 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="w-full h-64 md:h-72 lg:h-80 bg-gray-300" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-3/4 bg-gray-300 rounded" />
            <div className="h-4 w-1/2 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}


