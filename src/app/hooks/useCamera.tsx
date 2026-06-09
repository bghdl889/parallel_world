import { useRef, useCallback } from "react";

/**
 * Hook for camera / photo selection on mobile.
 * Uses <input type="file" accept="image/*" capture> for maximum compatibility.
 * Returns { openCamera, CameraInput }.
 *
 * CameraInput must be rendered in the component tree.
 * openCamera triggers the file picker.
 */
export function useCamera() {
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ""; // reset so same file can be re-selected
      inputRef.current.click();
    }
  }, []);

  const CameraInput = ({ onCapture }: { onCapture: (file: File) => void }) => (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture="environment"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onCapture(file);
      }}
    />
  );

  return { openCamera, CameraInput };
}
