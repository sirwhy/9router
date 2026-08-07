"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[#3a2f27] bg-[#120f0d] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-6 rounded bg-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="size-5">
                  <path
                    d="M14.5 16.5 24 24l-9.5 7.5C9 31.5 6 28.2 6 24s3-7.5 8.5-7.5Zm19 0L24 24l9.5 7.5C39 31.5 42 28.2 42 24s-3-7.5-8.5-7.5Z"
                    stroke="#101114"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-white text-lg font-bold">9Router</h3>
            </div>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              The unified endpoint for AI generation. Connect, route, and manage your AI providers with ease.
            </p>
            <div className="flex gap-4">
              <a className="text-gray-400 hover:text-white transition-colors" href="https://github.com/decolua/9router" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined">code</span>
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white">Product</h4>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="#features">Features</a>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="/dashboard">Dashboard</a>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="https://github.com/decolua/9router" target="_blank" rel="noopener noreferrer">Changelog</a>
          </div>
          
          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white">Resources</h4>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="https://github.com/decolua/9router#readme" target="_blank" rel="noopener noreferrer">Documentation</a>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="https://github.com/decolua/9router" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="https://www.npmjs.com/package/9router" target="_blank" rel="noopener noreferrer">NPM</a>
          </div>
          
          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white">Legal</h4>
            <a className="text-gray-400 hover:text-[#f97815] text-sm transition-colors" href="https://github.com/decolua/9router/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-[#3a2f27] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2025 9Router. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-gray-600 hover:text-white text-sm transition-colors" href="https://github.com/decolua/9router" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="text-gray-600 hover:text-white text-sm transition-colors" href="https://www.npmjs.com/package/9router" target="_blank" rel="noopener noreferrer">NPM</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

