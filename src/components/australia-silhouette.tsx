// Real Australia map (from simplemaps.com, free for commercial use) rendered
// via CSS mask so it tints with the current text color.
const AustraliaSilhouette = ({ className }: { className?: string }) => (
  <div
    className={className}
    style={{
      backgroundColor: "currentColor",
      WebkitMaskImage: "url(/australia.svg)",
      maskImage: "url(/australia.svg)",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
    aria-hidden="true"
  />
);

export default AustraliaSilhouette;
