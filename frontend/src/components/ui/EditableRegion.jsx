import React from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const EditableRegion = ({ type = "image", path, label, children, className = "", style = {} }) => {
    const { isEditorMode, dispatchElementClick } = useSiteSettings();

    const handleClick = (e) => {
        if (!isEditorMode) return;
        e.preventDefault();
        e.stopPropagation();
        dispatchElementClick(type, path, label);
    };

    const baseClasses = `relative transition-all duration-300 ${className}`;
    const editorClasses = isEditorMode ? "group cursor-pointer" : "";

    return (
        <div 
            onClick={handleClick}
            className={`${baseClasses} ${editorClasses}`}
            style={style}
        >
            {isEditorMode && (
                <div className="absolute inset-0 z-50 border-2 border-transparent group-hover:border-accent-500 group-hover:bg-accent-500/10 rounded-xl transition-all duration-300 pointer-events-none">
                    <div className="absolute -top-3 -right-3 bg-accent-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        Edit {type}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};

export default EditableRegion;
