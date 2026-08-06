import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show again if the user dismissed it
    if (localStorage.getItem("hidePWAInstall") === "true") return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;

    prompt.prompt();

    const choice = await prompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("User dismissed install");
    }

    setPrompt(null);
    setShowBanner(false);
  };

  const dismiss = () => {
    localStorage.setItem("hidePWAInstall", "true");
    setShowBanner(false);
  };

  if (!prompt || !showBanner) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 rounded-2xl border bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
          <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Install Daybook
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Install Daybook for faster access and offline support.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={install}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Install
            </button>

            <button
              onClick={dismiss}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}