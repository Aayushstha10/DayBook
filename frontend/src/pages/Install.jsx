import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("hideInstallBanner") === "true"
    ) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    const installed = () => {
      setShow(false);
      localStorage.removeItem("hideInstallBanner");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShow(false);
    }

    setDeferredPrompt(null);
  };

  const close = () => {
    localStorage.setItem("hideInstallBanner", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 animate-[slideUp_.35s_ease]">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl dark:border-gray-700 dark:bg-gray-900/95">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Download className="text-blue-600 dark:text-blue-300" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Install Daybook
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get a faster experience with offline support.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={install}
                disabled={!deferredPrompt}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {deferredPrompt ? "Install" : "Preparing..."}
              </button>

              <button
                onClick={close}
                className="rounded-xl border border-gray-300 px-4 py-2.5 transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={close}
            className="rounded-full p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
