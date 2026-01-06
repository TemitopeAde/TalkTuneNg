import { useState, useCallback } from "react";

export const useHighlighter = () => {
  const [selectedColor, setSelectedColor] = useState("#ffeb3b");
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<string | null>(null);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(
    null
  );

  const handleSelection = useCallback(() => {
    if (!isHighlighting) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    clearHighlight();

    const range = selection.getRangeAt(0);

    const span = document.createElement("span");
    span.style.color = selectedColor;
    span.style.padding = "2px 4px";
    span.style.borderRadius = "3px";
    span.style.cursor = "pointer";
    span.title = "Click to remove highlight";
    span.className = "current-highlight";
    span.dataset.originalText = selectedText;

    span.onclick = (e) => {
      e.stopPropagation();
      clearHighlight();
    };

    try {
      range.surroundContents(span);
      setCurrentHighlight(selectedText);
      setHighlightElement(span);
    } catch (error) {
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        setCurrentHighlight(selectedText);
        setHighlightElement(span);
      } catch (fallbackError) {
        console.error("Failed to apply highlight:", fallbackError);
        return;
      }
    }

    selection.removeAllRanges();
  }, [isHighlighting, selectedColor]);

  const updateHighlightedText = useCallback(
    (newText: string) => {
      if (!highlightElement || !newText.trim()) return;

      highlightElement.textContent = newText.trim();

      highlightElement.dataset.originalText = newText.trim();

      setCurrentHighlight(newText.trim());

      setTimeout(() => {
        clearHighlight();
      }, 1000);
    },
    [highlightElement]
  );

  const clearHighlight = useCallback(() => {
    if (highlightElement && highlightElement.parentNode) {
      const parent = highlightElement.parentNode;
      while (highlightElement.firstChild) {
        parent.insertBefore(highlightElement.firstChild, highlightElement);
      }
      parent.removeChild(highlightElement);
    }
    setCurrentHighlight(null);
    setHighlightElement(null);
  }, [highlightElement]);

  const changeHighlightColor = useCallback(
    (color: string) => {
      setSelectedColor(color);

      if (highlightElement) {
        highlightElement.style.backgroundColor = color;
      }
    },
    [highlightElement]
  );

  const toggleHighlighting = useCallback(() => {
    setIsHighlighting((prev) => !prev);
  }, []);

  const startHighlighting = useCallback(() => {
    setIsHighlighting(true);
  }, []);

  const stopHighlighting = useCallback(() => {
    setIsHighlighting(false);
  }, []);

  const getOriginalHighlightedText = useCallback(() => {
    return highlightElement?.dataset.originalText || currentHighlight;
  }, [highlightElement, currentHighlight]);

  return {
    selectedColor,
    isHighlighting,
    currentHighlight,
    hasHighlight: !!currentHighlight,

    handleSelection,
    clearHighlight,
    updateHighlightedText,
    changeHighlightColor,
    toggleHighlighting,
    startHighlighting,
    stopHighlighting,
    setSelectedColor,
    getOriginalHighlightedText,
  };
};
