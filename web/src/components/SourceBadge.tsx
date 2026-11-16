interface SourceBadgeProps {
  sourceType: "ppt" | "book" | "mixed";
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  if (sourceType === "ppt") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-black text-white">
        PPT 簡報
      </span>
    );
  }

  if (sourceType === "book") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-white text-black border-2 border-black">
        BOOK 原文書
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-orange-600 text-white">
      MIXED 對照
    </span>
  );
}
