export function GradientDust({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] opacity-70" />
      <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-400/20 rounded-full blur-[90px] opacity-60" />
      <div className="absolute -bottom-[10%] left-[30%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-50" />
    </div>
  );
}
