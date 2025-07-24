import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import axios from 'axios';
import { AuroraBackground } from '../components/ui/aurora-background';
import { ImagePlus, UploadCloud } from "lucide-react";


export function Home() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ file: File; description: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({ file, description: '' }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    const updated = [...images];
    updated[index].description = desc;
    setImages(updated);
  };

  const handleUploadAllImages = async () => {
    const uploaded: { url: string; description: string }[] = [];

    for (const img of images) {
      const formData = new FormData();
      formData.append('file', img.file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '');

      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        uploaded.push({
          url: res.data.secure_url,
          description: img.description
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setUploading(true);
    const uploadedImages = await handleUploadAllImages();
    setUploading(false);

    let imageInstructions = '\n\nUse the following image URLs for website generation. Each image is associated with a specific section:\n';
    uploadedImages.forEach((img, index) => {
      imageInstructions += `Image ${index + 1}: ${img.description}\nURL: ${img.url}\n`;
    });

    const finalPrompt = `${prompt.trim()}\n\n${imageInstructions}\nPlease make sure the AI uses these images according to their descriptions in the website layout. Also in the image tag add this crossOrigin="anonymous"`;

    navigate('/builder', {
      state: {
        prompt: finalPrompt
      }
    });
  };

  return (
    
  <AuroraBackground className="relative bg-[#0f172a] text-white overflow-hidden">
 
    {/* Main Content */}
    <div className="relative z-10 max-w-2xl w-full p-4 mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Wand2 className="w-12 h-12 text-blue-300" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Vibe Craft</h1>
        <p className="text-lg text-gray-200">
          Describe your dream website, and we'll help you build it step by step
        </p>
      </div>

      {/* Form */}
     <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
  <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-[#8f75ff]/30 via-transparent to-[#7fdbff]/30 shadow-[0_0_30px_rgba(127,219,255,0.15)]">
    <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-br from-[#8f75ff]/10 via-transparent to-[#7fdbff]/10 blur-[2px]" />
    <div className="relative z-10 rounded-2xl backdrop-blur-xl bg-[#0d1b2a]/85 border border-[#25354a] p-6 sm:p-8 space-y-6 shadow-2xl">

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the website you want to build..."
        className="w-full min-h-[120px] rounded-lg bg-[#1e293b] text-[#e0f2fe] placeholder-[#94a3b8] p-4 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#7fdbff] focus:border-transparent resize-none transition duration-200"
      />


        
<div className="space-y-3">
  <label className="text-[#cbd5e1] flex items-center gap-2 text-sm">
    <ImagePlus className="w-5 h-5 text-[#7fdbff]" />
    Upload Custom Images:
  </label>

  <div className="relative group bg-[#1e293b]/60 border-2 border-dashed border-[#334155] rounded-xl p-6 transition hover:border-[#8f75ff] hover:shadow-md hover:backdrop-blur-md cursor-pointer">
    <UploadCloud className="w-8 h-8 text-[#7fdbff] mx-auto group-hover:scale-110 transition-transform" />
    <p className="text-sm text-center text-[#94a3b8] mt-2">
      Drag & drop images or click to select
    </p>

    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="absolute inset-0 opacity-0 cursor-pointer"
    />
  </div>
</div>

      {/* Image Descriptions */}
      {images.map((img, index) => (
        <div key={index} className="space-y-2">
          <p className="text-sm text-[#94a3b8]">Image {index + 1}: {img.file.name}</p>
          <input
            type="text"
            placeholder="Enter description (e.g., Hero Section)"
            value={img.description}
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
            className="w-full bg-[#1e293b] text-[#e0f2fe] p-2 border border-[#334155] rounded focus:outline-none focus:ring-2 focus:ring-[#7fdbff] transition"
          />
        </div>
      ))}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-[#8f75ff] to-[#7fdbff] text-white py-3 px-6 rounded-lg font-semibold hover:brightness-110 hover:scale-[1.01] hover:shadow-[0_0_10px_#7fdbff] transition-all duration-200 disabled:opacity-50"
      >
        {uploading ? 'Uploading Images...' : 'Generate Website Plan'}
      </button>

    </div>
  </div>
</form>

      {/* Example Prompts */}
      <div className="mt-10 space-y-6 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {[
            { label: "📝 Todo App", example: "A simple todo app with add/delete/edit tasks and dark theme UI" },
            { label: "🛍️ E-commerce App", example: "An ecommerce homepage with product listings, filters, cart and responsive layout" },
            { label: "🎵 Spotify Clone", example: "A music player web app with playlist UI, dark mode, sidebar navigation like Spotify" },
            { label: "📸 Portfolio Website", example: "A personal portfolio site with hero section, about, projects grid, and contact form" },
            { label: "📊 Dashboard UI", example: "An admin dashboard with charts, table views, sidebar, and dark theme" },
          ].map(({ label, example }) => (
            <button
              key={label}
              type="button"
              onClick={() => setPrompt(example)}
              className="px-5 py-2.5 text-sm text-white bg-[#1e293b] rounded-lg shadow-xl backdrop-blur-sm hover:bg-[#334155] transition-all duration-200 hover:-translate-y-1 hover:scale-105"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </AuroraBackground>
  
);

}
