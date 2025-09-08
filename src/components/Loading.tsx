type LoadingProps = {
  message?: string;
};

export function Loading({ message = "验证中..." }: LoadingProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-mono">
      <div className="mx-auto w-full sm:w-[420px] bg-white border-4 border-gray-800 shadow-[6px_6px_0_0_#1f2937] p-8 text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="text-lg font-bold tracking-tight">{message}</p>
        <p className="text-sm text-gray-600 mt-1">请稍候，我们正在验证您的权限…</p>
      </div>
    </div>
  );
}

