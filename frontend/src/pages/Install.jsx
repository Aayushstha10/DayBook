import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:w-96 z-50">
      <div className="rounded-2xl bg-white border shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <Download className="text-blue-600" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Install Daybook
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Install Daybook for a faster experience and offline access.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={installApp}
                disabled={!deferredPrompt}
                className={`flex-1 rounded-lg py-2 font-medium transition ${
                  deferredPrompt
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {deferredPrompt ? "Install" : "Preparing..."}
              </button>

              <button
                onClick={() => setShowBanner(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}