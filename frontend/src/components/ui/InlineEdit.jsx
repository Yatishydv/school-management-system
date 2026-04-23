import React, { useRef, useEffect } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const InlineEdit = ({ path, text, label = "Text Content", className = "", as: Component = "span" }) => {
    const { isEditorMode, dispatchInlineEdit, dispatchElementClick } = useSiteSettings();
    const elementRef = useRef(null);

    // Keep inner text strictly synced with props if not currently being edited
    useEffect(() => {
        if (elementRef.current && elementRef.current.textContent !== text) {
            elementRef.current.textContent = text || "";
        }
    }, [text]);

    const handleBlur = () => {
        if (!elementRef.current) return;
        const newText = elementRef.current.textContent;
        if (newText !== text) {
            dispatchInlineEdit(path, newText);
        }
    };

    const handleFocus = (e) => {
        e.stopPropagation();
        dispatchElementClick("text", path, label);
    };

    if (!isEditorMode) {
        return <Component className={className}>{text}</Component>;
    }

    return (
        <Component
            ref={elementRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onFocus={handleFocus}
            onClick={handleFocus}
            className={`${className} relative cursor-text outline-none transition-all duration-200 hover:ring-2 hover:ring-blue-500/50 hover:bg-blue-50/10 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/30 rounded-sm px-1 -mx-1`}
        >
            {text}
        </Component>
    );
};

export default InlineEdit;
