export default function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
      {Array.from({ length: 10 }).map((_, i) => (
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
    </div>
  )
}
