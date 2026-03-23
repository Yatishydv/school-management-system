// frontend/src/pages/public/Gallery.jsx
import React, { useEffect, useState } from "react";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------- FETCH IMAGES -----------------------
  const fetchGalleryImages = async () => {
    try {
      const res = await fetch("/api/gallery");  // backend route
      const data = await res.json();
      setImages(data?.images || []);
      setLoading(false);
    } catch (error) {
      console.error("Gallery Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-bg-subtle py-20 px-6">
      <h1 className="text-4xl md:text-5xl font-heading text-primary-900 text-center font-bold mb-12">
        School Gallery
      </h1>

      {/* -------------------- LOADING STATE -------------------- */}
      {loading && (
        <p className="text-center text-lg text-gray-600">Loading images...</p>
      )}

      {/* -------------------- EMPTY STATE -------------------- */}
      {!loading && images.length === 0 && (
        <p className="text-center text-lg text-gray-600">
          No images uploaded yet by the admin.
        </p>
      )}

      {/* -------------------- GALLERY GRID -------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelected(img.url)}
            className="group cursor-pointer rounded-xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={img.url}
              alt={`Gallery ${idx}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* -------------------- MODAL PREVIEW -------------------- */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt="Preview"
            className="max-w-3xl max-h-[85vh] rounded-xl shadow-xl"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
