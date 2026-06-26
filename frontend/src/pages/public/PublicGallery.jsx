import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name);
}

export default function PublicGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicAPI.getGallery();
        setImages(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Project Gallery</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Photos from CSR projects across India</p>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-gray-400">No images available yet.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {images.map((img, i) => (
            <Link
              key={`${img.type}-${img.project_id}-${i}`}
              to={`/public/projects/${img.project_id}?from=projects`}
              className="break-inside-avoid block group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={img.file_path}
                alt={img.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{img.title}</p>
                <p className="text-xs text-gray-500 capitalize">{img.type}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
