import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
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
      setDeferredPrompt(null);
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
    <div
      className="
        fixed inset-x-0 bottom-0 z-50
        flex justify-center
        p-2
        sm:bottom-4 sm:p-4
        animate-[slideUp_.35s_ease]
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-t-2xl
          border border-gray-200
          bg-white/95
          shadow-2xl
          backdrop-blur-md
          sm:rounded-2xl
          dark:border-gray-700
          dark:bg-gray-900/95
        "
      >
        <div
          className="
            relative
            flex items-start
            gap-3
            p-4
            sm:gap-4 sm:p-5
          "
        >
          {/* Icon */}
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full
              bg-blue-100
              sm:h-12 sm:w-12
              dark:bg-blue-900
            "
          >
            <Download className="text-blue-600 dark:text-blue-300" size={22} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pr-6">
            <h3
              className="
                text-base font-semibold
                text-gray-900
                sm:text-lg
                dark:text-white
              "
            >
              Install Daybook
            </h3>

            <p
              className="
                mt-1
                text-xs leading-relaxed
                text-gray-500
                sm:text-sm
                dark:text-gray-400
              "
            >
              Get a faster experience with offline support.
            </p>

            {/* Buttons */}
            <div
              className="
                mt-4
                flex flex-col
                gap-2
                min-[380px]:flex-row
              "
            >
              <button
                type="button"
                onClick={install}
                disabled={!deferredPrompt}
                className="
                  w-full
                  rounded-xl
                  bg-blue-600
                  px-4 py-2.5
                  text-sm font-medium
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:bg-gray-300
                  sm:text-base
                  dark:disabled:bg-gray-700
                "
              >
                {deferredPrompt ? "Install" : "Preparing..."}
              </button>

              <button
                type="button"
                onClick={close}
                className="
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-2.5
                  text-sm font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                  min-[380px]:w-auto
                  sm:text-base
                  dark:border-gray-600
                  dark:text-gray-200
                  dark:hover:bg-gray-800
                "
              >
                Later
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={close}
            aria-label="Close install banner"
            className="
              absolute right-3 top-3
              rounded-full
              p-1.5
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
              sm:right-4 sm:top-4
              dark:text-gray-400
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
