import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;

    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  if (!prompt) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Install Daybook
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Install the app for quick access.
          </p>
        </div>

        <button
          onClick={install}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
        >
          Install
        </button>
      </div>
    </div>
  );
}