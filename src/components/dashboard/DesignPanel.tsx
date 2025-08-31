"use client";

import { useState, useEffect, useCallback } from "react";
import { DesignSettings } from "@/types/design";
import { ThemeSelector } from "@/components/themes/ThemeSelector";
import { DesignCustomizer } from "@/components/themes/DesignCustomizer";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { useDesignSettings, useUpdateDesign } from "@/hooks/use-design";
import { useCreateCustomTheme } from "@/hooks/use-custom-themes";
import { ThemeTemplate } from "@/lib/themes/templates";

interface DesignPanelProps {
  qrCodeId: string;
  qrTitle: string;
  shortCode: string;
  preferredDomain?: {
    hostname: string;
    verified: boolean;
  } | null;
  links: Array<{
    id: string;
    title: string;
    url: string;
    position: number;
    isActive: boolean;
  }>;
  className?: string;
}

export function DesignPanel({
  qrCodeId,
  qrTitle,
  shortCode,
  preferredDomain,
  links,
  className = "",
}: DesignPanelProps) {
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [localDesign, setLocalDesign] = useState<DesignSettings | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [themeName, setThemeName] = useState("");

  const {
    data: designSettings,
    isLoading,
    error,
  } = useDesignSettings(qrCodeId);
  const updateDesignMutation = useUpdateDesign(qrCodeId);
  const createCustomThemeMutation = useCreateCustomTheme();

  // Debounced API call to prevent multiple simultaneous requests
  const debouncedUpdate = useCallback(
    (design: DesignSettings) => {
      // Only update if mutation is not currently in progress
      if (!updateDesignMutation.isPending) {
        updateDesignMutation.mutate(design);
      }
    },
    [updateDesignMutation]
  );

  // Initialize local design state when data loads
  useEffect(() => {
    if (designSettings && !localDesign) {
      setLocalDesign(designSettings);
    }
  }, [designSettings, localDesign]);

  // Construct the live page URL using the preferred domain or fallback to localhost
  const getLivePageUrl = () => {
    if (preferredDomain && preferredDomain.verified) {
      // Use the verified custom domain
      return `https://${preferredDomain.hostname}/q/${shortCode}`;
    } else {
      // Fallback to the platform domain (in production this would be the main domain)
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? `https://${window.location.hostname}`
          : `http://localhost:${window.location.port}`;
      return `${baseUrl}/q/${shortCode}`;
    }
  };

  const handleThemeSelect = (themeId: string, theme: ThemeTemplate) => {
    const newDesign: DesignSettings = {
      ...localDesign!,
      themeId,
      primaryColor: theme.styles.primaryColor,
      secondaryColor: theme.styles.secondaryColor,
      backgroundType: theme.styles.backgroundType,
      backgroundValue: theme.styles.backgroundValue,
      buttonStyle: theme.styles.buttonStyle,
      fontFamily: theme.styles.fontFamily,
    };

    setLocalDesign(newDesign);
    debouncedUpdate(newDesign);
  };

  const handleDesignChange = (updates: Partial<DesignSettings>) => {
    const updatedDesign = { ...localDesign!, ...updates };
    setLocalDesign(updatedDesign);
  };

  const handleSaveDesign = () => {
    if (localDesign) {
      debouncedUpdate(localDesign);
    }
  };

  // Reset to original design
  const handleResetDesign = () => {
    if (designSettings) {
      setLocalDesign(designSettings);
    }
  };

  // Save current design as custom theme
  const handleSaveAsCustomTheme = async () => {
    if (!localDesign || !themeName.trim()) return;

    try {
      await createCustomThemeMutation.mutateAsync({
        name: themeName.trim(),
        design: localDesign,
      });

      // Reset modal state
      setShowSaveModal(false);
      setThemeName("");

      // Show success feedback (you could add a toast here)
      alert("Custom theme saved successfully!");
    } catch (error) {
      console.error("Failed to save custom theme:", error);
      alert("Failed to save custom theme. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !localDesign) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">Failed to load design settings</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Design Customization
          </h2>
          <p className="text-gray-600 mt-1">
            Customizing: <span className="font-medium">{qrTitle}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Preview Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                previewMode === "mobile"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                previewMode === "desktop"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💻 Desktop
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleResetDesign}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Save as Theme
          </button>
          <button
            onClick={handleSaveDesign}
            disabled={updateDesignMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {updateDesignMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel: Customization */}
        <div className="space-y-6">
          {/* Theme Selector */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Theme
            </h3>
            <ThemeSelector
              currentTheme={localDesign.themeId}
              onThemeSelect={handleThemeSelect}
            />
          </div>

          {/* Design Customizer */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customize Design
            </h3>
            <DesignCustomizer
              design={localDesign}
              onChange={handleDesignChange}
            />
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:sticky lg:top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Live Preview
          </h3>

          {previewMode === "mobile" ? (
            /* Mobile Phone Frame */
            <div className="max-w-xs mx-auto">
              <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-xl">
                {/* Phone outer frame */}
                <div className="bg-black rounded-[2.25rem] p-1">
                  {/* Phone screen */}
                  <div
                    className="bg-white rounded-[2rem] overflow-hidden relative"
                    style={{ aspectRatio: "9/19.5" }}
                  >
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-black rounded-t-[2rem] flex items-center justify-between px-6 text-white text-xs z-10">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3 h-1 bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Content area that fills phone screen */}
                    <div className="h-full pt-6 overflow-hidden">
                      <div className="h-full w-full transform scale-100 origin-top">
                        <ThemeRenderer
                          design={localDesign}
                          title={qrTitle}
                          description={localDesign.description}
                          avatarUrl={localDesign.avatarUrl}
                          links={links}
                          socialLinks={localDesign.socialLinks}
                          className="!h-full !py-2 !min-h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Preview */
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="scale-50 origin-top">
                <ThemeRenderer
                  design={localDesign}
                  title={qrTitle}
                  description={localDesign.description}
                  avatarUrl={localDesign.avatarUrl}
                  links={links}
                  socialLinks={localDesign.socialLinks}
                />
              </div>
            </div>
          )}

          {/* Preview Actions */}
          <div className="mt-4 text-center">
            <a
              href={getLivePageUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Live Page
            </a>
          </div>
        </div>
      </div>

      {/* Save Custom Theme Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save as Custom Theme
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Give your custom theme a name. You&apos;ll be able to reuse this
              design on other QR codes.
            </p>

            <div className="mb-6">
              <label
                htmlFor="themeName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Theme Name
              </label>
              <input
                id="themeName"
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. My Awesome Theme"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={50}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setThemeName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsCustomTheme}
                disabled={
                  !themeName.trim() || createCustomThemeMutation.isPending
                }
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {createCustomThemeMutation.isPending
                  ? "Saving..."
                  : "Save Theme"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
